import { SerialPort } from 'serialport';

export const getPrinterPort = async (): Promise<string> => {
  // Puerto por defecto según sistema operativo
  const defaultPorts = {
    win32: 'COM1',
    linux: '/dev/usb/lp0',
    darwin: '/dev/usb/'
  };

  try {
    // Listar todos los puertos
    const ports = await SerialPort.list();
    
    // Buscar la impresora Custom VKP80II
    const customPrinter = ports.find(port => 
      port.manufacturer?.includes('Custom') ||
      port.vendorId === '0dd4' || // ID del vendedor de Custom
      port.productId === '0205'   // ID del producto VKP80II
    );

    if (customPrinter?.path) {
      return customPrinter.path;
    }

    // Si no se encuentra, usar puerto por defecto según SO
    return defaultPorts[process.platform as keyof typeof defaultPorts] || '/dev/usb/lp0';

  } catch (error) {
    console.error('Error al buscar puerto de impresora:', error);
    return defaultPorts[process.platform as keyof typeof defaultPorts] || '/dev/usb/lp0';
  }
};

// Función para verificar si la impresora está conectada
export const isPrinterConnected = async (port: string): Promise<boolean> => {
  try {
    const serialPort = new SerialPort({
      path: port,
      baudRate: 9600,
      autoOpen: false
    });

    return new Promise((resolve) => {
      serialPort.open((err) => {
        if (err) {
          console.error('Error al conectar con la impresora:', err);
          resolve(false);
          return;
        }
        serialPort.close();
        resolve(true);
      });
    });
  } catch (error) {
    console.error('Error al verificar la impresora:', error);
    return false;
  }
};

// Función para obtener el estado del papel
export const getPrinterStatus = async (port: string): Promise<{
  connected: boolean;
  paperOut: boolean;
  error: boolean;
}> => {
  const defaultStatus = { connected: false, paperOut: true, error: false };
  
  try {
    const serialPort = new SerialPort({
      path: port,
      baudRate: 9600,
      autoOpen: false
    });

    return new Promise((resolve) => {
      serialPort.open((err) => {
        if (err) {
          resolve(defaultStatus);
          return;
        }

        // Comando para verificar estado
        const statusCommand = Buffer.from([0x10, 0x04, 0x01]);
        
        serialPort.write(statusCommand, (writeErr) => {
          if (writeErr) {
            serialPort.close();
            resolve(defaultStatus);
            return;
          }

          // Usar el evento 'data' en lugar de read
          serialPort.once('data', (data: Buffer) => {
            serialPort.close();
            
            if (!data) {
              resolve(defaultStatus);
              return;
            }

            resolve({
              connected: true,
              paperOut: (data[0] & 0x20) !== 0,
              error: (data[0] & 0x40) !== 0
            });
          });

          // Timeout para la lectura
          setTimeout(() => {
            serialPort.close();
            resolve(defaultStatus);
          }, 1000);
        });
      });
    });
  } catch (error) {
    console.error('Error al obtener estado de la impresora:', error);
    return defaultStatus;
  }
};