FROM docker.io/library/node:24-slim AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM docker.io/library/node:24-slim AS runtime
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY drizzle ./drizzle
USER node
EXPOSE 3000
# Applies pending migrations and upserts the bears, then starts the API.
CMD ["sh", "-c", "node dist/db/migrate.js && node dist/db/seed.js && exec node dist/server.js"]
