FROM node:18-alpine

# Install git and git-lfs early so we can clone with LFS
RUN apk add --no-cache git git-lfs && git lfs install

# Where the app will live
WORKDIR /app

# Build arguments (can be overridden by the platform if needed)
ARG REPO_URL=https://github.com/chgenberg/functionalfoods.git
ARG REPO_REF=main

# Clone the repository with shallow history and pull LFS objects
RUN git clone --depth 1 --branch ${REPO_REF} ${REPO_URL} . \
	&& git lfs pull || true

# Install dependencies (include dev deps for build)
RUN npm ci --include=dev

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Prune dev dependencies for runtime image size
RUN npm prune --production

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 