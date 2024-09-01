Based on the provided README.md and the request for API documentation, it appears that this project doesn't explicitly define API endpoints. The project seems to be primarily a web application for visualizing Mars data, rather than a REST API service.

However, to assist you in creating API documentation for future development or for any underlying API functionality that might be added, I'll provide a template for how you could structure API documentation for this Mars Project. You can adapt this template as needed when actual API endpoints are implemented.

# Mars Project API Documentation

## Base URL

All API requests should be made to: `https://mars-project-autocode.onrender.com/api/`

## Authentication

Currently, no authentication is required for API access. This may change in future versions.

## Rate Limiting

There are currently no rate limits in place. This may be subject to change as the API evolves.

## API Endpoints

### Get Mars Weather

Retrieves the current simulated weather conditions on Mars.

-   **URL:** `/weather`
-   **Method:** `GET`
-   **URL Params:** None
-   **Data Params:** None
-   **Success Response:**
    -   **Code:** 200
    -   **Content:**
        ```json
        {
            "temperature": -63,
            "wind_speed": 7.2,
            "pressure": 610,
            "humidity": 0.03
        }
        ```
-   **Error Response:**
    -   **Code:** 503
    -   **Content:** `{ "error": "Weather simulation service unavailable" }`

### Get Terrain Data

Retrieves 3D terrain data for a specific region on Mars.

-   **URL:** `/terrain`
-   **Method:** `GET`
-   **URL Params:**
    -   `lat=[float]` (required)
    -   `lon=[float]` (required)
    -   `radius=[integer]` (optional, default=10)
-   **Data Params:** None
-   **Success Response:**
    -   **Code:** 200
    -   **Content:**
        ```json
        {
          "vertices": [...],
          "indices": [...],
          "normals": [...]
        }
        ```
-   **Error Response:**
    -   **Code:** 400
    -   **Content:** `{ "error": "Invalid coordinates" }`

### Submit User Discovery

Allows users to submit a discovery they've made while exploring the Mars terrain.

-   **URL:** `/discoveries`
-   **Method:** `POST`
-   **URL Params:** None
-   **Data Params:**
    ```json
    {
        "title": "Unusual Rock Formation",
        "description": "Spotted a rock formation that resembles Earth's hoodoos",
        "coordinates": {
            "lat": 4.5,
            "lon": -137.4
        },
        "image_url": "https://example.com/discovery-image.jpg"
    }
    ```
-   **Success Response:**
    -   **Code:** 201
    -   **Content:** `{ "message": "Discovery submitted successfully", "id": "12345" }`
-   **Error Response:**
    -   **Code:** 400
    -   **Content:** `{ "error": "Invalid discovery data" }`

## Error Handling

All endpoints may return the following error responses:

-   **Code:** 500
-   **Content:** `{ "error": "Internal server error" }`

-   **Code:** 404
-   **Content:** `{ "error": "Not found" }`

## Data Formats

All API requests and responses use JSON format.

---

This template provides a structure for documenting API endpoints that could be relevant to the Mars Project. As you develop actual API functionality, you can fill in the details for each endpoint, add new endpoints as needed, and include any specific authentication or rate limiting information that becomes applicable.
