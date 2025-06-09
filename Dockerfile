# Development stage
FROM node:22-alpine AS development
WORKDIR /app

RUN addgroup -g 1001 appgroup && adduser -D -u 1001 -G appgroup appuser

COPY init-db.sh /app/
RUN chmod +x /app/init-db.sh

COPY package*.json ./
COPY prisma/ ./prisma/
RUN npm install

COPY . .

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["sh", "-c", "./init-db.sh && npm run dev"]

# Production stage
FROM node:22-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 appgroup && adduser -D -u 1001 -G appgroup appuser

COPY package*.json ./
COPY prisma/ ./prisma/
RUN npm ci
COPY . .
RUN npm run build

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000
CMD ["node", "dist/server.js"]