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
import { get as getRole } from '@/modules/permission/services/role'
import { get as getUser } from '@/modules/user/services/index'
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
  const userItem = await getUser({
    username: params.username
  })
  if (!userItem) {
    throw new Error('Can not find user')
  }
  const roleItem = await getRole({
    roleCode: params.roleCode
  })
  if (!roleItem) {
    throw new Error('Can not find role')
  }
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

export const remove = async (
  params: Pick<SelectParams, 'username' | 'roleCode'>
) => {
  const result = await db
    .delete(tableSchema)
    .where(
      and(
        eq(tableSchema.username, params.username),
        eq(tableSchema.roleCode, params.roleCode)
      )
    )
    .returning()
    .get()
  if (!result) {
    throw new Error('Can not find user to role')
  }
  return result as SelectParams
}

export const find = async (
  params: Partial<FindParams>,
  config?: { isReturnAll?: boolean }
) => {
  const columns = getTableColumns(tableSchema)
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params

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

  const recordsDynamic = db
    .select(columns)
    .from(tableSchema)
    .where(and(...whereFilters))
  const totalDynamic = db
    .select({ value: count() })
    .from(tableSchema)
    .where(and(...whereFilters))

  const records = (
    config?.isReturnAll
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
