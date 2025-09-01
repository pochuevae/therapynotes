# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies with specific flags
RUN npm ci --omit=dev --silent

# Copy source code
COPY . .

# Build client
RUN cd client && npm ci --omit=dev --silent && npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
