FROM node:24-bookworm-slim

WORKDIR /app
ENV NODE_ENV=production
ENV ZAYTOONA_POLL_MS=30000

COPY package.json ./
COPY *.mjs ./
COPY mission.json ./

RUN mkdir -p /app/.zaytoona /app/artifacts \
  && node --check daemon.mjs \
  && node --check worker.mjs

VOLUME ["/app/.zaytoona", "/app/artifacts"]

CMD ["node", "daemon.mjs"]
