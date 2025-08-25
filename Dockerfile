FROM node:22.18.0-alpine AS base
WORKDIR /app

FROM base AS build
RUN --mount=type=bind,source=package.json,target=/app/package.json \
    --mount=type=bind,source=package-lock.json,target=/app/package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
COPY . /app/
RUN npm run build

FROM base
RUN --mount=type=bind,source=package.json,target=/app/package.json \
    --mount=type=bind,source=package-lock.json,target=/app/package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
COPY --chown=node:node --from=build /app/dist /app/dist
ENV NODE_ENV=production
USER node
EXPOSE 8080
CMD ["node", "/app/dist/index.js", "--transport", "http", "--port", "8080"]
