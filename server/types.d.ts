// Types for Errors
type ErrorName =
  | 'CONFIGURATION_ERROR'
  | 'MODEL_NOT_FOUND_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'CONNECTION_ERROR'
  | 'METHOD_NOT_IMPLEMENTED'
  | 'FILTER_BY_ERROR'
  | 'REFERENCE_ERROR'
  | 'VALIDATION_ERROR'
  | 'INVALID_DATA_ERROR'
  | 'STATIONS_NOT_IN_ROUTE'
  | 'UNAUTHORIZED_ERROR'
  | 'NO_TOKEN_PROVIDED'
  | 'TOKEN_EXPIRED_ERROR'
  | 'FORBIDDEN_ERROR'

type ErrorCode =
  | 'ERR_CFG'
  | 'ERR_MNF'
  | 'ERR_NF'
  | 'ERR_REMOTE'
  | 'NOT_IMPL'
  | 'ERR_FTB'
  | 'ERR_REF'
  | 'ERR_VALID'
  | 'ERR_INV'
  | 'ERR_SNR'
  | 'ERR_UNAUTH'
  | 'ERR_NT'
  | 'ERR_TE'
  | 'ERR_FORB'

type ValidationError = {
  error: {
    name: string
    message: string
    code: ErrorCode
    errors: Array<{ message: string }>
  }
  code_response: nubmer
}

// Interface for Veripagos
interface GenerateQrParams {
  secret_key: string
  monto: number
  data?: any[]
  vigencia?: string
  uso_unico?: boolean
  detalle?: string
}

interface VerifyQrStatusParams {
  secret_key: string
  movimiento_id: string
}

interface GenerateQrResponse {
  Codigo: number
  Data: {
    movimiento_id: number
    qr: string
  }
  Mensaje: string
}

interface VerifyQrStatusResponse {
  Codigo: number
  Data: {
    movimiento_id: number
    monto: number
    detalle: string
    estado: string
    estado_notificacion: string
    remitente: {
      nombre: string
      banco: string
      documento: string
      cuenta: string
    }
  } | null
  Mensaje: string
}

interface PagedParams {
  limit?: number
  page?: number
  sortBy?: string
  filterBy?: string
}

interface PagedStationsParams {
  id: string | Types.ObjectId
  limit?: number
  page?: number
}

interface PaginationResult<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}
