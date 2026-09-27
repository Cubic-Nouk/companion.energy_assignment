# syntax=docker/dockerfile:1

# Dependencies, shared by the dev server and the production build.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Dev server with hot reload. The source is bind-mounted by docker-compose, not copied.
FROM deps AS dev
EXPOSE 5173
CMD ["npm", "run", "dev"]

# Production bundle.
FROM deps AS build
COPY . .
RUN npm run build

# Runtime stage: serve the bundle with nginx, no Node in the final image.
FROM nginx:1.29-alpine AS runtime
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
