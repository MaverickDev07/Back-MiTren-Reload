#!/bin/bash

# Nombre de la imagen y del contenedor
IMAGE_NAME="mitren-efectivo"
CONTAINER_NAME="mitren-efectivo-container"

# Detiene y elimina el contenedor si ya está en ejecución
if [ $(docker ps -q -f name=$CONTAINER_NAME) ]; then
    echo "Deteniendo y eliminando el contenedor existente..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Construye la imagen Docker
echo "Construyendo la imagen Docker..."
docker build -t $IMAGE_NAME .

# Ejecuta el contenedor en modo interactivo
echo "Ejecutando el contenedor..."
docker run -p 3000:3000 --name $CONTAINER_NAME -d $IMAGE_NAME

echo "El proyecto está corriendo en http://localhost:3000"