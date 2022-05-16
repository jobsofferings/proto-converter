import { isEmpty } from 'lodash'
import {
  GraphQLFieldConfigMap,
  GraphQLInputObjectType,
  GraphQLObjectType,
  printType,
} from 'graphql'
import {
  maybeQueryMethod,
  assembleComment,
  getMethods,
  fullTypeName,
  ProtoInfo,
  DEFAULT_REQUEST_PREFIX,
  createGraphqlMethodName,
  LINE_FEED,
} from '../utils'
import { Method } from 'protobufjs'

type MethodsConfig = GraphQLFieldConfigMap<any, any>[]

const createGraphqlMethods = (
  methods: MethodsConfig,
  type: 'Query' | 'Mutation' = 'Query',
) => {
  if (isEmpty(methods)) return ''
  const fields = methods.reduce((result, current) => {
    return Object.assign(result, current)
  }, {})
  const requests = new GraphQLObjectType({
    name: type,
    fields,
  })
  return printType(requests)
}

const assembleRequestItem = (method: protobuf.Method, root: protobuf.Root) => {
  const { comment, requestType, responseType } = method
  const requestObj = root.lookup(requestType)
  const returnType = new GraphQLObjectType({
    name: fullTypeName(root.lookup(responseType)),
    fields: {},
  })
  const request = new GraphQLInputObjectType({
    name: fullTypeName(requestObj),
    fields: {},
  })
  const baseRequestConfig = {
    type: returnType,
    description: assembleComment({ comment, label: '' }) || null,
  }
  const hasFields = !isEmpty((requestObj as protobuf.Type).fields)
  if (hasFields) {
    baseRequestConfig['args'] = {
      [DEFAULT_REQUEST_PREFIX]: { type: request },
    }
  }
  return {
    [createGraphqlMethodName(method)]: baseRequestConfig,
  }
}

const createGraphqlRequest = ({ proto, root }: ProtoInfo) => {
  const methods = getMethods(proto)
  const querys: MethodsConfig = []
  const mutations: MethodsConfig = []
  methods.forEach((m: Method) => {
    const r = assembleRequestItem(m, root)
    maybeQueryMethod(m.name) ? querys.push(r) : mutations.push(r)
  })
  return [
    createGraphqlMethods(querys),
    createGraphqlMethods(mutations, 'Mutation'),
  ].join(`${LINE_FEED}${LINE_FEED}`)
}

export default createGraphqlRequest
