# Requests

## 1. Generar Qr

**Descripción:** Esta petición te generará un imagen Qr en base 64

**Path:** <https://veripagos.com/api/bcp/generar-qr>

**Método:** POST

**Encabezado de autorización**: Basic Auth

### Parámetros de entrada

| Campo                                                                                                       | Requerido | Tipo    | Descripción                                                                                                                                               | Ejemplo                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------- | --------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| secret_key                                                                                                  | Si        | String  | Es una llave secreta que será otorgada por el sistema                                                                                                     | a3b54556-f0d9-11ed-85b9-50                                                                                                                 |
| monto                                                                                                       | Si        | Double  | Es la cantidad a cobrar en Bs.                                                                                                                            | Puede ir desde 0 Bs. esto hará que el cliente coloque el monto que desee. Se puede colocar montos con centavos. ejemplos: 0.50 1.48 100.99 |
| data                                                                                                        | No        | Array   | Este campo es un array que sirve para que usted nos envíe lo que sea para que después en el webhook lo recupere. (Información extra)                      | []                                                                                                                                         |
| vigencia                                                                                                    | No        | String  | Este campo nos ayuda para establecer la vigencia del Qr, formato dia/hora:minuto, si no se envía este campo por default se le asignará el valor "0/00:15” | "0/00:05” "120/23:30” "365/11:00”                                                                                                          |
| uso_unico                                                                                                   | No        | boolean | Esto sirve para especificar si el QR será para un único pago o múltiples pagos, por defecto es para un único pago (true).                                 | true o false                                                                                                                               |
| detalle                                                                                                     | No        | String  |                                                                                                                                                           | Por defecto se muestra: “Código de pago 100”                                                                                               |
| Si usted envia algo en este detalle se mostrará de la sgt manera: “VP: 100 (lo que tu usted haya colocado)” |

### **Formato de respuesta exitosa**

```json
{
  "Codigo": 0,
  "Data": {
    "movimiento_id": 25,
    "qr": "iVBORw0KGgoAAAANSUhEUgAAAUAAAAFFCAYAAACdXTQZAAAAAX..."
  },
  "Mensaje": "Qr generado exitosamente"
}
```

### **Formato de respuesta errónea**

```json
{
  "Codigo": 1,
  "Data": null,
  "Mensaje": "[Mensaje dinámico del sistema si ocurre un error]"
}
```

# **Advertencia**

**Para visualizar el Qr, es necesario concatenar “data:image/png;base64,” a la respuesta.**

## 2. Verificar estado Qr

**Descripción:** Esta petición te ayudará a verificar el estado del qr, si fue pagado o no.

**Path:** <https://veripagos.com/api/bcp/verificar-estado-qr>

**Método:** POST

**Encabezado de autorización**: Basic Auth

### Parámetros de entrada

| Campo         | Tipo   | Descripción                                                                  | Ejemplo                    |
| ------------- | ------ | ---------------------------------------------------------------------------- | -------------------------- |
| secret_key    | String | Es una llave secreta que será otorgada por el sistema                        | a3b54556-f0d9-11ed-85b9-50 |
| movimiento_id | String | Es el identificador único que se le generó al usar la petición de Generar Qr | 11                         |

### **Formato de respuesta exitosa**

```json
{
  "Codigo": 0,
  "Data": {
    "movimiento_id": 11,
    "monto": 100,
    "detalle": "Código de pago 11",
    "estado": "Completado",
    "estado_notificacion": "Pendiente",
    "remitente": {
      "nombre": "Juan Perez",
      "banco": "BNB",
      "documento": "11223344",
      "cuenta": "0012164623"
    }
  },
  "Mensaje": "Consulta generada exitosamente"
}
```

### **Formato de respuesta errónea**

```json
{
  "Codigo": 1,
  "Data": null,
  "Mensaje": "[Mensaje dinámico del sistema si ocurre un error]"
}
```

## 3. Datos de llegada al callback o webhook

Es necesario que usted cree una ruta de tipo POST con autenticación Basic Auth con las mismas credenciales proporcionadas.

Esto solamente notifica cuando se trabaja con Qrs

```json
{
  "movimiento_id": 99,
  "monto": 1000,
  "detalle": "Detalle de prueba",
  "estado": "Completado",
  "data": [], //La misma data que usted envio al generar Qr.
  "remitente": {
    "nombre": "Juan Perez",
    "banco": "BNB",
    "documento": "11223344",
    "cuenta": "0012164623"
  }
}
```

