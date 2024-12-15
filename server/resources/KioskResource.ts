import BaseResource from './BaseResource'
import { KioskAttributes, KioskEntity } from '../database/models/Kiosk'
import StationResource from './StationResource'

class KioskResource extends BaseResource<KioskAttributes, KioskEntity>() {
  item() {
    const kioskResource: KioskEntity = {
      id: this.instance.id,
      kiosk_code: this.instance.kiosk_code,
      kiosk_type: this.instance.kiosk_type,
      station_id: this.instance.station_id,
      status: this.instance.status,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return kioskResource
  }

  itemPopulate() {
    const kioskResource: KioskEntity = {
      id: this.instance.id,
      kiosk_code: this.instance.kiosk_code,
      kiosk_type: this.instance.kiosk_type,
      station: this.formatStation(this.instance.station_id),
      status: this.instance.status,
      createdAt: this.instance.createdAt,
      updatedAt: this.instance.updatedAt,
    }

    return kioskResource
  }

  private formatStation(station: any) {
    if (!station) return null

    const stationResource = new StationResource(station)
    return stationResource.itemReduce()
  }
}

export default KioskResource
