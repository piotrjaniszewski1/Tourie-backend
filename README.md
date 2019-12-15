# engineering-project-backend

## Getting started

### Requirements

* Node.js
* Yarn
* MongoDB
* ESLint (optionally)

### Setup

```bash
git clone git@github.com:hejmsdz/engineering-project-backend.git
cd engineering-project-backend
yarn
```

### Running the app

```bash
yarn start # start normally
yarn run start-dev # automatic restarting
```

### Environment variables

External services are configured using environment variables.
They can also be loaded from a `.env` file.

```text
MONGODB_URI=mongodb://127.0.0.1:27017/tourie
GOOGLE_MAPS_API_KEY=... # get it from https://console.developers.google.com
WIT_ACCESS_TOKEN=... # get it from https://wit.ai/your-username/your-app/settings
PORT=3000
```

## Development

[Contributing guidelines](https://github.com/hejmsdz/engineering-project/wiki/Contributing-guidelines)
