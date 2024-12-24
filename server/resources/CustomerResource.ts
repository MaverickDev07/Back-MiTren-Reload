import { CustomerAttributes, CustomerEntity } from '../database/models/Customer'
import BaseResource from './BaseResource'

class CustomerResource extends BaseResource<CustomerAttributes, CustomerEntity>() {
  /**
   * Transforma una instancia de Customer en un recurso listo para exponer.
   */
  item(): CustomerEntity {
    const {
      id,
      email,
      name,
      lastname,
      doc_type,
      doc_number,
      status,
      customerType,
      createdAt,
      updatedAt,
    } = this.instance

    // Crear el recurso transformado
    const customerResource: CustomerEntity = {
      id: id || null, // Manejo explícito de nulos
      email: email || '',
      name: name || '',
      lastname: lastname || '',
      doc_type: doc_type || '',
      doc_number: doc_number || '',
      status: status || 'INACTIVE', // Valor por defecto si no está definido
      customerType: customerType || { type_id: null, customer_type: 'NEW' }, // Manejo de subdocumento
      createdAt: createdAt || new Date(),
      updatedAt: updatedAt || new Date(),
    }

    return customerResource
  }
}

export default CustomerResource
