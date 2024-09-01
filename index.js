import express from "express";
import path from "path";
import { fileURLToPath } from "url";
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

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
    res.render("landing");
});

app.get("/explore", (req, res) => {
    res.render("main");
});

app.get("/weather", (req, res) => {
    res.render("weather");
});

app.get("/api/terrain", (req, res) => {
    const terrain = generateTerrain();
    res.json(terrain);
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

app.get("/api/statistics", (req, res) => {
    const statistics = generateStatistics();
    res.json(statistics);
});

app.get("/api/weather-map", (req, res) => {
    const weatherMap = generateWeatherMap();
    res.json(weatherMap);
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
        temperatureMap: generateTemperatureMap(),
        windMap: generateWindMap(),
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

function generateWeatherMap() {
    return {
        temperatureMap: generateTemperatureMap(),
        windMap: generateWindMap(),
    };
}

function generateTemperatureMap() {
    const size = 10;
    const temperatureMap = new Array(size * size);
    for (let i = 0; i < size * size; i++) {
        temperatureMap[i] = Math.round((Math.random() * 60 - 30) * 10) / 10;
    }
    return temperatureMap;
}

function generateWindMap() {
    const size = 20;
    const windMap = new Array(size * size);
    for (let i = 0; i < size * size; i++) {
        windMap[i] = {
            speed: Math.round(Math.random() * 100) / 10,
            direction: Math.round(Math.random() * 360),
        };
    }
    return windMap;
}

io.on("connection", (socket) => {
    console.log("A user connected");
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

    setInterval(() => {
        socket.emit("weatherUpdate", generateWeather());
    }, 60000);
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
