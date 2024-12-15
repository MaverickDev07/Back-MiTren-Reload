import fs from 'fs'
import PdfPrinter from 'pdfmake'
import path from 'path'

const FONTS: Record<string, string[]> = {
  Roboto: [
    'Roboto/Roboto-Regular.ttf',
    'Roboto/Roboto-Medium.ttf',
    'Roboto/Roboto-Italic.ttf',
    'Roboto/Roboto-MediumItalic.ttf',
  ],
  FiraCode: [
    'FiraCode/Fira Code Regular Nerd Font Complete.ttf',
    'FiraCode/Fira Code Bold Nerd Font Complete.ttf',
    'FiraCode/Fira Code Light Nerd Font Complete.ttf',
    'FiraCode/Fira Code SemiBold Nerd Font Complete.ttf',
  ],
}

interface PdfDocDefinition {
  content: any
  styles?: Record<string, any>
  defaultStyle?: Record<string, any>
}

export const createPdfBinary = (
  pdfDoc: PdfDocDefinition,
  callback: (data: string) => void,
  font: keyof typeof FONTS = 'Roboto',
): void => {
  const fontDescriptors = {
    [font]: {
      normal: path.join(__dirname, '..', `utils/files/fonts/${FONTS[font][0]}`),
      bold: path.join(__dirname, '..', `utils/files/fonts/${FONTS[font][1]}`),
      italics: path.join(__dirname, '..', `utils/files/fonts/${FONTS[font][2]}`),
      bolditalics: path.join(__dirname, '..', `utils/files/fonts/${FONTS[font][3]}`),
    },
  }
  const printer = new PdfPrinter(fontDescriptors)

  const doc = printer.createPdfKitDocument(pdfDoc, {})

  const chunks: Buffer[] = []
  let result: Buffer

  doc.on('data', (chunk: Buffer) => {
    chunks.push(chunk)
  })
  doc.on('end', () => {
    result = Buffer.concat(chunks)
    callback(result.toString('base64'))
  })
  doc.end()
}

export const createPdfFile = (
  pdfDoc: PdfDocDefinition,
  nameFile: string,
  font: keyof typeof FONTS = 'FiraCode',
): void => {
  const fontDescriptors = {
    [font]: {
      normal: path.join(__dirname, '..', `utils/files/fonts/${FONTS[font][0]}`),
      bold: path.join(__dirname, '..', `utils/files/fonts/${FONTS[font][1]}`),
      italics: path.join(__dirname, '..', `utils/files/fonts/${FONTS[font][2]}`),
      bolditalics: path.join(__dirname, '..', `utils/files/fonts/${FONTS[font][3]}`),
    },
  }
  const printer = new PdfPrinter(fontDescriptors)

  const doc = printer.createPdfKitDocument(pdfDoc, {})
  doc.pipe(fs.createWriteStream(path.join(__dirname, '..', 'utils/files/pdf', `${nameFile}.pdf`)))
  doc.end()
}
