import { LiqeQuery } from 'liqe'
import { depthOfObject } from './functions'

const maxSearchQueryDepth = 5

const operatorsMap: Record<string, string> = {
  ':': '$eq',
  ':=': '$eq',
  ':>': '$gt',
  ':>=': '$gte',
  ':<': '$lt',
  ':<=': '$lte',
  AND: '$and',
  OR: '$or',
}

const getMongooseWhereClause = (searchQuery: LiqeQuery, allowedFilterByFields: Array<string>) => {
  if (depthOfObject(searchQuery) > maxSearchQueryDepth) {
    throw new Error('Filter by has too many expressions')
  }

  const translateTagExpression = (ast: LiqeQuery) => {
    if (ast.type !== 'Tag') {
      throw new Error('Expected a tag expression.')
    }

    const { field, expression, operator } = ast

    if (field.type === 'ImplicitField') {
      throw new Error('Implicit fields are not supported')
    }

    if (!allowedFilterByFields.includes(field.name)) {
      throw new Error(`Field ${field.name} is not allowed in filter by`)
    }

    if (expression.type === 'RangeExpression') {
      return {
        [field.name]: {
          $gte: expression.range.min,
          $lte: expression.range.max,
        },
      }
    }

    if (expression.type === 'RegexExpression') {
      // Extraer el valor del regex, eliminando los delimitadores '/' y posibles flags al final
      const regex = expression.value.replace(/^\/|\/[a-z]*$/gi, '')

      return {
        [field.name]: {
          $regex: regex,
          $options: 'i',
        },
      }
    }

    if (expression.type !== 'LiteralExpression') {
      throw new Error('Expected a literal expression.')
    }

    if (!operatorsMap[operator.operator]) {
      throw new Error('Operator is not supported.')
    }

    return {
      [field.name]: {
        [operatorsMap[operator.operator]]: expression.value,
      },
    }
  }

  const translateExpression = (ast: LiqeQuery): Record<string, any> => {
    if (ast.type === 'Tag') {
      return translateTagExpression(ast)
    }

    if (ast.type === 'LogicalExpression') {
      if (!operatorsMap[ast.operator.operator]) {
        throw new Error('Logical operator is not supported.')
      }
      return {
        [operatorsMap[ast.operator.operator]]: [
          translateExpression(ast.left),
          translateExpression(ast.right),
        ],
      }
    }

    throw new Error('AST type is missing or not supported.')
  }

  return translateExpression(searchQuery)
}

export default getMongooseWhereClause
