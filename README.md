# MockDraft

> **The era of waiting for the backend is over.**

MockDraft is a powerful CLI tool that converts your OpenAPI (Swagger) file into a live mock server in seconds. It intelligently generates realistic data, allowing you to develop and test your frontend applications without waiting for the backend implementation.

## Features

- 🚀 **Instant Mock Server**: Turn any valid OpenAPI 3.0+ file into a running server instantly.
- 🧠 **Smart Data Generation**: Uses intelligent heuristics to generate realistic data (names, emails, dates) based on your schema.
- 🛠 **CLI Powered**: Simple command-line interface for easy integration into your workflow.
- ⚡ **Hot Reloading:** (Coming Soon) Automatically updates the server when your OpenAPI file changes.

## Installation

```bash
npm install -g mockdraft
```

## Usage

Start the mock server with your OpenAPI definition:

```bash
mockdraft start ./path/to/openapi.yaml --port 3000
```

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev start ./openapi.yaml
   ```

## License

MIT
