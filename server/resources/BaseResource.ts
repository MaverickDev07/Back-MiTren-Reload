import ApiError from '../errors/ApiError'

function BaseResource<A, E>() {
  return class Resource {
    instance: A
    constructor(instance: A | null) {
      if (!instance) {
        throw new ApiError({
          name: 'NOT_FOUND_ERROR',
          message: 'Entity not found',
          status: 404,
          code: 'ERR_NF',
        })
      }
      this.instance = instance
    }

    item(): E {
      throw new ApiError({
        name: 'METHOD_NOT_IMPLEMENTED',
        message: 'Method item() must be implemented in resource entity class',
        status: 400,
        code: 'NOT_IMPL',
      })
    }

    static collection(entities: Array<A>): Array<E> | undefined {
      if (!entities) {
        return
      }
      return entities.map(instance => {
        const resource = new this(instance)
        return resource.item()
      })
    }

    static paged(paginatedResult: PaginationResult<A>): PaginationResult<E> | undefined {
      if (!paginatedResult || !paginatedResult.docs) {
        return
      }

      const {
        docs,
        totalDocs,
        limit,
        totalPages,
        page,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      } = paginatedResult

      // Convertir los docs (items paginados) usando el método item()
      const paginatedDocs = docs.map(instance => {
        const resource = new this(instance)
        return resource.item()
      })

      // Retornar la estructura de paginación con los items transformados
      return {
        docs: paginatedDocs,
        totalDocs,
        limit,
        totalPages,
        page,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      }
    }
  }
}

export default BaseResource
