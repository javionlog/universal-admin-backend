import { db } from '@/db/index'
import {
  type insertUserSchema,
  type selectUserSchema,
  user
} from '@/db/schemas/user'
import {
  defaultPageIndex,
  defaultPageSize
} from '@/modules/shared/constants/indext'
import type { PageParams } from '@/types/index'
import { count, eq, getTableColumns, like } from 'drizzle-orm'
import type { Static } from 'elysia'

export type InsertUserParams = Omit<Static<typeof insertUserSchema>, 'id'>
export type GetUserParams = Static<typeof selectUserSchema> & PageParams

export const createUser = async (params: InsertUserParams) => {
  const result = await db.insert(user).values(params).returning().get()
  const { password, ...rest } = result
  return rest
}

export const getSensitiveUserById = async (
  params: Pick<GetUserParams, 'id'>
) => {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.id, params.id))
    .get()
  return result
}

export const getUserById = async (params: Pick<GetUserParams, 'id'>) => {
  const result = await getSensitiveUserById(params)
  if (result) {
    const { password, ...rest } = result
    return rest
  }
  return result
}

export const getSensitiveUserByUsername = async (
  params: Pick<GetUserParams, 'username'>
) => {
  const result = await db
    .select()
    .from(user)
    .where(eq(user.username, params.username))
    .get()
  return result
}

export const getUserByUsername = async (
  params: Pick<GetUserParams, 'username'>
) => {
  const result = await getSensitiveUserByUsername(params)
  if (result) {
    const { password, ...rest } = result
    return rest
  }
  return result
}

export const findUsers = async (params: Partial<GetUserParams>) => {
  const { password, ...rest } = getTableColumns(user)
  const {
    pageIndex = defaultPageIndex,
    pageSize = defaultPageSize,
    username
  } = params
  const recordsDynamic = db.select(rest).from(user).$dynamic()
  const totalDynamic = db.select({ value: count() }).from(user).$dynamic()
  if (username) {
    recordsDynamic.where(like(user.username, `%${username}%`))
    totalDynamic.where(like(user.username, `%${username}%`))
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
