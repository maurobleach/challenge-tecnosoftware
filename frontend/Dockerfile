# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS dev
COPY . .
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

FROM base AS build
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=${VITE_API_URL}
COPY . .
RUN npm run build

FROM node:20-alpine AS prod
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/build ./build
ENV HOST=0.0.0.0
ENV PORT=5173
CMD ["npm", "run", "start"]