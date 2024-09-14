# Use the latest official Node.js image for Linux
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the entire project into the container
COPY . .

# Install dependencies for both client and server
RUN cd client && npm install && \
    cd ../server && npm install

# Expose the port on which the server will run (adjust as needed)
EXPOSE 5173 
EXPOSE 8000

# Specify the command to run your application (adjust as needed)
CMD npm run dev