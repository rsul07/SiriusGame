FROM node:20 AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# этап прод
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html