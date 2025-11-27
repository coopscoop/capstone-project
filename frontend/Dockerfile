FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Accept API URL as build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build with the env var
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080} --no-clipboard"]