FROM node:18-alpine as build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Hardcode the env var during build
RUN echo "VITE_API_URL=https://capstone-backend-657482441130.northamerica-northeast2.run.app/api" > .env.production

# Set production mode
ENV NODE_ENV=production

# Build
RUN npm run build

# Verify it worked
RUN grep -r "capstone-backend" dist/ && echo "SUCCESS!" || echo "FAILED - still has localhost"

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["sh", "-c", "serve -s dist -l ${PORT:-8080} --no-clipboard"]