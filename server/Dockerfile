FROM node:20-slim

# Build deps for better-sqlite3 in case no prebuilt binary matches this platform.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY index.js ./

ENV PORT=3000
ENV DB_PATH=/data/highscores.sqlite
EXPOSE 3000
CMD ["node", "index.js"]
