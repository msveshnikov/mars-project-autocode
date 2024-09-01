# Mars Project Modernization

## Overview

This project modernizes and resurrects the Mars application using contemporary technologies and best practices, offering an immersive and interactive experience for exploring the Red Planet.

## Project Structure

-   `public/js/web.js`: Main application logic (for Browser)
-   `public/css/styles.css`: Custom styles for the application
-   `public/manifest.json`: Web App Manifest for PWA support
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
-   Server-side rendering with EJS templates
-   Progressive Web App (PWA) capabilities
-   Data visualization tools for Mars statistics
-   Offline mode support
-   Dynamic theming based on Mars time of day

## Technology Stack

-   Frontend: HTML5, CSS3, JavaScript (ES6+)
-   Backend: Node.js with Express.js
-   3D Rendering: Three.js
-   Templating: EJS
-   Linting: ESLint with custom configuration
-   CSS Framework: Tailwind CSS
-   PWA: Service Workers and Web App Manifest

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Development

-   Use ESLint for code linting with custom rules
-   Use Git flow for version control
-   Utilize EJS templates for server-side rendering
-   Implement lazy loading for performance optimization

## Deployment

-   Containerize the application using Docker
-   Deploy to cloud platforms (AWS, Google Cloud, or Azure)
-   Implement CI/CD pipeline using GitHub Actions
-   Use CDN for static asset delivery

## Future Enhancements

-   Virtual Reality (VR) support using WebXR
-   Augmented Reality (AR) features for mobile devices
-   Collaborative exploration features with WebRTC
-   Integration with NASA APIs for real-time Mars data
-   WebGL-based terrain generation for custom Mars landscapes
-   Voice commands and natural language processing for navigation

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Acknowledgments

-   NASA for providing Mars data and imagery
-   OpenAI for AI-assisted development
-   The open-source community for invaluable tools and libraries

# TODO

-   Fix TypeError: Cannot read properties of undefined (reading 'map')
    at createTemperatureMap (weather:67:40)
