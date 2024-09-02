import { db } from '@/db/index'
import {
  type InsertParams,
  type SelectParams,
  userToRole
} from '@/db/schemas/user-to-role/index'
import {
  defaultPageIndex,
  defaultPageSize
} from '@/modules/shared/constants/indext'
import type { PageParams, TimeRangeParams } from '@/types/index'
import { count, eq, getTableColumns, gte, like, lte } from 'drizzle-orm'

export type FindParams = SelectParams & TimeRangeParams & PageParams

export const createUserToRole = async (params: InsertParams) => {
  const result = await db
    .insert(userToRole)
    .values({
      ...params,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    .returning({ username: userToRole.username, roleCode: userToRole.roleCode })
    .get()
  return result
}

export const deleteUserToRoleByUsername = async (
  params: Pick<InsertParams, 'username'>
) => {
  const result = await db
    .delete(userToRole)
    .where(eq(userToRole.username, params.username))
    .returning({ username: userToRole.username, roleCode: userToRole.roleCode })
    .get()
  return result ?? { username: '', roleCode: '' }
}

export const findUserToRoles = async (
  params: Partial<FindParams>,
  getAll?: boolean
) => {
  const columns = getTableColumns(userToRole)
  const {
    pageIndex = defaultPageIndex,
    pageSize = defaultPageSize,
    ...restParams
  } = params
  const recordsDynamic = db.select(columns).from(userToRole).$dynamic()
  const totalDynamic = db.select({ value: count() }).from(userToRole).$dynamic()

  for (const k of Object.keys(restParams)) {
    type Key = keyof typeof restParams
    const key = k as Key
    const val = restParams[key as Key]
    if (val) {
      switch (key) {
        case 'createdFrom': {
          recordsDynamic.where(gte(userToRole.createdAt, val as number))
          totalDynamic.where(gte(userToRole.createdAt, val as number))
          break
        }
        case 'createdTo': {
          recordsDynamic.where(lte(userToRole.createdAt, val as number))
          totalDynamic.where(lte(userToRole.createdAt, val as number))
          break
        }
        case 'updatedFrom': {
          recordsDynamic.where(gte(userToRole.updatedAt, val as number))
          totalDynamic.where(gte(userToRole.updatedAt, val as number))
          break
        }
        case 'updatedTo': {
          recordsDynamic.where(lte(userToRole.updatedAt, val as number))
          totalDynamic.where(lte(userToRole.updatedAt, val as number))
          break
        }
        default: {
          recordsDynamic.where(like(userToRole[key], `%${val}%`))
          totalDynamic.where(like(userToRole[key], `%${val}%`))
          break
        }
      }
    }
  }

  const records = getAll
    ? await recordsDynamic.all()
    : await recordsDynamic
        .offset((pageIndex - 1) * pageSize)
        .limit(pageSize)
        .all()
  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}
