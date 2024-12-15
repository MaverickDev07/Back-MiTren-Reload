/* eslint-disable max-lines */
import { SerialPort } from 'serialport'
import { ByteLengthParser } from '@serialport/parser-byte-length'
import EventEmitter from 'events'

import { CAMBIO_VALORES, COMMANDS } from './ChangeCalculator'

export class DeviceSerial {
  private billeteroPort: SerialPort
  private monederoPort: SerialPort
  private billeteroParser: ByteLengthParser
  private monederoParser: ByteLengthParser
  private eventEmitter: EventEmitter

  private totalAmount: number = 0
  private targetAmount = 0 // Monto objetivo
  private acceptedBills: number[] = []
  private responseBuffer = '' // Buffer para acumular tramas de monedero
  private billeteroBuffer: string = ''
  private lastProcessedTime: number = 0
  private lastValidCommand: string = ''

  constructor() {
    this.eventEmitter = new EventEmitter()
    // Configuración del puerto serial
    this.billeteroPort = new SerialPort({
      path: '/dev/ttyS1',
      baudRate: 9600,
      dataBits: 8,
      parity: 'even',
      stopBits: 1,
    })

    this.monederoPort = new SerialPort({
      path: '/dev/ttyS2',
      baudRate: 115200,
      dataBits: 8,
      parity: 'none',
      stopBits: 1,
    })

    // Inicializar parsers
    this.billeteroParser = this.billeteroPort.pipe(new ByteLengthParser({ length: 8 }))
    this.monederoParser = this.monederoPort.pipe(new ByteLengthParser({ length: 24 }))

    this.setupListeners()
  }

  private setupListeners(): void {
    this.billeteroParser.on('data', data => {
      const newResponse = data
        .toString('hex')
        .toUpperCase()
        .match(/.{1,2}/g)
        .join(' ')
      const currentTime = Date.now()

      // Ignorar si el comando es idéntico al último válido y llega en 200ms
      if (newResponse === this.lastValidCommand && currentTime - this.lastProcessedTime < 200) {
        return
      }

      this.lastValidCommand = newResponse
      this.lastProcessedTime = currentTime

      this.billeteroBuffer += newResponse + ' '
      const responseSegments = this.billeteroBuffer.trim().split(' ')

      // Verificar si el buffer contiene un comando válido (7 segmentos) y no estamos procesando
      if (responseSegments.length >= 7) {
        const lastSegments = responseSegments.slice(-7).join(' ')

        if (lastSegments.startsWith('02')) {
          const amount = this.evaluateBill(lastSegments) // Verifica cómo se calcula 'amount'
          if (amount > 0) {
            // Verificar si 'amount' está en la lista de billetes aceptados
            let command
            // Determinar qué billetes habilitar según el monto
            if (amount <= 5.1) {
              command = COMMANDS.InhibitBills
            } else if (amount <= 15.1) {
              command = COMMANDS.Enable10
            } else if (amount <= 45.1) {
              command = COMMANDS.Enable10_20
            } else if (amount <= 95.1) {
              command = COMMANDS.Enable10_20_50
            } else if (amount <= 195.1) {
              command = COMMANDS.Enable10_20_50_100
            } else {
              command = COMMANDS.Enable10_20_50_100_200
            }

            this.sendCommand(this.billeteroPort, command)
            this.totalAmount += amount
            console.log(`Billete apilado: ${amount}Bs`)
            this.evaluatePayment()

            // Limpiar el buffer tras procesar un comando válido
            this.billeteroBuffer = ''
          } else {
            // Eliminar datos basura del buffer
            this.billeteroBuffer = responseSegments.slice(-6).join(' ')
          }
        } else {
          this.billeteroBuffer = responseSegments.slice(-6).join(' ') // Limpiar ruido
        }
      }

      // Limitar tamaño del buffer para evitar acumulación
      if (this.billeteroBuffer.length > 100) {
        this.billeteroBuffer = this.billeteroBuffer.slice(-50)
      }
    })

    this.monederoParser.on('data', (data: Buffer) => {
      const hexResponse: string = data.toString('hex').toUpperCase()
      this.responseBuffer += hexResponse

      let start: number = this.responseBuffer.indexOf('06')
      let end: number = this.responseBuffer.indexOf('1003', start)

      while (start !== -1 && end !== -1) {
        const trama: string = this.responseBuffer.slice(start, end + 4)
        const coinValue: number = this.evaluateCoin(trama)

        if (coinValue > 0) {
          this.totalAmount += coinValue
          console.log(`Moneda apilada: ${coinValue}Bs`)
          this.evaluatePayment()
        }

        this.responseBuffer = this.responseBuffer.slice(end + 4)
        start = this.responseBuffer.indexOf('06')
        end = this.responseBuffer.indexOf('1003', start)
      }

      if (this.responseBuffer.length > 100) {
        this.responseBuffer = this.responseBuffer.slice(-50)
      }
    })

    this.billeteroPort.on('open', () => {
      // Configuración inicial del billetero
      this.sendCommand(this.billeteroPort, COMMANDS.InhibitBills) // Inhibir todos los billetes

      setTimeout(() => {
        this.sendCommand(this.billeteroPort, COMMANDS.DesinhibitBilletero) // Desinhibir billetero

        setTimeout(() => {
          this.sendCommand(this.billeteroPort, COMMANDS.BilleteroEnEspera) // Poner en espera
        }, 100) // Pausa de 100ms para garantizar que el comando anterior se procese
      }, 100) // Pausa de 100ms después de inhibir
    })

    this.monederoPort.on('open', () => {
      console.log('Puerto del monedero abierto.')
    })

    // Manejo de errores
    this.billeteroPort.on('error', err => {
      console.error(`[Billetero] Error: ${err.message}`)
    })

    this.monederoPort.on('error', err => {
      console.error(`[Monedero] Error: ${err.message}`)
    })
  }

  calculateChangeCommands(change: number): number[][] {
    const commands: number[][] = []
    let remainingChange: number = Math.round(change * 100) / 100

    for (const { valor, comando } of CAMBIO_VALORES) {
      while (remainingChange >= valor) {
        commands.push(comando)
        remainingChange -= valor
        remainingChange = Math.round(remainingChange * 100) / 100
      }
    }

    if (remainingChange > 0) {
      console.error(`No se puede entregar el cambio exacto. Restante: ${remainingChange}`)
    }

    return commands
  }

  evaluateBill(segments: string): number {
    // Convertir los segmentos en un array de bytes (números enteros).
    const bytes: number[] = segments.split(' ').map(byte => parseInt(byte, 16))

    // Validar longitud mínima para evitar errores de procesamiento.
    if (bytes.length < 7) return 0

    const fourthByte: number = bytes[3]
    const fifthByte: number = bytes[4]

    // Determinar el monto según los bytes relevantes.
    switch (fourthByte) {
      case 0x01:
        return fifthByte === 0x02 || fifthByte === 0x08 ? 10 : 0
      case 0x02:
        return fifthByte === 0x02 || fifthByte === 0x08 ? 20 : 0
      case 0x03:
        return fifthByte === 0x02 || fifthByte === 0x08 ? 50 : 0
      case 0x04:
        return fifthByte === 0x02 || fifthByte === 0x08 ? 100 : 0
      case 0x05:
        return fifthByte === 0x02 || fifthByte === 0x08 ? 200 : 0
      default:
        return 0 // Respuestas no reconocidas se descartan.
    }
  }

  evaluateCoin(hexResponse: string): number {
    const coinMapping: { [key: string]: number } = {
      450045: 5.0,
      440044: 2.0,
      43: 1.0,
      42: 0.5,
      41: 0.2,
      40: 0.1,

      50: 0.1,
      51: 0.2,
      52: 0.5,
      53: 1.0,
      54: 2.0,
      55: 5.0,
    }

    const coinCode: string = hexResponse.includes('450045')
      ? '450045'
      : hexResponse.includes('440044')
        ? '440044'
        : hexResponse.slice(6, 8)

    return coinMapping[coinCode] || 0
  }

  evaluatePayment(): void {
    console.log(`Total acumulado: ${this.totalAmount.toFixed(2)}Bs`)

    if (this.totalAmount >= this.targetAmount) {
      const change: number = this.totalAmount - this.targetAmount

      console.log('----------------------------------------------------------------------')
      console.log(`Pago completado. Total pagado: ${this.totalAmount.toFixed(2)}Bs`)

      this.eventEmitter.emit('paymentCompleted', {
        message: 'Pago completado',
        totalPaid: this.totalAmount.toFixed(2),
        change: change > 0 ? change.toFixed(2) : null,
      })

      if (change > 0) {
        console.log(`Entregando cambio: ${change.toFixed(2)}Bs`)
        const changeCommands = this.calculateChangeCommands(change)
        this.deliverChange(changeCommands) // Entregar el cambio
      } else {
        console.log('No hay cambio a entregar.')
      }

      this.inhibitDevices() // Inhibir los dispositivos al finalizar
    }
  }

  deliverChange(changeCommands: number[][]): void {
    if (!changeCommands.length) {
      console.log('Cambio completado.')
      return
    }

    const command = changeCommands.shift()
    this.sendCommand(this.monederoPort, command) // Procesar el siguiente comando con un retraso

    setTimeout(() => this.deliverChange(changeCommands), 500)
  }

  inhibitDevices() {
    this.sendCommand(this.monederoPort, COMMANDS.InhibitMonedero)
    this.sendCommand(this.billeteroPort, COMMANDS.InhibitBills)
    console.log('Dispositivos inhibidos.')
  }

  sendCommand(port: any, command: number[]): void {
    if (!command || !Array.isArray(command)) {
      // No se procesa el comando si es inválido
      return
    }

    const buffer: Buffer = Buffer.from(command)
    port.write(buffer, (err: Error) => {
      if (err) {
        // Solo mostrar error si realmente hay un problema al enviar el comando
        console.error('Error al enviar el comando:', err.message)
      }
    })
  }

  ///// ------  Métodos para utilizar el monedero y billetero  ------ /////

  // Método para iniciar la transacción
  public startTransaction(amount: number): void {
    if (amount <= 0) {
      throw new Error('El monto debe ser mayor a cero.')
    }

    this.targetAmount = amount
    console.log(`Monto objetivo establecido: ${this.targetAmount}Bs`)
    this.checkCoinTubes()
    this.enableBillAcceptor()
  }

  public getEventEmitter(): EventEmitter {
    return this.eventEmitter
  }

  checkCoinTubes(): void {
    console.log('Consultando el estado de los tubos del monedero...')
    this.sendCommand(this.monederoPort, COMMANDS.TubeStatus)

    this.monederoParser.once('data', (data: Buffer) => {
      const response: string = data.toString('hex').toUpperCase()
      console.log(`Respuesta recibida: ${response}`)

      const { tubeStatus, total }: { tubeStatus: { [key: number]: number }; total: number } =
        this.parseTubeStatus(response)
      console.log('Estado de los tubos:')
      Object.entries(tubeStatus)
        .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0])) // Ordenar por denominación
        .forEach(([denomination, count]) => console.log(` - ${denomination}Bs: ${count} monedas`))
      console.log(`Total en Bs: ${total.toFixed(2)}Bs`)

      this.eventEmitter.emit('tubeStatus', {
        total,
        acceptedBills: this.determineBillAcceptance(this.targetAmount),
      })

      if (total < 4.9) return

      this.enableDevices() // Continuar con el flujo normal
    })
  }

  determineBillAcceptance(amount: number): void {
    let command = COMMANDS.InhibitBills // Default: inhibir todos
    this.acceptedBills = [] // Actualizar la lista de billetes aceptados

    // Determinar qué billetes habilitar según el monto
    if (amount <= 5.1) {
      command = COMMANDS.InhibitBills
    } else if (amount <= 15.1) {
      command = COMMANDS.Enable10
      this.acceptedBills = [10]
    } else if (amount <= 45.1) {
      command = COMMANDS.Enable10_20
      this.acceptedBills = [10, 20]
    } else if (amount <= 95.1) {
      command = COMMANDS.Enable10_20_50
      this.acceptedBills = [10, 20, 50]
    } else if (amount <= 195.1) {
      command = COMMANDS.Enable10_20_50_100
      this.acceptedBills = [10, 20, 50, 100]
    } else {
      command = COMMANDS.Enable10_20_50_100_200
      this.acceptedBills = [10, 20, 50, 100, 200]
    }

    // Configuración del billetero
    this.sendCommand(this.billeteroPort, COMMANDS.BilleteroEnEspera) // Colocar en espera
    setTimeout(() => {
      this.sendCommand(this.billeteroPort, command) // Habilitar billetes permitidos
      console.log(`Billetes aceptados: ${this.acceptedBills.join(', ')}`)
      console.log('-----------------------------------------------')
    }, 50) // Pausa para permitir el procesamiento
  }

  // Parsear la respuesta del estado de los tubos
  parseTubeStatus(hexResponse: string): { tubeStatus: { [key: number]: number }; total: number } {
    // Extraer los valores relevantes de los tubos (bytes 10 al 42 en la trama hex)
    const tubeCountsHex: number[] = hexResponse
      .slice(10, 42)
      .match(/.{2}/g)
      .map(byte => parseInt(byte, 16))

    // Mapeo correcto de denominaciones basado en la guía
    const tubeMapping: { denomination: number; index: number }[] = [
      { denomination: 0.1, index: 0 },
      { denomination: 0.2, index: 1 },
      { denomination: 0.5, index: 2 },
      { denomination: 1.0, index: 3 },
    ]

    const tubeStatus: { [key: number]: number } = {}
    let total: number = 0

    tubeMapping.forEach(({ denomination, index }) => {
      let count: number = tubeCountsHex[index] || 0

      // Ajuste para corregir valores exactos reportados
      if (denomination === 0.1) count += 1
      if (denomination === 0.2) count -= 1
      if (denomination === 0.5) count += 2
      if (denomination === 1.0) count += 5

      tubeStatus[denomination] = count
      total += count * denomination
    })

    return { tubeStatus, total }
  }

  // Habilitar los dispositivos
  enableDevices() {
    this.enableCoinAcceptor()
    this.enableBillAcceptor()
  }

  // Habilitar billetero
  enableBillAcceptor() {
    this.sendCommand(this.billeteroPort, COMMANDS.BillEnables)
    console.log('Billetero habilitado.')
    setInterval(() => {
      this.sendCommand(this.billeteroPort, COMMANDS.Status)
    }, 250)
  }

  // Habilitar monedero
  enableCoinAcceptor() {
    this.sendCommand(this.monederoPort, COMMANDS.EnableMonedero)
    console.log('Monedero habilitado.')
    setInterval(() => {
      this.sendCommand(this.monederoPort, COMMANDS.PullMonedero)
    }, 500)
  }
}
