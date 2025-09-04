# Use Node.js as the base image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install --production=false

# Copy the rest of the application code
COPY . .

# Generate Prisma client for linux target inside the image
RUN npx prisma generate --schema=prisma/schema.prisma

# Build the Next.js application
RUN npm run build

# Add an entrypoint script (will be added below)
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js application
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]