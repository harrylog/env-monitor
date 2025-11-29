# Frontend Dockerfile - Angular
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 4200

# Start Angular dev server (accessible from outside container)
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--poll", "2000"]
