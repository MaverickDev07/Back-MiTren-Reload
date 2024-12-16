#!/bin/bash

# Nombre del contenedor de MongoDB
MONGO_CONTAINER_NAME="mitren_db"

# Levantar los servicios de Docker
echo "Levantando los servicios de Docker..."
docker-compose up -d

# Esperar a que MongoDB esté listo
echo "Esperando que MongoDB esté listo..."
sleep 20  # Aumenta el tiempo si es necesario

# Crear un usuario en MongoDB si no existe
echo "Configurando MongoDB..."

# Crear el usuario 'admin' en la base de datos 'admin'
docker-compose exec mongo bash -c " \
  mongosh -u root -p example --eval ' \
  use admin; \
  if (!db.getUsers().some(user => user.user === \"admin\")) { \
    db.createUser({ user: \"admin\", pwd: \"password\", roles: [\"dbOwner\"] }); \
  }' \
"

# Crear el usuario 'admin' en la base de datos 'mitren_db'
docker-compose exec mongo bash -c " \
  mongosh -u root -p example --eval ' \
  use mitren_db; \
  if (!db.getUsers().some(user => user.user === \"admin\")) { \
    db.createUser({ user: \"admin\", pwd: \"password\", roles: [\"dbOwner\"] }); \
  }' \
"

Realizar un backup (opcional)
echo "Realizando backup de la base de datos..."
docker-compose exec mongo bash -c " \
  mongodump -u admin -p 'password' --db mitren_db --out ./documentation/backup/ \
"

# Copiar el backup al host (opcional)
echo "Copiando el backup al host..."
docker cp ./documentation/backup $MONGO_CONTAINER_NAME:/tmp/

# Mensaje de finalización
echo "Todos los servicios están corriendo y MongoDB está configurado."
echo "verifica tu aplicacion con el siguiente comando: docker ps o docker ps -a"