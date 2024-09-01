import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;

await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/mars_project", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        password: String,
        savedLocations: [{ type: Object }],
        preferences: { type: Object, default: {} },
    })
);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                ...helmet.contentSecurityPolicy.getDefaultDirectives(),
                "script-src": ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
            },
        },
    })
);
app.use(morgan("combined"));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});
app.use(limiter);

app.use(
    session({
        secret: process.env.SESSION_SECRET || "mars_project_secret",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: process.env.NODE_ENV === "production" },
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            const user = await User.findOne({ username: username });
            if (!user) return done(null, false);
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) return done(null, false);
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    })
);

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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("main", { user: req.user });
});

app.get("/explore", (req, res) => {
    res.render("main", { user: req.user });
});

app.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.redirect("/");
    } catch (error) {
        res.status(500).json({ error: "Error registering new user" });
    }
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/explore",
        failureRedirect: "/",
    })
);

app.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ error: "Error logging out" });
        }
        res.redirect("/");
    });
});

app.get("/api/terrain", (req, res) => {
    const terrain = generateTerrain();
    res.json(terrain);
});

app.post("/api/save-location", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        const { location } = req.body;
        req.user.savedLocations.push(location);
        await req.user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error saving location" });
    }
});

app.get("/api/facts", (req, res) => {
    const facts = [
        { id: 1, content: "Mars is the fourth planet from the Sun." },
        { id: 2, content: "Mars is often called the Red Planet due to its reddish appearance." },
        { id: 3, content: "Mars has two small moons, Phobos and Deimos." },
    ];
    res.json(facts);
});

app.get("/api/weather", (req, res) => {
    const weather = generateWeather();
    res.json(weather);
});

app.post("/api/preferences", async (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    try {
        req.user.preferences = { ...req.user.preferences, ...req.body };
        await req.user.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error saving preferences" });
    }
});

app.get("/api/statistics", (req, res) => {
    const statistics = generateStatistics();
    res.json(statistics);
});

function generateTerrain() {
    const size = 128;
    const terrain = new Float32Array(size * size);
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const x = (i / size) * 10;
            const y = (j / size) * 10;
            terrain[i * size + j] = Math.sin(x) * Math.cos(y) * 5;
        }
    }
    return terrain;
}

function generateWeather() {
    return {
        temperature: Math.round((Math.random() * 60 - 30) * 10) / 10,
        pressure: Math.round((Math.random() * 10 + 5) * 100) / 100,
        windSpeed: Math.round(Math.random() * 100) / 10,
    };
}

function generateStatistics() {
    return {
        averageTemperature: -63,
        highestPeak: 21.9,
        deepestCanyon: 7,
        atmosphereComposition: {
            carbonDioxide: 95.32,
            nitrogen: 2.7,
            argon: 1.6,
        },
    };
}

io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
        if (req.header("x-forwarded-proto") !== "https") {
            res.redirect(`https://${req.header("host")}${req.url}`);
        } else {
            next();
        }
    });
}

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export default app;
