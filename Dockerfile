FROM node:18-alpine

# Optional: tools you still need
RUN apk add --no-cache git git-lfs && git lfs install || true

# App dir
WORKDIR /app

# Copy only package manifests first (better layer caching for deps)
COPY package*.json ./

# Install deps (include dev for build phase) – use install instead of ci to resolve lockfile drift in CI
RUN npm install --include=dev --no-audit --no-fund

# Copy prisma schema separately to allow prisma generate cache if only code changes
COPY prisma ./prisma
RUN npx prisma generate

# Copy the rest of the source
COPY . .

# Cache-bust using Railway's injected commit SHA if available
ARG RAILWAY_GIT_COMMIT_SHA
ENV NEXT_PUBLIC_BUILD_ID=${RAILWAY_GIT_COMMIT_SHA}

# Build (clear Next cache before build to avoid stale)
RUN rm -rf .next tsconfig.tsbuildinfo && npm run build

# Prune dev deps for runtime image size
RUN npm prune --production

EXPOSE 3000
CMD ["npm", "start"] 