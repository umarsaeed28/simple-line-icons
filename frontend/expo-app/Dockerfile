# Multi-stage build for React Native Expo app
FROM node:18-alpine AS builder

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Development stage
FROM node:18-alpine AS development

# Install system dependencies for Expo
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    curl

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Expose Expo ports
EXPOSE 19000 19001 19002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:19000 || exit 1

# Start Expo development server
CMD ["npm", "start"]