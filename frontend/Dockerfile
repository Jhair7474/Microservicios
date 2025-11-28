# Usamos una imagen base de Nginx ligera
FROM nginx:alpine

# Copia el contenido estático del frontend al directorio de Nginx
COPY . /usr/share/nginx/html

# Nginx corre en el puerto 80 por defecto
EXPOSE 80

# El comando por defecto de Nginx inicia el servidor
CMD ["nginx", "-g", "daemon off;"]