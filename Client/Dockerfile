FROM nginx:1.22.1-alpine
COPY ./nginx /etc/nginx/conf.d/
COPY ./dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
