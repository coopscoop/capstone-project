FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=production

RUN npm run build

FROM nginx:alpine AS final

# Copy nginx config as a template (nginx will process it automatically)
COPY nginx.conf /etc/nginx/templates/default.conf.template

COPY --from=build /app/dist /usr/share/nginx/html

# Let nginx's entrypoint handle the envsubst - just start nginx normally
CMD ["nginx", "-g", "daemon off;"]