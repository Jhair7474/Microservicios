# Dockerfile (en la carpeta /frontend)
# Usamos la imagen oficial de Nginx, versión ligera (alpine)
FROM nginx:alpine

# Copiamos todo el contenido estático (index.html, app.js, style.css) 
# al directorio donde Nginx busca los archivos para servir.
COPY . /usr/share/nginx/html

# Nginx corre por defecto en el puerto 80.
EXPOSE 80