# Postman Collection Export

## Overview
MockDraft automatically generates a Postman Collection from your OpenAPI specification. This makes it easy to test your mock API in Postman.

## Usage

### Accessing the Collection

When the server is running, the Postman collection is available at:
```
http://localhost:3000/_postman/collection.json
```

### Download Methods

**1. Direct Browser Download:**
Open the URL in your browser, and it will download automatically:
```
http://localhost:3000/_postman/collection.json
```

**2. Using curl:**
```bash
curl -O http://localhost:3000/_postman/collection.json
```

**3. Using wget:**
```bash
wget http://localhost:3000/_postman/collection.json
```

### Import into Postman

1. Open Postman
2. Click **Import** button (top left)
3. Choose one of these methods:
   - **Link**: Paste `http://localhost:3000/_postman/collection.json`
   - **File**: Upload the downloaded `collection.json` file
   - **Raw text**: Copy-paste the JSON content
4. Click **Import**

## What's Included

The generated collection includes:

### ✅ All API Endpoints
- GET, POST, PUT, DELETE, PATCH requests
- Proper HTTP methods and URLs
- Path parameters (converted from `{param}` to `:param`)

### ✅ Request Examples
- Request headers (Content-Type: application/json)
- Request body examples for POST/PUT/PATCH
- Generated from OpenAPI schema with x-faker support

### ✅ Response Examples
- Example responses for successful requests (2xx)
- Status codes and descriptions
- Response body examples

### ✅ Postman Variables Support
The collection uses `localhost` and port values that can be easily changed in Postman:
- Protocol: `http`
- Host: `localhost`
- Port: `3000` (or your custom port)

## Example Collection Structure

```json
{
  "info": {
    "name": "User API",
    "version": "1.0.0",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get all users",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/users"
      },
      "response": [
        {
          "name": "Example Response",
          "code": 200,
          "body": "[...]"
        }
      ]
    }
  ]
}
```

## Features

- **Auto-generated**: No manual work needed
- **Schema-aware**: Uses your OpenAPI schema definitions
- **Faker support**: Includes x-faker placeholders in examples
- **Real-time**: Always reflects your current OpenAPI spec
- **Standard format**: Postman Collection v2.1

## Tips

1. **Update the collection**: If you change your OpenAPI spec, just re-download the collection
2. **Environment variables**: Set up a Postman environment to easily switch between mock server and production
3. **Base URL**: You can use Postman's environment variables to change the base URL:
   ```
   {{baseUrl}}/users
   ```

## CLI Notice

The Postman collection URL is displayed when the server starts:
```
📦 Postman Collection: http://localhost:3000/_postman/collection.json
```
