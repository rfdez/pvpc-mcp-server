FROM node:22.17.0-alpine AS base
WORKDIR /app

FROM base AS build
COPY package*.json /app/
RUN --mount=type=cache,target=/root/.npm \
	npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM base
COPY --chown=node:node --from=build /app/dist /app/dist
COPY --chown=node:node --from=build /app/package*.json /app/
RUN --mount=type=cache,target=/root/.npm-production \
	npm ci --ignore-scripts --omit=dev
ENV NODE_ENV=production
USER node
CMD ["node", "/app/dist/index.js"]
