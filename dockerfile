# Use a lightweight Node image
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package management files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (ignoring dev dependencies)
RUN npm install -g pnpm && pnpm install --prod

# Copy the rest of your application code
COPY . .

# Expose the port your Express server runs on
EXPOSE 5000

# Start the server
CMD ["node", "src/server.js"]