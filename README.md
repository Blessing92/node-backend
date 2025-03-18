# Node.js Backend with TypeScript

## Project Overview

This project is a backend service built using Node.js and TypeScript, with MySQL as the database. It is containerized using Docker and orchestrated with Docker Compose for easy deployment and management.

## Features

- TypeScript support for type safety and better development experience
- MySQL database for persistent storage
- Docker Compose for easy container orchestration
- Environment-based configuration using dotenv
- Logging with Pino

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)

## Installation

1. **Clone the repository:**

   ```sh
   git clone https://github.com/your-repository.git
   cd your-repository
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Create an environment file:**
   Copy `.env.example` to `.env` and update the values accordingly:

   ```sh
   cp .env.example .env
   ```

4. **Start the application with Docker Compose:**

   ```sh
   docker-compose up --build
   ```

5. **Run the application locally (without Docker):**
   ```sh
   npm run dev
   ```

## Project Structure

```
├── src
│   ├── config       # Configuration files
│   ├── controllers  # Request handlers
│   ├── middlewares  # Express middlewares
│   ├── models       # Database models
│   ├── routes       # API routes
│   ├── services     # Business logic
│   ├── utils        # Utility functions
│   ├── server.ts     # Entry point
├── Dockerfile       # Docker configuration
├── docker-compose.yml # Docker Compose configuration
├── tsconfig.json    # TypeScript configuration
├── .env.example     # Environment variables example
└── README.md        # Project documentation
```

## API Endpoints

| Method | Endpoint    | Description  |
| ------ | ----------- | ------------ |
| GET    | /api/health | Health check |

## Running Migrations

Run database migrations using:

```sh
npm run migrate
```

## Logging

Logging is handled with Pino. Logs are saved to `./logs/app.log`. You can configure CloudWatch integration if needed.

## Testing

Run tests with:

```sh
npm test
```

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

## License

This project is licensed under the MIT License.
