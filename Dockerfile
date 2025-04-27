# Stage 1: Build the Angular app
FROM node:18-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Stage 2: Serve app with Nginx
FROM nginx:alpine

# Copy the built files into nginx’s html folder
COPY --from=build /app/dist       /usr/share/nginx/html


# Copy your custom nginx config
COPY nginx.conf                   /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
