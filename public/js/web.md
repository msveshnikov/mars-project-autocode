# MarsApp Documentation

## Overview

`web.js` is a crucial client-side JavaScript file for the MarsApp project. It creates an interactive 3D visualization of Mars using Three.js, implements weather data fetching and display, and includes various UI components. This file is part of the public assets and is likely loaded by the main HTML file.

## Classes

### MarsApp

The main class responsible for creating and managing the 3D Mars visualization.

#### Constructor

```javascript
constructor();
```

Initializes the MarsApp instance, setting up the scene, camera, renderer, and other core components.

#### Methods

##### init()

Sets up the 3D environment, including renderer, camera, lights, controls, terrain, atmosphere, GUI, and event listeners.

##### setupRenderer()

Configures the Three.js WebGL renderer.

##### setupCamera()

Sets up the camera position and orientation.

##### setupLights()

Adds ambient and directional lights to the scene.

##### setupControls()

Initializes OrbitControls for camera manipulation.

##### createTerrain()

Generates the Mars terrain using a plane geometry and custom height map.

##### updateTerrainGeometry()

Updates the terrain geometry based on current settings.

##### generateHeight(x, y)

Generates height values for the terrain using Simplex noise.

-   Parameters:
    -   `x`: X-coordinate
    -   `y`: Y-coordinate
-   Returns: Height value

##### createAtmosphere()

Creates a shader-based atmosphere effect around Mars.

##### setupGUI()

Initializes the GUI for adjusting visualization parameters.

##### addEventListeners()

Sets up event listeners, particularly for window resizing.

##### onWindowResize()

Handles window resize events, updating camera and renderer accordingly.

##### animate()

Main animation loop, updates controls and renders the scene.

### SimplexNoise

A class implementing the Simplex noise algorithm for terrain generation.

#### Methods

##### noise2D(xin, yin)

Generates 2D Simplex noise.

-   Parameters:
    -   `xin`: X-coordinate input
    -   `yin`: Y-coordinate input
-   Returns: Noise value

## Functions

### initializeApp()

Entry point function that initializes the MarsApp and other components.

### fetchWeatherData()

Asynchronously fetches weather data from the server.

### updateWeatherDisplay(weatherData)

Updates the weather display with fetched data.

-   Parameters:
    -   `weatherData`: Object containing weather information

### fetchMarsFacts()

Asynchronously fetches Mars facts from the server.

### updateFactsList(facts)

Updates the facts list in the UI.

-   Parameters:
    -   `facts`: Array of fact objects

### initializeDataVisualization()

Sets up a Chart.js visualization for weather data.

### setupDynamicTheming()

Applies day/night theming based on the current time.

## Usage

The script is designed to be loaded and executed in a web browser environment. It's typically included in the main HTML file of the application:

```html
<script type="module" src="/public/js/web.js"></script>
```

The `initializeApp` function is set to run when the DOM content is loaded:

```javascript
document.addEventListener("DOMContentLoaded", initializeApp);
```

## Dependencies

-   Three.js: For 3D rendering
-   OrbitControls: For camera control
-   lil-gui: For creating the GUI
-   Chart.js: For data visualization

## Project Context

This file is part of the `public/js` directory in the MarsApp project. It works in conjunction with the server-side code (likely in `index.js`) and the HTML templates in the `views` directory. The 3D visualization, weather data display, and other interactive elements created by this script are integrated into the main user interface of the application.
