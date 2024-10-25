import { db } from '@/db/index'
import {
  type InsertParams,
  type SelectParams,
  resource as tableSchema
} from '@/db/schemas/resource/index'
import {
  type SelectParams as RoleSelectParams,
  role as roleTableSchema
} from '@/db/schemas/role/index'
import {
  type SelectParams as UserSelectParams,
  user as userTableSchema
} from '@/db/schemas/user/index'
import {
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE,
  RESOURCE_TYPE
} from '@/global/constants/indext'
import { isEmpty, listToTree, omitObject } from '@/global/libs/index'
import type { PageParams, TimeRangeParams } from '@/types/index'
import {
  type SQLWrapper,
  and,
  count,
  eq,
  getTableColumns,
  gte,
  inArray,
  like,
  lte
} from 'drizzle-orm'

export type FindParams = SelectParams & PageParams & TimeRangeParams

export const create = async (params: InsertParams) => {
  const valueParams = { ...params }
  if (valueParams.resourceType === RESOURCE_TYPE.page) {
    if (isEmpty(valueParams.path)) {
      throw new Error('Page type, the path can not be empty')
    }
    if (isEmpty(valueParams.component)) {
      valueParams.component = valueParams.path
    }
  }
  const result = (await db
    .insert(tableSchema)
    .values({
      ...valueParams,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    .returning()
    .get()) as SelectParams
  return result
}

export const update = async (params: SelectParams) => {
  const restParams = omitObject(params, ['resourceCode'])
  const result = (await db
    .update(tableSchema)
    .set(restParams)
    .where(eq(tableSchema.resourceCode, params.resourceCode))
    .returning()
    .get()) as SelectParams
  return result
}

export const remove = async (params: Pick<SelectParams, 'resourceCode'>) => {
  const resourceItem = await db.query.resource.findFirst({
    with: {
      roles: true
    },
    where: () => eq(tableSchema.resourceCode, params.resourceCode)
  })
  if (resourceItem?.roles && resourceItem.roles.length > 0) {
    throw new Error(
      'The resource is referenced by some roles and can not be deleted'
    )
  }
  const result = (await db
    .delete(tableSchema)
    .where(eq(tableSchema.resourceCode, params.resourceCode))
    .returning()
    .get()) as SelectParams | undefined

  return result
}

export const get = async (params: Pick<SelectParams, 'resourceCode'>) => {
  const result = (await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema.resourceCode, params.resourceCode))
    .get()) as SelectParams | undefined
  return result
}

export const find = async (
  params: Partial<FindParams>,
  returnAll?: boolean
) => {
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const recordsDynamic = db.select().from(tableSchema).$dynamic()
  const totalDynamic = db
    .select({ value: count() })
    .from(tableSchema)
    .$dynamic()
  const whereFilters: SQLWrapper[] = []

  for (const k of Object.keys(restParams)) {
    type Key = keyof typeof restParams
    const key = k as Key
    const val = restParams[key as Key]
    if (!isEmpty(val)) {
      switch (key) {
        case 'createdFrom': {
          whereFilters.push(gte(tableSchema.createdAt, val as number))
          break
        }
        case 'createdTo': {
          whereFilters.push(lte(tableSchema.createdAt, val as number))
          break
        }
        case 'updatedFrom': {
          whereFilters.push(gte(tableSchema.updatedAt, val as number))
          break
        }
        case 'updatedTo': {
          whereFilters.push(lte(tableSchema.updatedAt, val as number))
          break
        }
        default: {
          whereFilters.push(like(tableSchema[key], `%${val}%`))
          break
        }
      }
    }
  }

  recordsDynamic.where(and(...whereFilters))
  totalDynamic.where(and(...whereFilters))

  const records = (
    returnAll
      ? await recordsDynamic.all()
      : await recordsDynamic
          .offset((pageIndex - 1) * pageSize)
          .limit(pageSize)
          .all()
  ) as SelectParams[]

  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}

export const findTree = async (params: Partial<FindParams>) => {
  const { records } = await find(params, true)
  const result = listToTree(records, {
    judgeParentIdFn: item => item.parentId === 0
  })
  return result
}

export const findRoles = async (
  params: PageParams & Pick<SelectParams, 'resourceCode'>,
  returnAll?: boolean
) => {
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const resourceItem = await db.query.resource.findFirst({
    with: {
      roles: true
    },
    where: () => eq(tableSchema.resourceCode, restParams.resourceCode)
  })

  if (!resourceItem) {
    return {
      records: [],
      total: 0
    }
  }

  const roleCodes = resourceItem.roles.map(o => o.roleCode)

  const recordsDynamic = db.select().from(roleTableSchema).$dynamic()
  const totalDynamic = db
    .select({ value: count() })
    .from(roleTableSchema)
    .$dynamic()

  const whereFilters: SQLWrapper[] = [
    inArray(roleTableSchema.roleCode, roleCodes)
  ]

  recordsDynamic.where(and(...whereFilters))
  totalDynamic.where(and(...whereFilters))

  const records = (
    returnAll
      ? await recordsDynamic.all()
      : await recordsDynamic
          .offset((pageIndex - 1) * pageSize)
          .limit(pageSize)
          .all()
  ) as RoleSelectParams[]

  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}

export const findUsers = async (
  params: PageParams & Pick<SelectParams, 'resourceCode'>,
  returnAll?: boolean
) => {
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const resourceItem = await db.query.resource.findFirst({
    with: {
      roles: true
    },
    where: () => eq(tableSchema.resourceCode, restParams.resourceCode)
  })

  if (!resourceItem) {
    return {
      records: [],
      total: 0
    }
  }

  const roleCodes = resourceItem.roles.map(o => o.roleCode)

  const userList = await db.query.role.findMany({
    with: {
      users: true
    },
    where: fields => inArray(fields.roleCode, roleCodes)
  })

  const usernames = userList.flatMap(o => o.users).map(o => o.username)

  const { password, ...restUserColumns } = getTableColumns(userTableSchema)
  const recordsDynamic = db
    .select(restUserColumns)
    .from(userTableSchema)
    .$dynamic()
  const totalDynamic = db
    .select({ value: count() })
    .from(userTableSchema)
    .$dynamic()

  const whereFilters: SQLWrapper[] = [
    inArray(userTableSchema.username, usernames)
  ]

  recordsDynamic.where(and(...whereFilters))
  totalDynamic.where(and(...whereFilters))

  const records = (
    returnAll
      ? await recordsDynamic.all()
      : await recordsDynamic
          .offset((pageIndex - 1) * pageSize)
          .limit(pageSize)
          .all()
  ) as Omit<UserSelectParams, 'password'>[]

  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}
