/* eslint-disable max-lines */
import mongoose, { Model, Document, FilterQuery, UpdateQuery, QueryOptions, Types } from 'mongoose'
import { parse } from 'liqe'

import ApiError from '../errors/ApiError'
import getMongooseWhereClause from '../utils/getMongooseWhereClause'

export default abstract class BaseRepository<T extends Document> {
  model: Model<T>
  protected allowedSortByFields: Array<string> = ['created_at']
  protected allowedFilterByFields: Array<string> = []

  constructor(model: Model<T>) {
    this.model = model
  }

  async getAll(options: Record<string, any> = {}): Promise<Array<T>> {
    const orderBy = this.getOrderBy(options.sortBy)
    delete options.sortBy
    options.sort = orderBy

    if (options.filterBy) {
      const filterConditions = Array.isArray(options.filterBy)
        ? options.filterBy.map((filter: string) => this.getFilterBy(filter))
        : [this.getFilterBy(options.filterBy)]

      // Combinar los filtros usando `$and`
      options.where = { $and: filterConditions }
      delete options.filterBy
    }

    return this.model
      .find(options.where || {})
      .sort(options.sort)
      .exec()
  }

  async getPaged(params: PagedParams): Promise<PaginationResult<any> | null> {
    const { limit, page, sortBy, filterBy } = params
    const orderBy = this.getOrderBy(sortBy)
    const options: Record<string, any> = { sort: orderBy, filterBy }

    if (options.filterBy) {
      const filterConditions = Array.isArray(options.filterBy)
        ? options.filterBy.map((filter: string) => this.getFilterBy(filter))
        : [this.getFilterBy(options.filterBy)]

      // Combinar los filtros usando `$and`
      options.where = { $and: filterConditions }
      delete options.filterBy
    }

    const docs: Array<T> = await this.model
      .find(options.where || {})
      .sort(options.sort)
      .exec()

    // Realizar la paginación manualmente
    const totalDocs = docs.length
    const startIndex = (page - 1) * limit
    const endIndex = page * limit
    const hasPrevPage = page > 1
    const hasNextPage = endIndex < totalDocs
    const prevPage = hasPrevPage ? page - 1 : null
    const nextPage = hasNextPage ? page + 1 : null

    const paginated = docs.slice(startIndex, endIndex)

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

  async getById(id: string | Types.ObjectId, options: QueryOptions = {}): Promise<T | null> {
    return this.model.findById(id, options).exec()
  }

  async create(body: Record<string, any>): Promise<T> {
    await this.validateReferences(body)
    return this.model.create(body)
  }

  async update(id: string | Types.ObjectId, body: UpdateQuery<T>): Promise<T | null> {
    await this.validateReferences(body)
    return this.model.findByIdAndUpdate(id, body, { new: true }).exec()
  }

  async delete(id: string | Types.ObjectId): Promise<T | null> {
    const instance = await this.model.findByIdAndDelete(id).exec() // Cambiamos a findByIdAndDelete para retornar el documento eliminado
    if (!instance) {
      throw new ApiError({
        name: 'NOT_FOUND_ERROR',
        message: 'Resource not found',
        status: 404,
        code: 'ERR_NF',
      })
    }
    return instance
  }

  protected getOrderBy(sortBy: string | undefined): Record<string, any> {
    const orderBy: Record<string, any> = { createdAt: -1 } // Por defecto ordenado por 'created_at' descendente

    if (!sortBy) {
      return orderBy
    }

    const parts = sortBy.split('-')

    if (!this.allowedSortByFields.includes(parts[0])) {
      return orderBy
    }

    if (!parts[1] || !['asc', 'desc'].includes(parts[1].toLowerCase())) {
      return orderBy
    }

    return { [parts[0]]: parts[1].toLowerCase() === 'asc' ? 1 : -1 }
  }

  protected getFilterBy(filterBy: string): FilterQuery<T> {
    try {
      return getMongooseWhereClause(parse(filterBy), this.allowedFilterByFields)
    } catch (error: any) {
      throw new ApiError({
        name: 'FILTER_BY_ERROR',
        message: error.message,
        status: 400,
        code: 'ERR_FTB',
      })
    }
  }

  protected async validateReferences(body: Record<string, any>): Promise<void> {
    const idFields = Object.keys(body).filter(key => key.endsWith('_id'))

    for (const field of idFields) {
      const modelName = this.convertToCamelCase(field.replace('_id', ''))

      const model = this.getModelByName(modelName)

      if (!model) {
        throw new ApiError({
          name: 'MODEL_NOT_FOUND_ERROR',
          message: `Model ${modelName} not found`,
          status: 400,
          code: 'ERR_MNF',
        })
      }

      // Verificar si existe el documento referenciado
      const exists = await model.exists({ _id: body[field] })
      if (!exists) {
        throw new ApiError({
          name: 'REFERENCE_ERROR',
          message: `Referenced ${modelName} with id ${body[field]} not found`,
          status: 400,
          code: 'ERR_REF',
        })
      }
    }
  }

  protected convertToCamelCase(input: string): string {
    return input
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
  }

  protected getModelByName<T extends mongoose.Document>(modelName: string): Model<T> | undefined {
    return mongoose.models[modelName] as Model<T> | undefined
  }
}
