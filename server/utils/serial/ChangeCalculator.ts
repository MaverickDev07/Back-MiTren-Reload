export const COMMANDS: { [key: string]: number[] } = {
  //billetero
  BillEnables: [0x02, 0x06, 0x41, 0xff, 0xff, 0xb9],
  Status: [0x02, 0x04, 0xcc, 0x2e],
  AcceptBill: [0x02, 0x04, 0x80, 0x7a], // Aceptar billete en espera
  RejectBill: [0x02, 0x04, 0x81, 0x79], // Rechazar billete en espera
  InhibitBills: [0x02, 0x04, 0xf0, 0x0a], // Inhibir todos los billetes
  DesinhibitBilletero: [0x02, 0x04, 0xf1, 0x09], // Desinhibir billetero
  BilleteroEnEspera: [0x02, 0x05, 0x40, 0x00, 0xb6],
  Enable10: [0x02, 0x06, 0x41, 0x01, 0x01, 0xb5],
  Enable10_20: [0x02, 0x08, 0x41, 0x01, 0x01, 0x02, 0x02, 0xa9],
  Enable10_20_50: [0x02, 0x08, 0x41, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x59],
  Enable10_20_50_100: [0x02, 0x0a, 0x41, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x04, 0x04, 0x9f],
  Enable10_20_50_100_200: [
    0x02, 0x0c, 0x41, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x04, 0x04, 0x05, 0x05, 0x93,
  ],
  EnableAll: [0x02, 0x0c, 0x41, 0x01, 0x01, 0x02, 0x02, 0x03, 0x03, 0x04, 0x04, 0x05, 0x05, 0x93],

  //monedero
  EnableMonedero: [0x02, 0x00, 0x0c, 0x00, 0x3f, 0x00, 0x3f, 0x10, 0x03],
  InhibitMonedero: [0x02, 0x00, 0x0c, 0x00, 0x00, 0x00, 0x00, 0x10, 0x03],
  TubeStatus: [0x02, 0x00, 0x0a, 0x10, 0x03],
  PullMonedero: [0x02, 0x00, 0x0b, 0x10, 0x03], // Consulta monedero
  Cambio10Ctvs: [0x02, 0x00, 0x0f, 0x02, 0x01, 0x10, 0x03],
  Cambio20Ctvs: [0x02, 0x00, 0x0f, 0x02, 0x02, 0x10, 0x03],
  Cambio50Ctvs: [0x02, 0x00, 0x0f, 0x02, 0x05, 0x10, 0x03],
  Cambio1Bs: [0x02, 0x00, 0x0f, 0x02, 0x0a, 0x10, 0x03],
  Cambio1_50Bs: [0x02, 0x00, 0x0f, 0x02, 0x0f, 0x10, 0x03],
  Cambio2Bs: [0x02, 0x00, 0x0f, 0x02, 0x14, 0x10, 0x03],
  Cambio2_50Bs: [0x02, 0x00, 0x0f, 0x02, 0x19, 0x10, 0x03],
  Cambio3Bs: [0x02, 0x00, 0x0f, 0x02, 0x1e, 0x10, 0x03],
}

// Tabla de valores y comandos
export const CAMBIO_VALORES: { valor: number; comando: number[] }[] = [
  { valor: 3.0, comando: COMMANDS.Cambio3Bs },
  { valor: 2.5, comando: COMMANDS.Cambio2_50Bs },
  { valor: 2.0, comando: COMMANDS.Cambio2Bs },
  { valor: 1.5, comando: COMMANDS.Cambio1_50Bs },
  { valor: 1.0, comando: COMMANDS.Cambio1Bs },
  { valor: 0.5, comando: COMMANDS.Cambio50Ctvs },
  { valor: 0.2, comando: COMMANDS.Cambio20Ctvs },
  { valor: 0.1, comando: COMMANDS.Cambio10Ctvs },
]

export function calculateChangeCommands(change: number) {
  const commands = []
  let remainingChange = Math.round(change * 100) / 100

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