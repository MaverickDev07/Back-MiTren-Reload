import axios, { AxiosInstance } from 'axios'

class VeripagosService {
  private apiClient: AxiosInstance

  constructor(
    private baseUrl: string,
    private auth: string,
  ) {
    this.apiClient = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    })
  }

  async generateQr(params: GenerateQrParams): Promise<GenerateQrResponse> {
    try {
      const response = await this.apiClient.post<GenerateQrResponse>('/bcp/generar-qr', params)
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.Mensaje || 'Error generando QR')
    }
  }

  async verifyQrStatus(params: VerifyQrStatusParams): Promise<VerifyQrStatusResponse> {
    try {
      const response = await this.apiClient.post<VerifyQrStatusResponse>(
        '/bcp/verificar-estado-qr',
        params,
      )
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.Mensaje || 'Error verificando estado del QR')
    }
  }
}

export default VeripagosService
