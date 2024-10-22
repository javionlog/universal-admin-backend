import { db } from '@/db/index'
import {
  type InsertParams,
  type SelectParams,
  resource as tableSchema,
  uniqueKey
} from '@/db/schemas/resource/index'
import { primaryKey } from '@/db/shared/index'
import {
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE,
  RESOURCE_TYPE
} from '@/modules/shared/constants/indext'
import { isEmpty, listToTree, omitObject } from '@/modules/shared/libs/index'
import type { PageParams, TimeRangeParams } from '@/types/index'
import { count, eq, gte, like, lte } from 'drizzle-orm'

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
  const restParams = omitObject(params, [primaryKey])
  const result = (await db
    .update(tableSchema)
    .set(restParams)
    .where(eq(tableSchema[primaryKey], params[primaryKey]))
    .returning()
    .get()) as SelectParams
  return result
}

export const remove = async (params: Pick<SelectParams, typeof primaryKey>) => {
  const result = (await db
    .delete(tableSchema)
    .where(eq(tableSchema[primaryKey], params[primaryKey]))
    .returning()
    .get()) as SelectParams
  return result
}

export const get = async (params: Pick<SelectParams, typeof primaryKey>) => {
  const result = (await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema[primaryKey], params[primaryKey]))
    .get()) as SelectParams
  return result
}

export const gain = async (params: Pick<SelectParams, typeof uniqueKey>) => {
  const result = (await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema[uniqueKey], params[uniqueKey]))
    .get()) as SelectParams
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

  for (const k of Object.keys(restParams)) {
    type Key = keyof typeof restParams
    const key = k as Key
    const val = restParams[key as Key]
    if (!isEmpty(val)) {
      switch (key) {
        case 'createdFrom': {
          recordsDynamic.where(gte(tableSchema.createdAt, val as number))
          totalDynamic.where(gte(tableSchema.createdAt, val as number))
          break
        }
        case 'createdTo': {
          recordsDynamic.where(lte(tableSchema.createdAt, val as number))
          totalDynamic.where(lte(tableSchema.createdAt, val as number))
          break
        }
        case 'updatedFrom': {
          recordsDynamic.where(gte(tableSchema.updatedAt, val as number))
          totalDynamic.where(gte(tableSchema.updatedAt, val as number))
          break
        }
        case 'updatedTo': {
          recordsDynamic.where(lte(tableSchema.updatedAt, val as number))
          totalDynamic.where(lte(tableSchema.updatedAt, val as number))
          break
        }
        default: {
          recordsDynamic.where(like(tableSchema[key], `%${val}%`))
          totalDynamic.where(like(tableSchema[key], `%${val}%`))
          break
        }
      }
    }
  }

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

export const findTree = async () => {
  const { records } = await find({}, true)
  const result = listToTree(
    records,
    { childrenKey: 'children' },
    item => item.parentId === 0
  )
  return result
}
