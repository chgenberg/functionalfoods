FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port (Railway will set PORT env var, default to 3000)
EXPOSE ${PORT:-3000}

# Start the application
CMD ["npm", "start"] 