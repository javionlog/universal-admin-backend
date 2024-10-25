import { db } from '@/db/index'
import {
  type SelectParams as ResourceSelectParams,
  resource as resourceTableSchema
} from '@/db/schemas/resource/index'
import { roleToResource as roleToResourceTableSchema } from '@/db/schemas/role-to-resource/index'
import {
  type InsertParams,
  type SelectParams,
  role as tableSchema
} from '@/db/schemas/role/index'
import {
  type SelectParams as UserSelectParams,
  user as userTableSchema
} from '@/db/schemas/user/index'
import {
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE
} from '@/global/constants/indext'
import { isEmpty, omitObject } from '@/global/libs/index'
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
  const result = (await db
    .insert(tableSchema)
    .values({
      ...params,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    .returning()
    .get()) as SelectParams
  return result
}

export const update = async (params: SelectParams) => {
  const restParams = omitObject(params, ['roleCode'])
  const result = (await db
    .update(tableSchema)
    .set(restParams)
    .where(eq(tableSchema.roleCode, params.roleCode))
    .returning()
    .get()) as SelectParams
  return result
}

export const remove = async (params: Pick<SelectParams, 'roleCode'>) => {
  const roleItem = await db.query.role.findFirst({
    with: {
      users: true,
      resources: true
    },
    where: () => eq(tableSchema.roleCode, params.roleCode)
  })
  if (roleItem?.users && roleItem.users.length > 0) {
    throw new Error(
      'The role is referenced by some users and can not be deleted'
    )
  }
  const result = await db.transaction(async tx => {
    if (roleItem?.resources && roleItem.resources.length > 0) {
      const resourceCodes = roleItem.resources.map(o => o.resourceCode)
      await tx
        .delete(roleToResourceTableSchema)
        .where(
          and(
            eq(roleToResourceTableSchema.roleCode, params.roleCode),
            inArray(roleToResourceTableSchema.resourceCode, resourceCodes)
          )
        )
    }
    return (await tx
      .delete(tableSchema)
      .where(eq(tableSchema.roleCode, params.roleCode))
      .returning()
      .get()) as SelectParams | undefined
  })
  return result
}

export const get = async (params: Pick<SelectParams, 'roleCode'>) => {
  const result = (await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema.roleCode, params.roleCode))
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

export const findUsers = async (
  params: PageParams & Pick<SelectParams, 'roleCode'>,
  returnAll?: boolean
) => {
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const roleItem = await db.query.role.findFirst({
    with: {
      users: true
    },
    where: () => eq(tableSchema.roleCode, restParams.roleCode)
  })

  if (!roleItem) {
    return {
      records: [],
      total: 0
    }
  }

  const usernames = roleItem.users.map(o => o.username)

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
  ) as UserSelectParams[]

  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}

export const findResources = async (
  params: PageParams & Pick<SelectParams, 'roleCode'>,
  returnAll?: boolean
) => {
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const roleItem = await db.query.role.findFirst({
    with: {
      resources: true
    },
    where: () => eq(tableSchema.roleCode, restParams.roleCode)
  })

  if (!roleItem) {
    return {
      records: [],
      total: 0
    }
  }

  const resourceCodes = roleItem.resources.map(o => o.resourceCode)

  const recordsDynamic = db.select().from(resourceTableSchema).$dynamic()
  const totalDynamic = db
    .select({ value: count() })
    .from(resourceTableSchema)
    .$dynamic()

  const whereFilters: SQLWrapper[] = [
    inArray(resourceTableSchema.resourceCode, resourceCodes)
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
  ) as ResourceSelectParams[]

  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}
