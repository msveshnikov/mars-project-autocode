const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const i18next = require("i18next");
const i18nextMiddleware = require("i18next-http-middleware");
const Backend = require("i18next-fs-backend");
const THREE = require("three");
const { GUI } = require("dat.gui");
const { OrbitControls } = require("three/examples/jsm/controls/OrbitControls");

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect("mongodb://localhost/mars_project", { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        password: String,
        savedLocations: [{ type: Object }],
    })
);

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: "mars_project_secret",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());
app.use(passport.session());

i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
        backend: {
            loadPath: "./locales/{{lng}}/{{ns}}.json",
        },
        fallbackLng: "en",
        preload: ["en", "es", "fr", "de", "zh", "ar"],
    });

app.use(i18nextMiddleware.handle(i18next));

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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "landing.html"));
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

app.get("/explore", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/");
    }
    res.sendFile(path.join(__dirname, "public", "explore.html"));
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
        { id: 1, content: req.t("fact1") },
        { id: 2, content: req.t("fact2") },
        { id: 3, content: req.t("fact3") },
    ];
    res.json(facts);
});

function generateTerrain() {
    const geometry = new THREE.PlaneGeometry(100, 100, 128, 128);
    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        positions[i + 2] = 10 * (Math.sin(x * 0.1) + Math.cos(y * 0.1));
    }
    return positions;
}

class MarsApp {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.controls = null;
        this.terrain = null;
        this.atmosphere = null;
        this.gui = null;
        this.clock = new THREE.Clock();
        this.settings = {
            terrainResolution: 128,
            terrainHeight: 10,
            atmosphereIntensity: 1,
            dayNightCycle: true,
        };

        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupCamera();
        this.setupLights();
        this.setupControls();
        this.createTerrain();
        this.createAtmosphere();
        this.setupGUI();
        this.addEventListeners();
        this.animate();
    }

    setupRenderer() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
    }

    setupCamera() {
        this.camera.position.set(0, 50, 100);
        this.camera.lookAt(0, 0, 0);
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
    }

    createTerrain() {
        const geometry = new THREE.PlaneGeometry(
            100,
            100,
            this.settings.terrainResolution,
            this.settings.terrainResolution
        );
        const material = new THREE.MeshPhongMaterial({ color: 0xaa6633, wireframe: false });
        this.terrain = new THREE.Mesh(geometry, material);
        this.terrain.rotation.x = -Math.PI / 2;
        this.updateTerrainGeometry();
        this.scene.add(this.terrain);
    }

    updateTerrainGeometry() {
        const positions = this.terrain.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            positions[i + 2] = this.generateHeight(x, y);
        }
        this.terrain.geometry.attributes.position.needsUpdate = true;
        this.terrain.geometry.computeVertexNormals();
    }

    generateHeight(x, y) {
        return this.settings.terrainHeight * (Math.sin(x * 0.1) + Math.cos(y * 0.1));
    }

    createAtmosphere() {
        const geometry = new THREE.SphereGeometry(60, 32, 32);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                atmosphereIntensity: { value: this.settings.atmosphereIntensity },
            },
            vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
            fragmentShader: `
        uniform float atmosphereIntensity;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 4.0);
          gl_FragColor = vec4(0.3, 0.6, 1.0, intensity * atmosphereIntensity);
        }
      `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
        });
        this.atmosphere = new THREE.Mesh(geometry, material);
        this.scene.add(this.atmosphere);
    }

    setupGUI() {
        this.gui = new GUI();
        this.gui.add(this.settings, "terrainResolution", 16, 256, 16).onChange(() => this.createTerrain());
        this.gui.add(this.settings, "terrainHeight", 0, 20).onChange(() => this.updateTerrainGeometry());
        this.gui.add(this.settings, "atmosphereIntensity", 0, 2).onChange((value) => {
            this.atmosphere.material.uniforms.atmosphereIntensity.value = value;
        });
        this.gui.add(this.settings, "dayNightCycle");
    }

    addEventListeners() {
        window.addEventListener("resize", () => this.onWindowResize(), false);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        if (this.settings.dayNightCycle) {
            const time = this.clock.getElapsedTime();
            const lightIntensity = (Math.sin(time * 0.1) + 1) / 2;
            this.scene.children[1].intensity = lightIntensity;
        }
        this.renderer.render(this.scene, this.camera);
    }
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
