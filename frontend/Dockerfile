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

EXPOSE 3000
ENV VITE_API_URL=http://localhost:5225/api

CMD ["serve", "-s", "dist", "-l", "3000"]