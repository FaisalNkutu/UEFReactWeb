FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy rest of the project
COPY . .

# Set production mode
ENV NODE_ENV=production

# Export static web files using local Expo CLI
RUN npx expo export:web

# Install static file server
RUN npm install -g serve

# Expose port for browser access
EXPOSE 3000

# Serve the exported web files from 'web-build'
CMD ["serve", "-s", "web-build"]