// public/js/web.js

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GUI } from "https://cdn.jsdelivr.net/npm/lil-gui@0.17/+esm";
import Chart from "https://cdn.jsdelivr.net/npm/chart.js@4.2.1/+esm";

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
            terrainResolution: 128,
            terrainHeight: 10,
            atmosphereIntensity: 1,
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

function initializeApp() {
    new MarsApp();
    fetchWeatherData();
    fetchMarsFacts();
    initializeDataVisualization();
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

document.addEventListener("DOMContentLoaded", initializeApp);

export { MarsApp };
