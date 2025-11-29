# Backend Dockerfile - Node.js + TypeScript + Express + SQLite
FROM node:18-alpine

# Install wget for health checks
RUN apk add --no-cache wget

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for ts-node-dev)
RUN npm ci

# Copy source code
COPY . .

# Create data directory for SQLite
RUN mkdir -p data

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
