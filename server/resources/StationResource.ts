import BaseResource from './BaseResource'
import { StationAttributes, StationEntity } from '../database/models/Station'

class StationResource extends BaseResource<StationAttributes, StationEntity>() {
  item() {
    const stationResource: StationEntity = {
      id: this.instance.id,
      station_name: this.instance.station_name,
      line_id: this.instance.line_id,
      is_transfer_stop: this.instance.is_transfer_stop,
      location: this.instance.location,
      status: this.instance.status,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return stationResource
  }

  itemReduce() {
    const stationResource: StationEntity = {
      id: this.instance.id,
      station_name: this.instance.station_name,
      line_id: this.instance.line_id,
      location: this.instance.location,
    }
    return stationResource
  }
}

export default StationResource
