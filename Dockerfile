# syntax=docker/dockerfile:1

# Build stage: install dependencies and produce the static bundle.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage: serve the bundle with nginx, no Node in the final image.
FROM nginx:1.29-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
