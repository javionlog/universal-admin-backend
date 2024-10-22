import { db } from '@/db/index'
import {
  type InsertParams,
  type SelectParams,
  userToRole as tableSchema
} from '@/db/schemas/user-to-role/index'
import { primaryKey } from '@/db/shared/index'
import {
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE
} from '@/modules/shared/constants/indext'
import { isEmpty } from '@/modules/shared/libs/index'
import type { PageParams, TimeRangeParams } from '@/types/index'
import { count, eq, getTableColumns, gte, like, lte } from 'drizzle-orm'

export type FindParams = SelectParams & TimeRangeParams & PageParams

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

export const find = async (
  params: Partial<FindParams>,
  returnAll?: boolean
) => {
  const columns = getTableColumns(tableSchema)
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const recordsDynamic = db.select(columns).from(tableSchema).$dynamic()
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
