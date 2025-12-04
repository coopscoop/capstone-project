# -----------------------------------------------------------------
# STAGE 1: Build the React Application
# -----------------------------------------------------------------
# 
FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set production mode
ENV NODE_ENV=production

# Build the app - should use the vite.config.ts file
RUN npm run build

# -----------------------------------------------------------------
# STAGE 2: Create the Final Runtime Image (Using Nginx)
# Nginx is more performant for serving static files than 'serve'.
# -----------------------------------------------------------------
FROM nginx:alpine AS final

# **CRITICAL CHANGE 2: Nginx Port Configuration**
# We must instruct Nginx to listen on the Cloud Run required port (8080).
# Add a custom Nginx configuration file for port 8080 and SPA routing.
COPY nginx-cloudrun.conf /etc/nginx/conf.d/default.conf

# Copy the built React application (static files)
COPY --from=build /app/dist /usr/share/nginx/html

# the Nginx config with the internal backend URL at runtime.
CMD ["/bin/sh", "-c", "envsubst < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]