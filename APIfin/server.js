// server.js
const express = require('express');
const app = express();
const port = 3000;

// Middleware para manejar solicitudes JSON
app.use(express.json());

// Importar las rutas de efectivo
const efectivoRoutes = require('./src/ApiEfectivo/efectivo.routes');

// Usar las rutas en la aplicación
app.use('/api', efectivoRoutes);  // Prefijo 'api' para las rutas

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

