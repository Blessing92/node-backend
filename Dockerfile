# Base stage for shared dependencies
FROM node:20-alpine as base
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Development stage
FROM base AS development
WORKDIR /app
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

# Build stage
FROM base as build
WORKDIR /app
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=build /app/dist ./dist

# Create migrations directory and copy migrations
RUN mkdir -p ./dist/migrations/scripts
COPY --from=build /app/dist/migrations ./dist/migrations

EXPOSE 3000
CMD ["node", "dist/server.js"]
