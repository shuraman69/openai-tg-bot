FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

ENV PORT=3000
# Copy app files
COPY . .

# Expose port
EXPOSE $PORT

# Start the bot
CMD ["npm", "start"]
