import { SerialPort } from 'serialport'
import { ByteLengthParser } from '@serialport/parser-byte-length'

type ParityName = 'none' | 'even' | 'odd' | 'mark'

export function createSerialPort(path: string, baudRate: number, parity: ParityName): SerialPort {
  return new SerialPort({
    path,
    baudRate,
    dataBits: 8,
    parity,
    stopBits: 1,
    rtscts: false,
  })
}

export function createParser(port: SerialPort, length: number) {
  return port.pipe(new ByteLengthParser({ length }))
}
