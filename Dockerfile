FROM node:18-alpine

# Install git, git-lfs, and curl early so we can clone with LFS and bust cache
RUN apk add --no-cache git git-lfs curl && git lfs install

# Where the app will live
WORKDIR /app

# Build arguments (can be overridden by the platform if needed)
ARG REPO_URL=https://github.com/chgenberg/functionalfoods.git
ARG REPO_REF=main

# Bust cache by embedding the latest commit SHA for the target ref
# This ensures the next layer re-runs when the upstream repo changes
RUN echo "Fetching latest commit SHA for ${REPO_REF}..." && \
    LATEST_SHA=$(curl -s https://api.github.com/repos/chgenberg/functionalfoods/commits/${REPO_REF} | sed -n 's/.*"sha": "\([a-f0-9]\{40\}\)".*/\1/p' | head -n1) && \
    echo "Latest SHA: ${LATEST_SHA}" && \
    echo ${LATEST_SHA} > /LATEST_SHA

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