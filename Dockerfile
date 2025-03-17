# https://www.tomray.dev/nestjs-docker-production
# https://docs.nestjs.com/deployment#dockerizing-your-application

# Use the official Node.js Alpine image as the base image
FROM node:current-alpine

# Install dependencies
RUN apk add --no-cache wkhtmltopdf && rm -rf /var/cache/apk/*

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the application dependencies
RUN npm ci

# Copy the rest of the application files
COPY . .

# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/main"]

