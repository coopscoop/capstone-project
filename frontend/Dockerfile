FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production

# Build with relative API URL since nginx will proxy
RUN npm run build

FROM nginx:alpine AS final

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Copy nginx config as template
COPY nginx-cloudrun.conf /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

# Substitute environment variables at runtime
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && exec nginx -g 'daemon off;'"]