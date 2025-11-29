FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Accept API URL as build argument
ARG VITE_API_URL
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env.production

# DEBUG: Verify the env file was created correctly
RUN echo "=== Checking .env.production ===" && \
    cat .env.production

# Explicitly set production mode
ENV NODE_ENV=production

# Build with the env var
RUN npm run build

# DEBUG: Check if the backend URL made it into the bundle
RUN echo "=== Checking built files ===" && \
    grep -r "localhost" dist/ || echo "No localhost found" && \
    grep -r "capstone-backend" dist/ || echo "Backend URL found!"

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080} --no-clipboard"]