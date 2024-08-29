import { db } from '@/db/index'
import {
  type InsertUserParams,
  type SelectUserParams,
  user
} from '@/db/schemas/user/index'
import {
  defaultPageIndex,
  defaultPageSize
} from '@/modules/shared/constants/indext'
import type { PageParams, TimeRangeParams } from '@/types/index'
import { count, eq, getTableColumns, gte, like, lte } from 'drizzle-orm'

export type FindUsersParams = SelectUserParams & PageParams & TimeRangeParams

export const createUser = async (params: InsertUserParams) => {
  const result = await db
    .insert(user)
    .values({
      ...params,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    .returning()
    .get()
  const { password, ...rest } = result
  return rest
}

export const getSensitiveUserById = async (
  params: Pick<SelectUserParams, 'id'>
) => {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.id, params.id))
    .get()
  return result
}

export const getUserById = async (params: Pick<SelectUserParams, 'id'>) => {
  const result = await getSensitiveUserById(params)
  if (result) {
    const { password, ...rest } = result
    return rest
  }
  return result
}

export const getSensitiveUserByUsername = async (
  params: Pick<SelectUserParams, 'username'>
) => {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.username, params.username))
    .get()
  return result
}

export const getUserByUsername = async (
  params: Pick<SelectUserParams, 'username'>
) => {
  const result = await getSensitiveUserByUsername(params)
  if (result) {
    const { password, ...rest } = result
    return rest
  }
  return result
}

export const findUsers = async (params: Partial<FindUsersParams>) => {
  const { password, ...rest } = getTableColumns(user)
  const {
    pageIndex = defaultPageIndex,
    pageSize = defaultPageSize,
    ...restParams
  } = params
  const recordsDynamic = db.select(rest).from(user).$dynamic()
  const totalDynamic = db.select({ value: count() }).from(user).$dynamic()

  for (const k of Object.keys(restParams)) {
    type Key = keyof typeof restParams
    const key = k as Key
    const val = restParams[key as Key]
    if (val) {
      switch (key) {
        case 'createdFrom': {
          recordsDynamic.where(gte(user.createdAt, val as number))
          totalDynamic.where(gte(user.createdAt, val as number))
          break
        }
        case 'createdTo': {
          recordsDynamic.where(lte(user.createdAt, val as number))
          totalDynamic.where(lte(user.createdAt, val as number))
          break
        }
        case 'updatedFrom': {
          recordsDynamic.where(gte(user.updatedAt, val as number))
          totalDynamic.where(gte(user.updatedAt, val as number))
          break
        }
        case 'updatedTo': {
          recordsDynamic.where(lte(user.updatedAt, val as number))
          totalDynamic.where(lte(user.updatedAt, val as number))
          break
        }
        default: {
          recordsDynamic.where(like(user[key], `%${val}%`))
          totalDynamic.where(like(user[key], `%${val}%`))
          break
        }
      }
    }
  }

  const records = await recordsDynamic
    .offset((pageIndex - 1) * pageSize)
    .limit(pageSize)
    .all()
  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}
