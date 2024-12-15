import { Document } from 'mongoose'

type Price = {
  customer_type: string
  base_price: number
}
type StartPoint = {
  start_station: string
  start_line: string
}
type EndPoint = {
  end_station: string
  end_line: string
}
type TransferPoint = {
  is_transfer: boolean
  transfer_station: string
}

export type StationPairPrices = {
  prices: Array<Price>
  start_point: StartPoint
  end_point: EndPoint
  transfer_point: TransferPoint
}
