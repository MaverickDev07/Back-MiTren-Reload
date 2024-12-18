import { Types } from 'mongoose'
import Price, { PriceAttributes } from '../database/models/Price'
import Route from '../database/models/Route'
import ApiError from '../errors/ApiError'
import BaseRepository from './BaseRepository'
import CustomerType from '../database/models/CustomerType'

export default class PriceRepository extends BaseRepository<PriceAttributes> {
  protected allowedSortByFields = ['customer_type', 'status', 'createdAt', 'updatedAt']
  protected allowedFilterByFields = ['customer_type', 'start_station', 'end_station', 'createdAt']

  constructor() {
    super(Price)
  }

  async getByLineId(id: string | Types.ObjectId): Promise<any> {

    const lineId = typeof id === 'string' ? Types.ObjectId(id) : id;

    console.log(lineId);
    const route = await Route.findOne({ line_id: lineId, status: 'ACTIVE' }).exec();
    const customerTypes = await CustomerType.find({ status: 'ACTIVE' }).exec();
    const response: any = [];
  
    if (!route) {
      throw new ApiError({
        name: 'STATIONS_NOT_IN_ROUTE',
        message: 'Las estaciones no pertenecen a la misma ruta.',
        status: 400,
        code: 'ERR_SNR',
      });
    }

    // Obtener todas las combinaciones de estaciones en la ruta
    for (const [index, start_station] of route.stations.entries()) {
      for (const end_station of route.stations.slice(index + 1)) {
        const prices = []
        for (const customer_type of customerTypes) {
          const price: any = await Price.findOne({
            customer_type_id: customer_type.id,
            customer_type: customer_type.customer_type,
            'start_station.station_id': start_station.station_id,
            'end_station.station_id': end_station.station_id,
          })
          prices.push({
            customer_type_id: customer_type.id,
            customer_type: customer_type.customer_type,
            base_price: price ? price.base_price : 0,
          })
        }

        response.push({
          start_station,
          end_station,
          prices,
        })
      }
    }

    return response
  }

  async createOrUpdatePrices(
    start_station_id: string,
    end_station_id: string,
    price: any,
  ): Promise<any> {
    const route = await Route.findOne({
      'stations.station_id': { $all: [start_station_id, end_station_id] },
    });

    if (!route) {
      throw new ApiError({
        name: 'STATIONS_NOT_IN_ROUTE',
        message: 'Las estaciones no pertenecen a la misma ruta.',
        status: 400,
        code: 'ERR_SNR',
      })
    }

    const startIndex = route.stations.findIndex(
      station => station.station_id.toString() === start_station_id,
    );
    const endIndex = route.stations.findIndex(
      station => station.station_id.toString() === end_station_id,
    )
    const selectedStations = route.stations.slice(startIndex, endIndex + 1)
    let modifiedCount = 0
    let upsertedCount = 0

    for (const [index1, station1] of selectedStations.entries()) {
      for (const station2 of selectedStations.slice(index1 + 1)) {
        const priceData = {
          ...price,
          start_station: {
            station_id: station1.station_id,
            station_name: station1.station_name,
          },
          end_station: {
            station_id: station2.station_id,
            station_name: station2.station_name,
          },
        }

        const createOrUpdatePrice = await Price.updateOne(
          {
            customer_type: price.customer_type.toUpperCase(),
            customer_type_id: price.customer_type_id,
            'start_station.station_id': station1.station_id,
            'end_station.station_id': station2.station_id,
          },
          priceData,
          { upsert: true },
        )

        if (createOrUpdatePrice.n === 0 && createOrUpdatePrice.ok) {
          upsertedCount++; // Si no hubo coincidencias y la operación fue exitosa
        } else if (createOrUpdatePrice.n > 0) {
          modifiedCount++; // Al menos un documento fue modificado
        }
      }
    }

    return {
      upsertedCount,
      modifiedCount,
      rangeStations: selectedStations.map(station => station.station_name),
    }
  }
}
