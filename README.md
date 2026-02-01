# MockDraft

> **The era of waiting for the backend is over.**

MockDraft is a powerful, AI-accelerated CLI tool that converts your OpenAPI (Swagger) file into a live, intelligent mock server in seconds. It allows frontend and mobile developers to build features without being blocked by backend availability.

## 🚀 Features

- **Instant Mock Server**: Turn any valid OpenAPI 3.0+ file (YAML or JSON) into a running server instantly.
- **🧠 Smart Data Generation**: Uses `json-schema-faker` and `@faker-js/faker` to generate realistic data.
  - Supports `x-faker` schema extensions for precise control (e.g. usernames, emails, avatars).
- **🔥 Hot Reload**: Automatically watches your OpenAPI file and restarts the server on changes.
- **⏱️ Network Simulation**: Simulate network latency (500-1500ms) to test loading states.
- **💥 Chaos Mode**: Simulate server instability with random 500 errors (10% chance) to test error handling.
- **✨ Interactive CLI**: User-friendly wizard to auto-discover files and configure options.

## 📦 Installation

```bash
npm install -g mockdraft
```

## 🛠️ Usage

### Quick Start (Interactive Mode)
Simply run the command without arguments to launch the wizard:
```bash
mockdraft
```

### Command Line Arguments
```bash
# Basic usage
mockdraft start ./openapi.yaml --port 3000

# Enable Hot Reload
mockdraft start ./openapi.yaml --watch

# Enable Network Latency Simulation
mockdraft start ./openapi.yaml --delay

# Enable Chaos Mode (Random 500 Errors)
mockdraft start ./openapi.yaml --chaos

# Combine flags
mockdraft start ./ecommerce.json --watch --delay --chaos
```

## 📝 Configuration

### Smart Data with `x-faker`
You can control the generated data by adding `x-faker` properties to your OpenAPI schema:

```yaml
User:
  type: object
  properties:
    id:
      type: string
      format: uuid
      x-faker: "string.uuid"
    email:
      type: string
      x-faker: "internet.email"
    avatar:
      type: string
      x-faker: "image.avatar"
```

## Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/sametuca/mockdraft
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Run in development mode**
   ```bash
   npm run dev
   ```

## License

MIT

