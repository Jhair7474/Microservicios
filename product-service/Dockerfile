# Etapa de construcción: Instalar dependencias de producción
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

# Instala solo las dependencias de producción
RUN npm install --only=production

# Etapa final: Imagen ligera de producción
FROM node:20-alpine

WORKDIR /usr/src/app

# Copia los módulos y el código de la etapa de construcción
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY . .

# Puerto de la aplicación
EXPOSE 3002

# Comando para iniciar la aplicación (sin nodemon)
CMD ["node", "index.js"]