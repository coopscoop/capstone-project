FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

FROM nginx:alpine AS final

# Copy the nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built React application
COPY --from=build /app/dist /usr/share/nginx/html

# Start nginx
CMD ["nginx", "-g", "daemon off;"]