FROM             node:18.8.0-alpine3.16 as build-stage
WORKDIR          /app
COPY             . .
RUN              npm install
RUN              npm run build

FROM             nginx:1.23.1-alpine as production-stage
COPY             --from=build-stage /app/dist /usr/share/nginx/html
COPY             nginx_default.conf /etc/nginx/conf.d/default.conf
EXPOSE           80
CMD              ["nginx", "-g", "daemon off;"]
