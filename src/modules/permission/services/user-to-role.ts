import { db } from '@/db/index'
import {
  type InsertParams,
  type SelectParams,
  userToRole as tableSchema
} from '@/db/schemas/user-to-role/index'
import {
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE
} from '@/global/constants/indext'
import { isEmpty } from '@/global/libs/index'
import type { PageParams, TimeRangeParams } from '@/types/index'
import {
  type SQLWrapper,
  and,
  count,
  eq,
  getTableColumns,
  gte,
  like,
  lte
} from 'drizzle-orm'

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

export const remove = async (params: Pick<SelectParams, 'id'>) => {
  const result = (await db
    .delete(tableSchema)
    .where(eq(tableSchema.id, params.id))
    .returning()
    .get()) as SelectParams | undefined
  return result
}

export const get = async (params: Pick<SelectParams, 'id'>) => {
  const result = (await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema.id, params.id))
    .get()) as SelectParams | undefined
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
