/*import { printer, PrinterTypes, printer as ThermalPrinter } from 'node-thermal-printer'

// Interfaz para los datos del ticket
interface TicketData {
  title: string
  items: Array<{ name: string; price: number; quantity?: number }>
  total: number
  footer?: string
}

// Configuración de la impresora
const getPrinterConfig = () => ({
  type: PrinterTypes.EPSON, // Puede cambiarse si usas otra impresora
  interface: 'tcp://xxx.xxx.xxx.xxx', // IP de la impresora o USB port
  characterSet: 'SLOVENIA', // Conjunto de caracteres
  removeSpecialCharacters: false,
  lineCharacter: '=',
})

class TicketPrinter {
  private printer: printer

  constructor() {
    this.printer = new ThermalPrinter(getPrinterConfig())
  }

  // Función genérica para imprimir un ticket
  async printTicket(ticketData: TicketData) {
    try {
      this.printer.clear()
      this.printer.alignCenter()
      this.printer.bold(true)
      this.printer.println(ticketData.title)
      this.printer.bold(false)
      this.printer.drawLine()

      ticketData.items.forEach(item => {
        this.printer.tableCustom([
          { text: item.name, align: 'LEFT', width: 0.5 },
          { text: item.quantity?.toString() || '', align: 'CENTER', width: 0.2 },
          { text: item.price.toFixed(2), align: 'RIGHT', width: 0.3 },
        ])
      })

      this.printer.drawLine()
      this.printer.bold(true)
      this.printer.println(`Total: ${ticketData.total.toFixed(2)}`)
      this.printer.bold(false)

      if (ticketData.footer) {
        this.printer.drawLine()
        this.printer.println(ticketData.footer)
      }

      this.printer.cut()

      const execute = await this.printer.execute()
      console.log('Printed:', execute)
    } catch (error) {
      console.error('Failed to print ticket:', error)
    }
  }
}

export default TicketPrinter
*/
