// // src/ApiEfectivo/efectivo.routes.js
// const express = require('express');
// const router = express.Router();
// const efectivoController = require('./efectivo.controller'); // Asegúrate de importar el controlador correctamente

// // Definir las rutas y asociarlas con los métodos del controlador
// router.post('/efectivo/monto', efectivoController.recibirMonto);  // Ruta POST para recibir el monto
// router.get('/efectivo/estado', efectivoController.estadoPagoController);  // Ruta GET para obtener el estado del pago

// module.exports = router;

const express = require('express');
const router = express.Router();
const efectivoController = require('./efectivo.controller');

// Recibir el monto inicial a pagar
router.post('/efectivo/monto', efectivoController.recibirMonto);

// Actualizar el monto pagado conforme el usuario inserta dinero
router.post('/efectivo/pagar', efectivoController.actualizarPago);

// Consultar el estado del pago
router.get('/efectivo/estado', efectivoController.estadoPagoController);

module.exports = router;

