import { db } from '@/db/index'
import {
  type InsertParams,
  type SelectParams,
  user as tableSchema
} from '@/db/schemas/user/index'
import {
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE
} from '@/modules/shared/constants/indext'
import { isEmpty, omitObject } from '@/modules/shared/libs/index'
import type { PageParams, TimeRangeParams } from '@/types/index'
import { count, eq, getTableColumns, gte, like, lte } from 'drizzle-orm'

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
  return omitObject(result, ['password'])
}

export const update = async (params: SelectParams) => {
  const restParams = omitObject(params, ['username', 'password'])
  const result = (await db
    .update(tableSchema)
    .set(restParams)
    .where(eq(tableSchema.username, params.username))
    .returning()
    .get()) as SelectParams
  return omitObject(result, ['password'])
}

export const remove = async (params: Pick<SelectParams, 'id'>) => {
  const result = (await db
    .delete(tableSchema)
    .where(eq(tableSchema.id, params.id))
    .returning()
    .get()) as SelectParams
  return result ? omitObject(result, ['password']) : result
}

export const getSensitive = async (params: Pick<SelectParams, 'id'>) => {
  const result = (await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema.id, params.id))
    .get()) as SelectParams
  return result
}

export const gainSensitive = async (params: Pick<SelectParams, 'username'>) => {
  const result = (await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema.username, params.username))
    .get()) as SelectParams
  return result
}

export const get = async (params: Pick<SelectParams, 'id'>) => {
  const result = await getSensitive(params)
  if (result) {
    const { password, ...rest } = result
    return rest
  }
  return result
}

export const gain = async (params: Pick<SelectParams, 'username'>) => {
  const result = await gainSensitive(params)
  if (result) {
    const { password, ...rest } = result
    return rest
  }
  return result
}

export const find = async (
  params: Partial<FindParams>,
  returnAll?: boolean
) => {
  const { password, ...rest } = getTableColumns(tableSchema)
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const recordsDynamic = db.select(rest).from(tableSchema).$dynamic()
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
