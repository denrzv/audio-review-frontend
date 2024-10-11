# Step 1: Use an official Node.js image as the base
FROM node:22 AS build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json files
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install

# Check if node_modules were installed correctly
RUN ls -l node_modules

# Step 5: Copy the rest of the application code
COPY . .

# Step 6: Set environment variable for production
ENV CI=true

# Step 7: Build the React app for production
RUN npm run build || echo "Build failed"

# Verify the existence of the build directory
RUN ls -l /app

# Step 8: Use an Nginx image to serve the static files
FROM nginx:stable-alpine

# Step 9: Copy files from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 to access the app
EXPOSE 80

# Start the Nginx server..
CMD ["nginx", "-g", "daemon off;"]