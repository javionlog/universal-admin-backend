import { db } from '@/db/index'
import {
  type InsertParams,
  type SelectParams,
  role
} from '@/db/schemas/role/index'
import {
  defaultPageIndex,
  defaultPageSize
} from '@/modules/shared/constants/indext'
import type { PageParams, TimeRangeParams } from '@/types/index'
import { count, eq, getTableColumns, gte, lte } from 'drizzle-orm'

export type FindParams = SelectParams & PageParams & TimeRangeParams

export const createRole = async (params: InsertParams) => {
  const result = await db
    .insert(role)
    .values({
      ...params,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    .returning({ roleCode: role.roleCode })
    .get()
  return result
}

export const updateRole = async (params: InsertParams) => {
  const { roleCode, createdAt, createdBy, ...rest } = params
  const result = await db
    .update(role)
    .set(rest)
    .where(eq(role.roleCode, params.roleCode))
    .returning({ roleCode: role.roleCode })
    .get()
  return result
}

export const deleteRole = async (params: Pick<InsertParams, 'roleCode'>) => {
  const result = await db
    .delete(role)
    .where(eq(role.roleCode, params.roleCode))
    .returning({ roleCode: role.roleCode })
    .get()
  return result ?? { roleCode: '' }
}

export const getRoleById = async (params: Pick<SelectParams, 'id'>) => {
  const result = await db
    .select()
    .from(role)
    .where(eq(role.id, params.id))
    .get()
  return result
}

export const getRoleByRoleCode = async (
  params: Pick<SelectParams, 'roleCode'>
) => {
  const result = await db
    .select()
    .from(role)
    .where(eq(role.roleCode, params.roleCode))
    .get()
  return result
}

export const findRoles = async (params: Partial<FindParams>) => {
  const columns = getTableColumns(role)
  const {
    pageIndex = defaultPageIndex,
    pageSize = defaultPageSize,
    ...restParams
  } = params
  const recordsDynamic = db.select(columns).from(role).$dynamic()
  const totalDynamic = db.select({ value: count() }).from(role).$dynamic()

  for (const k of Object.keys(restParams)) {
    type Key = keyof typeof restParams
    const key = k as Key
    const val = restParams[key as Key]
    if (val) {
      switch (key) {
        case 'createdFrom': {
          recordsDynamic.where(gte(role.createdAt, val as number))
          totalDynamic.where(gte(role.createdAt, val as number))
          break
        }
        case 'createdTo': {
          recordsDynamic.where(lte(role.createdAt, val as number))
          totalDynamic.where(lte(role.createdAt, val as number))
          break
        }
        case 'updatedFrom': {
          recordsDynamic.where(gte(role.updatedAt, val as number))
          totalDynamic.where(gte(role.updatedAt, val as number))
          break
        }
        case 'updatedTo': {
          recordsDynamic.where(lte(role.updatedAt, val as number))
          totalDynamic.where(lte(role.updatedAt, val as number))
          break
        }
        default: {
          recordsDynamic.where(eq(role[key], val))
          totalDynamic.where(eq(role[key], val))
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
