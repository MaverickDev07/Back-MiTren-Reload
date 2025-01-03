import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer';
import { TicketEntity } from '../database/models/Ticket';
import { getPrinterPort, isPrinterConnected, getPrinterStatus } from '../utils/printerUtils';

export class UsbPrinterService {
  private printer: ThermalPrinter | null = null;
  private port: string | null = null;

  async initialize() {
    try {
      // Obtener puerto usando la utilidad
      this.port = await getPrinterPort();
      
      // Verificar conexión
      const isConnected = await isPrinterConnected(this.port);
      if (!isConnected) {
        throw new Error('Impresora no conectada');
      }

      // Configurar la impresora
      this.printer = new ThermalPrinter({
        type: PrinterTypes.EPSON,
        interface: this.port,
        // characterSet: 'PC858',
        options: {
          timeout: 5000,
        },
        lineCharacter: "=",
        removeSpecialCharacters: false,
        width: 80,
        driver: require('printer')
      });

      return true;
    } catch (error) {
      console.error('Error al inicializar impresora:', error);
      return false;
    }
  }

  async printTicket(ticket: TicketEntity): Promise<boolean> {
    try {
      // Inicializar si no está inicializada
      if (!this.printer) {
        const initialized = await this.initialize();
        if (!initialized) {
          throw new Error('No se pudo inicializar la impresora');
        }
      }

      // Verificar estado de la impresora
      if (this.port) {
        const status = await getPrinterStatus(this.port);
        if (!status.connected) {
          throw new Error('Impresora desconectada');
        }
        if (status.paperOut) {
          throw new Error('Sin papel');
        }
        if (status.error) {
          throw new Error('Error en la impresora');
        }
      }

      // Limpiar buffer
      this.printer!.clear();

      // Encabezado
      this.printer!.alignCenter();
      this.printer!.setTextQuadArea();
      this.printer!.bold(true);
      this.printer!.println('MI TREN');
      this.printer!.bold(false);
      this.printer!.setTextNormal();
      this.printer!.newLine();

      // Código QR
      this.printer!.alignCenter();
      this.printer!.printQR(ticket.qr_code || ticket.id, {
        model: 2,
        cellSize: 8,
        correction: 'H'
      });
      this.printer!.newLine();

      // Precios
      this.printer!.alignLeft();
      this.printer!.setTextSize(1, 1);
      ticket.prices.forEach(price => {
        this.printer!.bold(true);
        this.printer!.println(`${price.qty}x ${price.customer_type}`);
        this.printer!.bold(false);
        this.printer!.println(`Precio Base: ${price.base_price.toFixed(2)} Bs.`);
      });

      // Total
      this.printer!.drawLine();
      this.printer!.bold(true);
      this.printer!.setTextDoubleHeight();
      this.printer!.println(`TOTAL: ${ticket.total_price.toFixed(2)} Bs.`);
      this.printer!.setTextNormal();
      this.printer!.bold(false);
      this.printer!.drawLine();

      // Ruta
      this.printer!.newLine();
      this.printer!.bold(true);
      this.printer!.println('RUTA DEL VIAJE');
      this.printer!.bold(false);
      this.printer!.println(`ORIGEN: ${ticket.route.start_point.start_station}`);
      this.printer!.println(`LÍNEA: ${ticket.route.start_point.start_line}`);
      this.printer!.println(`DESTINO: ${ticket.route.end_point.end_station}`);
      this.printer!.println(`LÍNEA: ${ticket.route.end_point.end_line}`);

      // Transbordo si existe
      if (ticket.route.transfer_point?.is_transfer) {
        this.printer!.newLine();
        this.printer!.bold(true);
        this.printer!.println('TRANSBORDO');
        this.printer!.bold(false);
        this.printer!.println(ticket.route.transfer_point.transfer_station);
      }

      // Fechas
      this.printer!.drawLine();
      this.printer!.println(`COMPRA: ${ticket.createdAt?.toLocaleString()}`);
      this.printer!.bold(true);
      this.printer!.println(`VÁLIDO HASTA: ${new Date(ticket.expiry_date).toLocaleString()}`);
      this.printer!.bold(false);

      // Pie de página
      this.printer!.newLine();
      this.printer!.alignCenter();
      this.printer!.println('Gracias por su preferencia');
      this.printer!.drawLine();

      // Cortar papel
      this.printer!.cut();

      // Ejecutar impresión
      await this.printer!.execute();
      return true;

    } catch (error) {
      console.error('Error de impresión:', error);
      throw error;
    }
  }

  // Método para reintentar la conexión
  async reconnect(): Promise<boolean> {
    try {
      this.printer = null;
      return await this.initialize();
    } catch (error) {
      console.error('Error al reconectar:', error);
      return false;
    }
  }
}