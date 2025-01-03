db = db.getSiblingDB('admin');
db.createUser({
  user: "admin",
  pwd: "password",
  roles: ["dbOwner"]
});
print("Usuario 'admin' creado en la base de datos 'admin' con rol 'dbOwner'.");

// Crear usuario en la base de datos 'mitren_db'
db = db.getSiblingDB('mitren_db');
db.createUser({
  user: "mitren_db",
  pwd: "password",
  roles: ["dbOwner"]
});
print("Usuario 'mitren_db' creado en la base de datos 'mitren_db' con rol 'dbOwner'.");
