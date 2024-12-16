// src/ApiEfectivo/efectivo.controller.js

const { requestAmount, eventEmitter } = require('./script'); // Script para controlar billetero y monedero

let totalAmountToPay = 0;  // Total a pagar (lo que recibimos del frontend)
let totalAmountPaid = 0;   // Total que se ha pagado

// Controlador para recibir el monto inicial a pagar desde el frontend
const recibirMonto = (req, res) => {
  const { amount } = req.body;

  // Validar que el monto recibido sea correcto
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Monto inválido' });
  }

  // Guardamos el monto total a pagar
  totalAmountToPay = amount;

  // Llamamos a la función que configura el sistema de billetero y monedero
  requestAmount(amount);

  eventEmitter.once('tubeStatus', (data) => {
    const totalMonedero = data.total;
    const billetesAceptados = data.acceptedBills;

    // Devolvemos el estado del monedero y billetero
    res.status(200).json({
      TotalMonedero: totalMonedero,
      BilletesAceptados: billetesAceptados
    });
  });
};

// Controlador para actualizar el monto pagado conforme el usuario inserta dinero
const actualizarPago = (req, res) => {
  const { amount } = req.body;  // Monto que el usuario ha insertado

  // Validar que el monto recibido sea correcto
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'Monto inválido' });
  }

  totalAmountPaid += amount;  // Actualizamos el monto total pagado

  // Verificamos si el pago está completado
  if (totalAmountPaid >= totalAmountToPay) {
    const change = totalAmountPaid - totalAmountToPay;  // Calculamos el cambio, si hay

    // Emitimos un evento de pago completado
    eventEmitter.emit('paymentCompleted', {
      message: 'Pago completado',
      totalPaid: totalAmountPaid,
      change: change > 0 ? change : null
    });

    return res.status(200).json({
      message: 'Pago completado',
      totalPaid: totalAmountPaid,
      change: change > 0 ? change : null
    });
  }

  res.status(200).json({
    message: 'Pago en progreso',
    totalPaid: totalAmountPaid
  });
};

// Controlador para consultar el estado del pago
const estadoPagoController = (req, res) => {
  eventEmitter.once('paymentCompleted', (data) => {
    res.status(200).json({
      EstadoPago: 'completado',
      TotalPagado: data.totalPaid
    });
  });

  eventEmitter.once('tubeStatus', () => {
    if (!res.headersSent) {
      res.status(200).json({ EstadoPago: 'en proceso' });
    }
  });
};

module.exports = { recibirMonto, estadoPagoController, actualizarPago };
