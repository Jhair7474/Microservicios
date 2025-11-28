# Dockerfile
# Usamos una imagen base ligera de Node para producción
FROM node:20-alpine

# Creamos y establecemos el directorio de trabajo
WORKDIR /usr/src/app

# Copiamos package.json y package-lock.json (o yarn.lock)
# Esto optimiza el uso del caché de Docker
COPY package*.json ./

# Instalamos las dependencias
RUN npm install

# Copiamos el código fuente de la aplicación
COPY . .

# Exponemos el puerto del contenedor
EXPOSE 3001

# Comando de inicio del contenedor (Usamos node en lugar de nodemon)
CMD ["node", "index.js"]