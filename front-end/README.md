# Front End (React + TypeScript)

A simple React app built with Vite and TypeScript.

## Prerequisites
- Node.js 18+ and npm
- Running backend (Spring Boot) on http://localhost:8080

## Getting Started

Install dependencies:

```bash
cd front-end
npm install
```

Run the development server:

```bash
npm run dev
```

This project is configured with a Vite dev-server proxy so the frontend can call the backend without CORS issues.
- Frontend calls `/api/hello`
- Proxy rewrites to backend `/rest/controller/hello` at `http://localhost:8080`

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The app renders a basic counter and also calls the backend `/hello` endpoint and displays the response.
