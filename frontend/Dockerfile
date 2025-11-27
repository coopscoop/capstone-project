# Frontend Dockerfile
FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist ./dist

# ENV VITE_API_URL=http://localhost:5225/api

EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080} --no-clipboard"]