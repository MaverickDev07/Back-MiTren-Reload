/* eslint-disable max-lines */
import { Types } from 'mongoose'

import Line from '../../database/models/Line'
import Station from '../../database/models/Station'
import Route from '../../database/models/Route'
import ApiError from '../../errors/ApiError'
import Price from '../../database/models/Price'
import { StationPairPrices } from '../../resources/ticket_flow/types'

export default class StationPairPricesRepository {
  async getPricesByStationPair(
    start_station_id: string,
    end_station_id: string,
  ): Promise<StationPairPrices | null> {
    const startStation = await Station.findById(start_station_id)
    const endStation = await Station.findById(end_station_id)

    if (!startStation || !endStation) {
      throw new ApiError({
        name: 'MODEL_NOT_FOUND_ERROR',
        message: 'No se encontró la estación',
        status: 400,
        code: 'ERR_MNF',
      })
    }

    // Estación inicial y sus lineas
    const start_station = startStation.station_name
    const start_lines_id = startStation.line_id
    // Estación final y sus lineas
    const end_station = endStation.station_name
    const end_lines_id = endStation.line_id

    let is_transfer: boolean = true
    let line_id: Types.ObjectId | null = null
    let start_line: string = ''
    let end_line: string = ''

    // Verificar si hay una línea en común entre las estaciones de inicio y fin
    outerLoop: for (const startLine of start_lines_id) {
      for (const endLine of end_lines_id) {
        if (startLine.toString() === endLine.toString()) {
          is_transfer = false
          line_id = startLine
          break outerLoop
        }
      }
    }

    if (!is_transfer) {
      // Ruta directa sin transbordo
      const prices = await Price.find({
        'start_station.station_id': start_station_id,
        'end_station.station_id': end_station_id,
      })
        .select({ base_price: 1, customer_type: 1 })
        .sort({ base_price: -1 })
        .exec()

      const line_direct = await Line.findById(line_id)
      if (!line_direct) throw new Error('No se encontró la línea directa entre las estaciones.')
      const line_name: string = line_direct.line_name
      start_line = end_line = line_name

      return {
        prices,
        start_point: { start_station, start_line },
        end_point: { end_station, end_line },
        transfer_point: { is_transfer, transfer_station: '' },
      }
    } else {
      // Encontrar la mejor estación de trasbordo
      const transferStation = await this.findBestTransferStation(
        start_lines_id,
        end_lines_id,
        start_station_id,
        end_station_id,
      )

      const prices1 = await Price.find({
        'start_station.station_id': start_station_id,
        'end_station.station_id': transferStation._id,
      }).exec()

      const prices2 = await Price.find({
        'start_station.station_id': transferStation._id,
        'end_station.station_id': end_station_id,
      }).exec()

      // Combinar y sumar precios por 'customer_type' coincidentes
      const totalPrices = this.sumarPrecios(prices1, prices2)

      const { start_line, end_line } = await this.getStationLineNames(start_lines_id, end_lines_id)

      return {
        prices: totalPrices,
        start_point: { start_station, start_line },
        end_point: { end_station, end_line },
        transfer_point: { is_transfer, transfer_station: transferStation.station_name },
      }
    }
  }

  // Reemplazamos el uso de reduce con un bucle for...of para manejar las promesas correctamente
  /* eslint-disable-next-line max-params */
  private async findBestTransferStation(
    start_lines_id: Types.ObjectId[],
    end_lines_id: Types.ObjectId[],
    start_station_id: string,
    end_station_id: string,
  ): Promise<any> {
    // Encontrar estaciones de trasbordo que estén en las líneas de inicio y fin
    const transferStations = await Station.find({
      is_transfer_stop: true, // Debe ser una estación de trasbordo
      $and: [
        { line_id: { $in: start_lines_id } }, // Debe estar en las líneas de inicio
        { line_id: { $in: end_lines_id } }, // También en las líneas de destino
      ],
    }).exec()

    if (transferStations.length === 0) {
      throw new Error('No se encontró una estación de trasbordo válida.')
    }

    let bestTransferStation: { station: any; totalStops: number } | null = null
    let minTotalStops = Infinity

    for (const transferStation of transferStations) {
      let startToTransfer = Infinity
      let transferToEnd = Infinity

      // Obtener las rutas que conectan la estación de inicio y la estación de trasbordo
      const routeToTransfer = await Route.findOne({
        line_id: { $in: start_lines_id }, // Ruta en una de las líneas de inicio
        stations: { $elemMatch: { station_id: start_station_id } }, // Estación de inicio
      }).exec()

      // Obtener las rutas que conectan la estación de trasbordo y la estación final
      const routeFromTransfer = await Route.findOne({
        line_id: { $in: end_lines_id }, // Ruta en una de las líneas de fin
        stations: { $elemMatch: { station_id: end_station_id } }, // Estación de fin
      }).exec()

      if (!routeToTransfer || !routeFromTransfer) {
        // Si alguna de las rutas no existe, descartar esta estación de trasbordo
        continue
      }

      // Usamos Math.min y Math.abs para calcular la cantidad de paradas en cada ruta,
      // independientemente de la dirección (ida o vuelta)
      startToTransfer = Math.min(
        startToTransfer,
        this.getNumberOfStops(
          routeToTransfer.stations,
          start_station_id,
          transferStation._id.toString(),
        ),
      )

      transferToEnd = Math.min(
        transferToEnd,
        this.getNumberOfStops(
          routeFromTransfer.stations,
          transferStation._id.toString(),
          end_station_id,
        ),
      )

      // Calcular el total de estaciones (paradas)
      const totalStops = startToTransfer + transferToEnd

      // Comparar la cantidad de estaciones (paradas) con la mejor opción actual
      if (totalStops < minTotalStops) {
        minTotalStops = totalStops
        bestTransferStation = {
          station: transferStation,
          totalStops,
        }
      }
    }

    if (!bestTransferStation) {
      throw new Error('No se encontró una estación de trasbordo válida con rutas completas.')
    }

    return bestTransferStation.station
  }

  // Función auxiliar para contar el número de paradas entre dos estaciones
  private getNumberOfStops(stations: any[], startStationId: string, endStationId: string): number {
    const startIndex = stations.findIndex(
      station => station.station_id.toString() === startStationId,
    )
    const endIndex = stations.findIndex(station => station.station_id.toString() === endStationId)

    if (startIndex === -1 || endIndex === -1) {
      // Si no se encuentran las estaciones o están mal definidas
      return Infinity
    }

    // Calculamos el número de paradas con Math.abs para no tener en cuenta la dirección
    return Math.abs(endIndex - startIndex)
  }

  private sumarPrecios(prices1: any[], prices2: any[]): any[] {
    const priceMap = new Map()
    prices1.forEach(price => {
      priceMap.set(price.customer_type, price.base_price)
    })

    prices2.forEach(price => {
      const priceKey = price.customer_type
      if (priceMap.has(priceKey)) {
        priceMap.set(priceKey, priceMap.get(priceKey) + price.base_price)
      }
    })

    return Array.from(priceMap.entries()).map(([customer_type, base_price]) => ({
      customer_type,
      base_price,
    }))
  }

  private async getStationLineNames(
    start_lines_id: Types.ObjectId[],
    end_lines_id: Types.ObjectId[],
  ): Promise<{ start_line: string; end_line: string }> {
    // Obtener la estación de partida
    const startLine = await Line.findOne({ _id: { $in: start_lines_id } }).exec()
    if (!startLine) {
      throw new Error('No se encontró la línea de la estación de partida.')
    }
    const start_line = startLine.line_name

    // Obtener el line_name de la estación de destino, asegurándose de que sea diferente de la estación de partida
    const endLineIds = end_lines_id.filter(lineId => !start_lines_id.includes(lineId)) // Excluir líneas comunes
    if (endLineIds.length === 0) {
      throw new Error(
        'No se encontró una línea de destino válida que sea diferente de la línea de partida.',
      )
    }
    const endLine = await Line.findOne({ _id: { $in: endLineIds } }).exec()
    if (!endLine) {
      throw new Error('No se encontró la línea de la estación de destino.')
    }
    const end_line = endLine.line_name

    // Retornar los nombres de las líneas
    return { start_line, end_line }
  }
}
