import dotenv from 'dotenv';
import { studlyCaseToSnakeCase } from '../utils/functions';

// Cargar archivo .env
dotenv.config();

class EnvManager {
  // Firma de índice añadida
  [key: string]: any;  // Permite que las propiedades sean accedidas dinámicamente

  // Obtener la URL de conexión a MongoDB
  getDbConnectionUrl() {
    const USER = encodeURIComponent(process.env.DB_USERNAME || '');
    const PASSWORD = encodeURIComponent(process.env.DB_PASSWORD || '');
    const HOST = process.env.DB_HOST || 'localhost';
    const PORT = process.env.DB_PORT || '27017';
    const DB_NAME = process.env.DB_NAME || 'test';

    if (!USER || !PASSWORD) {
      throw new Error('Faltan credenciales para conectar a la base de datos. Verifica tu archivo .env');
    }

    // Retorna la URL de conexión
    return `mongodb://${USER}:${PASSWORD}@${HOST}:${PORT}/${DB_NAME}?authMechanism=DEFAULT`;
  }

  // Generar credenciales en formato Base64 (para otros casos)
  getCredentialQR() {
    const USER = process.env.QR_USERNAME || '';
    const PASSWORD = process.env.QR_PASSWORD || '';

    if (!USER || !PASSWORD) {
      throw new Error('Faltan credenciales para generar el QR. Verifica tu archivo .env');
    }

    return Buffer.from(`${USER}:${PASSWORD}`).toString('base64');
  }

  // Obtener el puerto, con un valor por defecto si no está definido en el archivo .env
  getPort(defaultPort = 3000) {
    // Si existe la variable de entorno PORT, la usamos, sino, devolvemos el puerto por defecto
    return process.env.PORT ? parseInt(process.env.PORT, 10) : defaultPort;
  }
}

// No es necesario extender la clase, ya que ya hemos añadido la firma de índice directamente en la clase EnvManager
const envManager = new EnvManager();

// Proxy para manejar el acceso a las variables de entorno de manera dinámica
export default new Proxy(envManager, {
  get(envManager: EnvManager, field: string) {
    return function (defaultValue?: string | number | boolean) {
      // Si el método existe en EnvManager, llámalo
      if (field in envManager) {
        return envManager[field](defaultValue);
      }

      // Convertir el nombre del campo al formato snake_case
      const envVariable = process.env[studlyCaseToSnakeCase(field.replace('get', ''))];

      // Manejo de valores booleanos
      if (envVariable && /^true$/i.test(envVariable)) return true;
      if (envVariable && /^false$/i.test(envVariable)) return false;

      // Verificar si es numérico
      if (envVariable && /^[0-9]+$/.test(envVariable)) {
        return parseInt(envVariable, 10);
      }

      // Retornar la variable de entorno o el valor por defecto
      return envVariable || defaultValue;
    };
  },
});
