FROM node:22.17.0-alpine AS base
WORKDIR /app

FROM base AS build
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
RUN --mount=type=cache,target=/root/.npm \
	npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM base
ENV NODE_ENV=production
USER node
COPY --chown=node:node --from=build /app/dist /app/dist
COPY --chown=node:node --from=build /app/package.json /app/package.json
COPY --chown=node:node --from=build /app/package-lock.json /app/package-lock.json
RUN --mount=type=cache,target=/root/.npm \
	npm ci --ignore-scripts --omit=dev
CMD ["node", "/app/dist/index.js"]
