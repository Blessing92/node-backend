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
FROM public.ecr.aws/lambda/nodejs:22 as production

COPY package*.json ./

RUN npm ci --production

COPY . .

RUN npm run build

CMD [ "dist/src/handler.handler" ]
