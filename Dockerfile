# Base stage for shared dependencies
FROM node:22-alpine3.19 AS base
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

# Build stage for production
FROM base AS build
WORKDIR /app
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine3.19 AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./

RUN npm ci --only=production

EXPOSE 3000

CMD ["node", "dist/server.js"]
