import { TicketEntity } from '../../../database/models/Ticket'

export const ticketDocument = (ticket: TicketEntity) => {
  const docDefinition = {
    pageSize: { width: 226, height: 'auto' },
    pageMargins: [15, 15, 15, 15],
    content: [
      {
        text: 'COMPRA TICKET "MI TREN"\n\n',
        style: 'header',
        alignment: 'center',
      },
      { qr: ticket?.id, fit: 100, alignment: 'center' },
      {
        text: [
          {
            text: `\nMÉTODO DE PAGO: `,
            bold: true,
            alignment: 'center',
          },
          `${ticket?.payment_method?.method_name}\n`,
          {
            text: `\nPROMOCiÓN: `,
            bold: true,
          },
          `${ticket?.promotion_title}\n`,
          ...ticket.prices.map(price => {
            return `\nCliente: ${price.customer_type}\nPrecio Unitario: ${price.base_price}Bs.-\nCantidad: ${price.qty}\n`
          }),
          {
            text: `\nPRECIO TOTAL\n`,
            bold: true,
            alignment: 'center',
            style: 'price_name',
          },
          {
            text: `${ticket?.total_price}Bs.-\n\n`,
            bold: true,
            alignment: 'center',
            style: 'price_total',
          },
        ],
        style: 'content',
      },
      {
        columns: [
          {
            text: [
              `${ticket?.route?.start_point?.start_station}\n`,
              {
                text: `${ticket?.route?.start_point?.start_line}\n`,
                bold: true,
                alignment: 'center',
              },
            ],
          },
          {
            text: [
              `${ticket?.route?.end_point?.end_station}\n`,
            ],
            style: 'content',
          },
        ],
        style: 'content',
      },
      {
        text: [
          {
            text: `${ticket?.route?.transfer_point?.is_transfer && '\nTRASBORDO'}\n`,
            bold: true,
            alignment: 'center',
          },
          {
            text: `${ticket?.route?.transfer_point?.is_transfer && ticket?.route?.transfer_point?.transfer_station}\n`,
            alignment: 'center',
          },
        ],
        style: 'content',
      },
    ],
    styles: {
      header: {
        fontSize: 9,
        alignment: 'center',
        bold: true,
      },
      content: {
        fontSize: 9,
        // alignment: 'justify',
      },
      price_name: {
        fontSize: 11,
      },
      price_total: {
        fontSize: 18,
      },
    },
  }
  return docDefinition
}
