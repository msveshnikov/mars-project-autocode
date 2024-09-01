# Mars Project Modernization

## Overview

This project modernizes and resurrects the Mars application using contemporary technologies and best practices, offering an immersive and interactive experience for exploring the Red Planet.

## Project Structure

-   `public/js/web.js`: Main application logic (for Browser)
-   `index.js`: Entry point for the Express server
-   `landing.html`: Static landing page
-   `package.json`: Project dependencies and scripts
-   `views/main.ejs`: Main EJS template for dynamic content
-   `eslint.config.mjs`: ESLint configuration for code quality

## Features

-   Interactive 3D Mars terrain visualization
-   Real-time weather simulation
-   Multi-language support with dynamic content localization
-   Responsive design for various devices
-   User accounts and personalized experiences
-   Server-side rendering with EJS templates
-   Progressive Web App (PWA) capabilities
-   Data visualization tools for Mars statistics

## Technology Stack

-   Frontend: HTML5, CSS3, JavaScript (ES6+)
-   Backend: Node.js with Express.js
-   3D Rendering: Three.js
-   Templating: EJS
-   Linting: ESLint with custom configuration
-   CSS Framework: Tailwind CSS


## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Development

-   Use ESLint for code linting with custom rules
-   Follow Airbnb JavaScript Style Guide
-   Use Git flow for version control
-   Utilize EJS templates for server-side rendering

## Deployment

-   Containerize the application using Docker
-   Deploy to cloud platforms (AWS, Google Cloud, or Azure)
-   Implement CI/CD pipeline using GitHub Actions


## Future Enhancements

-   Virtual Reality (VR) support
-   Augmented Reality (AR) features for mobile devices
-   Collaborative exploration features
-   Integration with NASA APIs for real-time Mars data
-   Mobile app development (iOS and Android) using React Native
-   Machine learning for terrain analysis and prediction
-   Offline mode support with service workers
-   WebGL performance optimizations for low-end devices
-   Voice commands and natural language processing
-   Social sharing features for discoveries and experiences
-   Integration with educational platforms for classroom use



## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments

-   NASA for providing Mars data and imagery
-   OpenAI for AI-assisted development
-   The open-source community for invaluable tools and libraries

# TODO

-   get rid of i18n and multilanguage EVERYWHERE!!!
-   make default page with Mars terrain 3D view
-   make Mars terrain auto move with OpenGL shifting camera

# FIX

localhost/:1 Refused to load the script 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js' because it violates the following Content Security Policy directive: "script-src 'self'". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.

localhost/:73 
 GET http://localhost:3000/js/OrbitControls.js net::ERR_ABORTED 404 (Not Found)
localhost/:1 Refused to load the script 'https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.7.7/dat.gui.min.js' because it violates the following Content Security Policy directive: "script-src 'self'". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.
localhost/:1 Refused to execute script from 'http://localhost:3000/js/OrbitControls.js' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.
localhost/:1 Refused to load the script 'https://cdn.jsdelivr.net/npm/chart.js' because it violates the following Content Security Policy directive: "script-src 'self'". Note that 'script-src-elem' was not explicitly set, so 'script-src' is used as a fallback.
localhost/:76 Refused to execute inline script because it violates the following Content Security Policy directive: "script-src 'self'". Either the 'unsafe-inline' keyword, a hash ('sha256-4Jv0gnahDHDDWMGfgK9DDb27x9DYFY/fn6c4QpSxepA='), or a nonce ('nonce-...') is required to enable inline execution.
localhost/:1 Uncaught TypeError: Failed to resolve module specifier "three". Relative references must start with either "/", "./", or "../".
manifest.json:1 
 GET http://localhost:3000/manifest.json 404 (Not Found)
manifest.json:1 Manifest: Line: 1, column: 1, Syntax error.
﻿


