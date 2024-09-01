import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import i18next from 'i18next';
import i18nextMiddleware from 'i18next-http-middleware';
import Backend from 'i18next-fs-backend';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/mars_project', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  password: String,
  savedLocations: [{ type: Object }],
}));

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(helmet());
app.use(morgan('combined'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

app.use(session({
  secret: process.env.SESSION_SECRET || 'mars_project_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
}));

app.use(passport.initialize());
app.use(passport.session());

await i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    fallbackLng: 'en',
    preload: ['en', 'es', 'fr', 'de', 'zh', 'ar'],
  });

app.use(i18nextMiddleware.handle(i18next));

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });
    if (!user) return done(null, false);
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('main');
});

app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ error: 'Error registering new user' });
  }
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/explore',
  failureRedirect: '/',
}));

app.get('/explore', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('explore');
});

app.get('/api/terrain', (req, res) => {
  const terrain = generateTerrain();
  res.json(terrain);
});

app.post('/api/save-location', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const { location } = req.body;
    req.user.savedLocations.push(location);
    await req.user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Error saving location' });
  }
});

app.get('/api/facts', (req, res) => {
  const facts = [
    { id: 1, content: req.t('fact1') },
    { id: 2, content: req.t('fact2') },
    { id: 3, content: req.t('fact3') },
  ];
  res.json(facts);
});

function generateTerrain() {
  const size = 128;
  const terrain = new Float32Array(size * size);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const x = i / size * 10;
      const y = j / size * 10;
      terrain[i * size + j] = Math.sin(x) * Math.cos(y) * 5;
    }
  }
  return terrain;
}

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;