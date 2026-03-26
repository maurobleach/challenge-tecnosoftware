# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS dev
COPY . .
CMD ["npm", "run", "start:dev"]

FROM base AS build
COPY . .
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["npm", "run", "start:prod"]