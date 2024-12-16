import Route, { RouteAttributes } from '../database/models/Route'
import ApiError from '../errors/ApiError'
import BaseRepository from './BaseRepository'

export default class RouteRepository extends BaseRepository<RouteAttributes> {
  protected allowedSortByFields = ['status', 'createdAt', 'updatedAt']
  protected allowedFilterByFields = ['line_id', 'stations']

  constructor() {
    super(Route)
  }

  async getPagedStationsByLine(params: PagedStationsParams): Promise<PaginationResult<any> | null> {
    const { id, limit, page } = params
    const route = await Route.findOne({ line_id: id }, { stations: 1 }).exec()
    if (!route) {
      throw new ApiError({
        name: 'MODEL_NOT_FOUND_ERROR',
        message: 'No se encontró la línea',
        status: 400,
        code: 'ERR_MNF',
      })
    }

    // Realizar la paginación manualmente
    const totalDocs = route.stations.length
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const hasPrevPage = page > 1
    const hasNextPage = endIndex < totalDocs
    const prevPage = hasPrevPage ? page - 1 : null
    const nextPage = hasNextPage ? page + 1 : null

    // const paginated = route.stations.slice(startIndex, endIndex) /*/ _id: ObjectId('66f187fef3d281d6c0c695fb')
    const paginated = route.stations.slice(startIndex, endIndex).map(station => ({
      id: station.station_id.toString(),
      station_name: station.station_name,
    }));

    // Devolver paginación
    const paginacion = {
      docs: paginated,
      totalDocs,
      limit,
      totalPages: Math.ceil(totalDocs / limit),
      page,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
    }

    return paginacion
  }
}
