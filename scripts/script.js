//Script de control billetero y monedero de manera local

const { SerialPort } = require('serialport');
const { ByteLengthParser } = require('@serialport/parser-byte-length');
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

// Configuración del puerto serial para el billetero y el monedero
const billeteroPort = new SerialPort({
    path: '/dev/ttyS1',
    baudRate: 9600,
    dataBits: 8,
    parity: 'even',
    stopBits: 1,
    flowControl: false
});

const monederoPort = new SerialPort({
    path: '/dev/ttyS2',
    baudRate: 115200,
    dataBits: 8,
    parity: 'none',
    stopBits: 1,
    flowControl: false
});

// Parsers para leer datos entrantes
const billeteroParser = billeteroPort.pipe(new ByteLengthParser({ length: 8 }));
const monederoParser = monederoPort.pipe(new ByteLengthParser({ length: 24 }));

// Comandos utilizados
const COMMANDS = {
    //billetero
    BillEnables: [0x02, 0x06, 0x41, 0xFF, 0xFF, 0xB9],
    Status: [0x02, 0x04, 0xCC, 0x2E],
    AcceptBill: [0x02, 0x04, 0x80, 0x7A], // Aceptar billete en espera
    RejectBill: [0x02, 0x04, 0x81, 0x79], // Rechazar billete en espera
    InhibitBills: [0x02, 0x04, 0xF0, 0x0A], // Inhibir todos los billetes
    DesinhibitBilletero: [0x02, 0x04, 0xF1, 0x09], // Desinhibir billetero
    BilleteroEnEspera: [0x02, 0x05, 0x40, 0x00, 0xB6],
    Enable10: [0x02, 0x06, 0x41, 0x01, 0x01, 0xB5],
    Enable10_20: [0x02, 0x08, 0x41, 0x01, 0x01, 0x02, 0x02, 0xA9],
    Enable10_20_50: [0x02, 0x08, 0x41, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x59],
    Enable10_20_50_100: [0x02, 0x0A, 0x41, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x04, 0x04, 0x9F],
    Enable10_20_50_100_200: [0x02, 0x0C, 0x41, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x04, 0x04, 0x05, 0x05, 0x93],
    EnableAll: [0x02, 0x0C, 0x41, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x04, 0x04, 0x05, 0x05, 0x93],

    //monedero
    EnableMonedero: [0x02, 0x00, 0x0C, 0x00, 0x3F, 0x00, 0x3F, 0x10, 0x03],
    InhibitMonedero: [0x02, 0x00, 0x0C, 0x00, 0x00, 0x00, 0x00, 0x10, 0x03],
    TubeStatus: [0x02, 0x00, 0x0A, 0x10, 0x03],
    PullMonedero: [0x02, 0x00, 0x0B, 0x10, 0x03], // Consulta monedero
    Cambio10Ctvs: [0x02, 0x00, 0x0F, 0x02, 0x01, 0x10, 0x03],
    Cambio20Ctvs: [0x02, 0x00, 0x0F, 0x02, 0x02, 0x10, 0x03],
    Cambio50Ctvs: [0x02, 0x00, 0x0F, 0x02, 0x05, 0x10, 0x03],
    Cambio1Bs: [0x02, 0x00, 0x0F, 0x02, 0x0A, 0x10, 0x03],
    Cambio1_50Bs: [0x02, 0x00, 0x0F, 0x02, 0x0F, 0x10, 0x03],
    Cambio2Bs: [0x02, 0x00, 0x0F, 0x02, 0x14, 0x10, 0x03],
    Cambio2_50Bs: [0x02, 0x00, 0x0F, 0x02, 0x19, 0x10, 0x03],
    Cambio3Bs: [0x02, 0x00, 0x0F, 0x02, 0x1E, 0x10, 0x03]
};

// Tabla de valores y comandos
const CAMBIO_VALORES = [
    { valor: 3.00, comando: COMMANDS.Cambio3Bs },
    { valor: 2.50, comando: COMMANDS.Cambio2_50Bs },
    { valor: 2.00, comando: COMMANDS.Cambio2Bs },
    { valor: 1.50, comando: COMMANDS.Cambio1_50Bs },
    { valor: 1.00, comando: COMMANDS.Cambio1Bs },
    { valor: 0.50, comando: COMMANDS.Cambio50Ctvs },
    { valor: 0.20, comando: COMMANDS.Cambio20Ctvs },
    { valor: 0.10, comando: COMMANDS.Cambio10Ctvs }
];

// Función para calcular comandos para devolver el cambio
function calculateChangeCommands(change) {
    const commands = [];
    let remainingChange = Math.round(change * 100) / 100; // Redondeo para evitar errores de precisión

    for (const { valor, comando } of CAMBIO_VALORES) {
        while (remainingChange >= valor) {
            commands.push(comando);
            remainingChange -= valor;
            remainingChange = Math.round(remainingChange * 100) / 100; // Asegurar precisión
        }
    }

    if (remainingChange > 0) {
        console.error(`No se puede entregar el cambio exacto. Restante: ${remainingChange}`);
    }

    return commands;
}

let totalAmount = 0; // Total acumulado
let targetAmount = 0; // Monto objetivo
let acceptedBills = []; // Billetes aceptados
let responseBuffer = ''; // Buffer para acumular tramas de monedero
let billeteroBuffer = ''; // Buffer para acumular tramas de billetero
let lastCommand = '';
let lastCommandTime = 0;

// Solicitar el monto objetivo desde io.js
function requestAmount(amount) {
    if (!isNaN(amount) && amount > 0) {
        targetAmount = amount;
        console.log(`script.js - Monto recibido: ${targetAmount}`);
        checkCoinTubes(); // Consultar el estado de los tubos del monedero
        enableBillAcceptor();
    } else {
        //console.log('script.js - Monto inválido recibido.');
    }
}

// Consultar el estado de los tubos del monedero
function checkCoinTubes() {
    //console.log('Consultando el estado de los tubos del monedero...');
    sendCommand(monederoPort, COMMANDS.TubeStatus);

    monederoParser.once('data', (data) => {
        const response = data.toString('hex').toUpperCase();
        //console.log(`Respuesta recibida: ${response}`);

        const { tubeStatus, total } = parseTubeStatus(response);
        //console.log('Estado de los tubos:');
        Object.entries(tubeStatus)
            .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])) // Ordenar por denominación
            .forEach(([denomination, count]) =>
                console.log(` - ${denomination}Bs: ${count} monedas`)
            );

        //console.log(`Total en Bs: ${total.toFixed(2)}Bs`);

        // Emitir datos a io.js
        eventEmitter.emit('tubeStatus', {
            total,
            acceptedBills: determineBillAcceptance(targetAmount),
        });

        if (total >= 4.9) {
            //console.log('Suficiente efectivo en tubos. Habilitando dispositivos para el pago...');
            enableDevices(); // Continuar con el flujo normal
        } else {
            //console.log('No hay suficiente efectivo en los tubos. Operación cancelada.');
        }
    });
}

// Determinar qué billetes aceptar
function determineBillAcceptance(amount) {
    let command = COMMANDS.InhibitBills; // Default: inhibir todos
    let acceptedBills = []; // Actualizar la lista de billetes aceptados

    // Determinar qué billetes habilitar según el monto
    if (amount <= 5.1) {
        command = COMMANDS.InhibitBills;
    } else if (amount <= 15.1) {
        command = COMMANDS.Enable10;
        acceptedBills = [10];
    } else if (amount <= 45.1) {
        command = COMMANDS.Enable10_20;
        acceptedBills = [10, 20];
    } else if (amount <= 95.1) {
        command = COMMANDS.Enable10_20_50;
        acceptedBills = [10, 20, 50];
    } else if (amount <= 195.1) {
        command = COMMANDS.Enable10_20_50_100;
        acceptedBills = [10, 20, 50, 100];
    } else {
        command = COMMANDS.Enable10_20_50_100_200;
        acceptedBills = [10, 20, 50, 100, 200];
    }

    // Configuración del billetero
    sendCommand(billeteroPort, COMMANDS.BilleteroEnEspera); // Colocar en espera
    setTimeout(() => {
        sendCommand(billeteroPort, command); // Habilitar billetes permitidos
        //console.log(`Billetes aceptados: ${acceptedBills.join(', ')}`);
        //console.log('-----------------------------------------------');
    }, 50); // Pausa para permitir el procesamiento

    return acceptedBills;
}



// Parsear la respuesta del estado de los tubos
function parseTubeStatus(hexResponse) {
    // Extraer los valores relevantes de los tubos (bytes 10 al 42 en la trama hex)
    const tubeCountsHex = hexResponse.slice(10, 42).match(/.{2}/g).map(byte => parseInt(byte, 16));

    // Mapeo correcto de denominaciones basado en la guía
    const tubeMapping = [
        { denomination: 0.10, index: 0 },
        { denomination: 0.20, index: 1 },
        { denomination: 0.50, index: 2 },
        { denomination: 1.00, index: 3 }
    ];

    const tubeStatus = {};
    let total = 0;

    tubeMapping.forEach(({ denomination, index }) => {
        let count = tubeCountsHex[index] || 0;

        // Ajuste para corregir valores exactos reportados
        if (denomination === 0.10) count += 1; // Ajuste particular para 0.10Bs
        if (denomination === 0.20) count -= 1; // Ajuste particular para 0.20Bs
        if (denomination === 0.50) count += 2; // Ajuste particular para 0.50Bs
        if (denomination === 1.00) count += 5; // Ajuste particular para 1Bs

        tubeStatus[denomination] = count;
        total += count * denomination;
    });

    return { tubeStatus, total };
}

// Habilitar los dispositivos
function enableDevices() {
    enableCoinAcceptor();
    enableBillAcceptor();
}

// Habilitar billetero
function enableBillAcceptor() {
    sendCommand(billeteroPort, COMMANDS.BillEnables);
    console.log("Billetero habilitado.");
    console.log("--------------------------------------------------");
    setInterval(() => {
        sendCommand(billeteroPort, COMMANDS.Status);
    }, 250);
}

// Habilitar monedero
function enableCoinAcceptor() {
    sendCommand(monederoPort, COMMANDS.EnableMonedero);
    console.log("Monedero habilitado.");
    setInterval(() => {
        sendCommand(monederoPort, COMMANDS.PullMonedero);
    }, 500);
}

// Inhibir los dispositivos
function inhibitDevices() {
    sendCommand(monederoPort, COMMANDS.InhibitMonedero);
    sendCommand(billeteroPort, COMMANDS.InhibitBills);
    console.log("Dispositivos inhibidos.");
}


// Procesar datos del billetero
billeteroParser.on('data', (data) => {
    const newResponse = data.toString('hex').toUpperCase().match(/.{1,2}/g).join(' ');
    const currentTime = Date.now();

    // Ignorar si el comando es idéntico al último y llega en menos de 200ms
    if (newResponse === lastCommand && (currentTime - lastCommandTime < 200)) {
        return;
    }

    lastCommand = newResponse;
    lastCommandTime = currentTime;

    billeteroBuffer += newResponse + ' ';
    const responseSegments = billeteroBuffer.trim().split(' ');

    // Verificar si el buffer contiene un comando válido (7 segmentos)
    if (responseSegments.length >= 7) {
        const lastSegments = responseSegments.slice(-7).join(' ');

        if (lastSegments.startsWith('02')) {
            const amount = evaluateBill(lastSegments); // Verifica cómo se calcula 'amount'
            if (amount > 0) {
                // Verificar si 'amount' está en la lista de billetes aceptados
                    let command;
                    // Determinar qué billetes habilitar según el monto
                    if (amount <= 5.1) {
                         command = COMMANDS.InhibitBills;
                    } else if (amount <= 15.1) {
                        command = COMMANDS.Enable10;
                    } else if (amount <= 45.1) {
                        command = COMMANDS.Enable10_20;
                    } else if (amount <= 95.1) {
                        command = COMMANDS.Enable10_20_50;
                    } else if (amount <= 195.1) {
                        command = COMMANDS.Enable10_20_50_100;
                    } else {
                        command = COMMANDS.Enable10_20_50_100_200;
                    }

                    sendCommand(billeteroPort, command);
                    totalAmount += amount;
                    console.log(`Billete apilado: ${amount}Bs`);
                    evaluatePayment();


                    // Limpiar el buffer tras procesar un comando válido
                    billeteroBuffer = '';
   
                
            } else {
                // Eliminar datos basura del buffer
                billeteroBuffer = responseSegments.slice(-6).join(' ');
            }
        } else {
            billeteroBuffer = responseSegments.slice(-6).join(' '); // Limpiar ruido
        }
    }

    // Limitar tamaño del buffer para evitar acumulación
    if (billeteroBuffer.length > 100) {
        billeteroBuffer = billeteroBuffer.slice(-50);
    }
});



// Procesar datos del monedero
monederoParser.on('data', (data) => {
    const hexResponse = data.toString('hex').toUpperCase();
    responseBuffer += hexResponse;

    let start = responseBuffer.indexOf('06');
    let end = responseBuffer.indexOf('1003', start);

    while (start !== -1 && end !== -1) {
        const trama = responseBuffer.slice(start, end + 4);
        const coinValue = evaluateCoin(trama);
        if (coinValue > 0) {
            totalAmount += coinValue;
            console.log(`Moneda apilada: ${coinValue}Bs`);
            evaluatePayment();
        }
        responseBuffer = responseBuffer.slice(end + 4);
        start = responseBuffer.indexOf('06');
        end = responseBuffer.indexOf('1003', start);
    }

    if (responseBuffer.length > 100) {
        responseBuffer = responseBuffer.slice(-50);
    }
});

// Evaluar billetes
function evaluateBill(segments) {
    const bytes = segments.split(' ').map(byte => parseInt(byte, 16));

    // Validar longitud mínima para evitar errores de procesamiento
    if (bytes.length < 7) return 0;

    const fourthByte = bytes[3];
    const fifthByte = bytes[4];

    // Determinar el monto según los bytes relevantes
    switch (fourthByte) {
        case 0x01: return fifthByte === 0x02 || fifthByte === 0x08 ? 10 : 0;
        case 0x02: return fifthByte === 0x02 || fifthByte === 0x08 ? 20 : 0;
        case 0x03: return fifthByte === 0x02 || fifthByte === 0x08 ? 50 : 0;
        case 0x04: return fifthByte === 0x02 || fifthByte === 0x08 ? 100 : 0;
        case 0x05: return fifthByte === 0x02 || fifthByte === 0x08 ? 200 : 0;
        default: return 0; // Respuestas no reconocidas se descartan
    }
}


// Evaluar monedas
function evaluateCoin(hexResponse) {
    const coinMapping = {
        "450045": 5.00,
        "440044": 2.00,
        "43": 1.00,
        "42": 0.50,
        "41": 0.20,
        "40": 0.10,

        "50": 0.10,
        "51": 0.20,
        "52": 0.50,
        "53": 1.00,
        "54": 2.00,
        "55": 5.00
    };
    const coinCode = hexResponse.includes('450045') ? '450045' :
        hexResponse.includes('440044') ? '440044' :
        hexResponse.slice(6, 8);
    return coinMapping[coinCode] || 0;
}

// Evaluar el progreso del pago
function evaluatePayment() {
    console.log(`Total acumulado: ${totalAmount.toFixed(2)}Bs`);
    console.log('----------------------------------------------------------------------');
    if (totalAmount >= targetAmount) {
        const change = totalAmount - targetAmount;
        //console.log('----------------------------------------------------------------------');
        //console.log(`Pago completado. Total pagado: ${totalAmount.toFixed(2)}Bs`);

        // Emitir el estado de "Pago completado" a io.js
        eventEmitter.emit('paymentCompleted', {
            message: 'Pago completado',
            totalPaid: totalAmount.toFixed(2),
            change: change > 0 ? change.toFixed(2) : null,
        });
        
        if (change > 0) {
            //console.log(`Entregando cambio: ${change.toFixed(2)}Bs`);
            const changeCommands = calculateChangeCommands(change);
            deliverChange(changeCommands); // Entregar el cambio
        } else {
            //console.log("No hay cambio a entregar.");
        }

        inhibitDevices(); // Inhibir los dispositivos al finalizar
    }
}

// Función para entregar el cambio
function deliverChange(changeCommands) {
    if (!changeCommands.length) {
        console.log("Cambio completado.");
        return;
    }

    const command = changeCommands.shift();
    sendCommand(monederoPort, command);

    // Procesar el siguiente comando con un retraso
    setTimeout(() => deliverChange(changeCommands), 500);
}

// Enviar comandos
function sendCommand(port, command) {
    if (!command || !Array.isArray(command)) {
        // No se procesa el comando si es inválido
        return;
    }
    const buffer = Buffer.from(command);
    port.write(buffer, (err) => {
        if (err) {
            // Solo mostrar error si realmente hay un problema al enviar el comando
            console.error('Error al enviar el comando:', err.message);
        }
    });
}


// Inicializar puertos
billeteroPort.on('open', () => {
    //console.log("Puerto del billetero abierto.");

    // Configuración inicial del billetero
    sendCommand(billeteroPort, COMMANDS.InhibitBills); // Inhibir todos los billetes
    setTimeout(() => {
        sendCommand(billeteroPort, COMMANDS.DesinhibitBilletero); // Desinhibir billetero
        //console.log("Billetero desinhibido.");
        setTimeout(() => {
            sendCommand(billeteroPort, COMMANDS.BilleteroEnEspera); // Poner en espera
            //console.log("Billetero configurado en modo espera.");
        }, 100); // Pausa de 100ms para garantizar que el comando anterior se procese
    }, 100); // Pausa de 100ms después de inhibir
});

monederoPort.on('open', () => {
    //console.log('Puerto del monedero abierto.');
});

billeteroPort.on('error', (err) => console.error('Error en el billetero:', err.message));
monederoPort.on('error', (err) => console.error('Error en el monedero:', err.message));

// Iniciar la aplicación
requestAmount();

module.exports = { requestAmount, eventEmitter };
