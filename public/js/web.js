// public/js/web.js

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm";
import { Chart } from "https://cdn.jsdelivr.net/npm/chart.js@4.2.1/+esm";

class MarsApp {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.controls = null;
        this.terrain = null;
        this.atmosphere = null;
        this.gui = null;
        this.clock = new THREE.Clock();
        this.settings = {
            terrainResolution: 112,
            terrainHeight: 5,
            atmosphereIntensity: 2,
            dayNightCycle: true,
            autoRotate: true,
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
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById("scene-container").appendChild(this.renderer.domElement);
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
        this.controls.autoRotate = this.settings.autoRotate;
        this.controls.autoRotateSpeed = 0.5;
    }

    createTerrain() {
        const geometry = new THREE.PlaneGeometry(
            200,
            200,
            this.settings.terrainResolution,
            this.settings.terrainResolution
        );
        const material = new THREE.MeshPhongMaterial({
            color: 0xaa6633,
            wireframe: false,
            flatShading: true,
        });
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
        const noise = new SimplexNoise();
        return (
            this.settings.terrainHeight *
            (noise.noise2D(x * 0.05, y * 0.05) +
                0.5 * noise.noise2D(x * 0.1, y * 0.1) +
                0.25 * noise.noise2D(x * 0.2, y * 0.2))
        );
    }

    createAtmosphere() {
        const geometry = new THREE.SphereGeometry(120, 64, 64);
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
          gl_FragColor = vec4(0.6, 0.3, 0.1, intensity * atmosphereIntensity);
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
        this.gui.add(this.settings, "terrainResolution", 128, 1024, 128).onChange(() => this.createTerrain());
        this.gui.add(this.settings, "terrainHeight", 0, 20).onChange(() => this.updateTerrainGeometry());
        this.gui.add(this.settings, "atmosphereIntensity", 0, 2).onChange((value) => {
            this.atmosphere.material.uniforms.atmosphereIntensity.value = value;
        });
        this.gui.add(this.settings, "dayNightCycle");
        this.gui.add(this.settings, "autoRotate").onChange((value) => {
            this.controls.autoRotate = value;
        });
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

class SimplexNoise {
    constructor() {
        this.grad3 = [
            [1, 1, 0],
            [-1, 1, 0],
            [1, -1, 0],
            [-1, -1, 0],
            [1, 0, 1],
            [-1, 0, 1],
            [1, 0, -1],
            [-1, 0, -1],
            [0, 1, 1],
            [0, -1, 1],
            [0, 1, -1],
            [0, -1, -1],
        ];
        this.p = [];
        for (let i = 0; i < 256; i++) {
            this.p[i] = Math.floor(Math.random() * 256);
        }
        this.perm = [];
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }

    dot(g, x, y) {
        return g[0] * x + g[1] * y;
    }

    noise2D(xin, yin) {
        let n0, n1, n2;
        const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;
        let i1, j1;
        if (x0 > y0) {
            i1 = 1;
            j1 = 0;
        } else {
            i1 = 0;
            j1 = 1;
        }
        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1.0 + 2.0 * G2;
        const y2 = y0 - 1.0 + 2.0 * G2;
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.perm[ii + this.perm[jj]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
        let t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 < 0) n0 = 0.0;
        else {
            t0 *= t0;
            n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0);
        }
        let t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 < 0) n1 = 0.0;
        else {
            t1 *= t1;
            n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
        }
        let t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 < 0) n2 = 0.0;
        else {
            t2 *= t2;
            n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
        }
        return 70.0 * (n0 + n1 + n2);
    }
}

function initializeApp() {
    new MarsApp();
    fetchWeatherData();
    fetchMarsFacts();
    initializeDataVisualization();
    setupDynamicTheming();
}

async function fetchWeatherData() {
    try {
        const response = await fetch("/api/weather");
        const weatherData = await response.json();
        updateWeatherDisplay(weatherData);
    } catch (error) {
        console.error("Error fetching weather data:", error);
    }
}

function updateWeatherDisplay(weatherData) {
    const weatherDisplay = document.getElementById("weather-display");
    weatherDisplay.innerHTML = `
    <p>Temperature: ${weatherData.temperature}°C</p>
    <p>Pressure: ${weatherData.pressure} hPa</p>
    <p>Wind Speed: ${weatherData.windSpeed} m/s</p>
  `;
}

async function fetchMarsFacts() {
    try {
        const response = await fetch("/api/facts");
        const facts = await response.json();
        updateFactsList(facts);
    } catch (error) {
        console.error("Error fetching Mars facts:", error);
    }
}

function updateFactsList(facts) {
    const factsList = document.getElementById("facts-list");
    factsList.innerHTML = "";
    facts.forEach((fact) => {
        const li = document.createElement("li");
        li.textContent = fact.content;
        factsList.appendChild(li);
    });
}

function initializeDataVisualization() {
    const ctx = document.getElementById("chart-container").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Temperature", "Pressure", "Wind Speed"],
            datasets: [
                {
                    label: "Mars Weather Data",
                    data: [20, 6.1, 7.2],
                    backgroundColor: ["rgba(255, 99, 132, 0.2)", "rgba(54, 162, 235, 0.2)", "rgba(255, 206, 86, 0.2)"],
                    borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)", "rgba(255, 206, 86, 1)"],
                    borderWidth: 1,
                },
            ],
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
            responsive: true,
        },
    });
}

function setupDynamicTheming() {
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour < 18;
    document.body.classList.toggle("night-mode", !isDaytime);
}

document.addEventListener("DOMContentLoaded", initializeApp);

export { MarsApp };
