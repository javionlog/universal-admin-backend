import { db } from '@/db/index'
import {
  type InsertParams,
  type SelectParams,
  roleToResource
} from '@/db/schemas/role-to-resource/index'
import {
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE
} from '@/modules/shared/constants/indext'
import type { PageParams, TimeRangeParams } from '@/types/index'
import { count, eq, getTableColumns, gte, like, lte } from 'drizzle-orm'

export type FindParams = SelectParams & TimeRangeParams & PageParams

export const createRoleToResource = async (params: InsertParams) => {
  const result = await db
    .insert(roleToResource)
    .values({
      ...params,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    .returning({
      roleCode: roleToResource.roleCode,
      resourceCode: roleToResource.resourceCode
    })
    .get()
  return result
}

export const deleteRoleToResourceByRoleCode = async (
  params: Pick<InsertParams, 'roleCode'>
) => {
  const result = await db
    .delete(roleToResource)
    .where(eq(roleToResource.roleCode, params.roleCode))
    .returning({
      roleCode: roleToResource.roleCode,
      resourceCode: roleToResource.resourceCode
    })
    .get()
  return result ?? { roleCode: '', resourceCode: '' }
}

export const findRoleToResources = async (
  params: Partial<FindParams>,
  getAll?: boolean
) => {
  const columns = getTableColumns(roleToResource)
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const recordsDynamic = db.select(columns).from(roleToResource).$dynamic()
  const totalDynamic = db
    .select({ value: count() })
    .from(roleToResource)
    .$dynamic()

  for (const k of Object.keys(restParams)) {
    type Key = keyof typeof restParams
    const key = k as Key
    const val = restParams[key as Key]
    if (val) {
      switch (key) {
        case 'createdFrom': {
          recordsDynamic.where(gte(roleToResource.createdAt, val as number))
          totalDynamic.where(gte(roleToResource.createdAt, val as number))
          break
        }
        case 'createdTo': {
          recordsDynamic.where(lte(roleToResource.createdAt, val as number))
          totalDynamic.where(lte(roleToResource.createdAt, val as number))
          break
        }
        case 'updatedFrom': {
          recordsDynamic.where(gte(roleToResource.updatedAt, val as number))
          totalDynamic.where(gte(roleToResource.updatedAt, val as number))
          break
        }
        case 'updatedTo': {
          recordsDynamic.where(lte(roleToResource.updatedAt, val as number))
          totalDynamic.where(lte(roleToResource.updatedAt, val as number))
          break
        }
        default: {
          recordsDynamic.where(like(roleToResource[key], `%${val}%`))
          totalDynamic.where(like(roleToResource[key], `%${val}%`))
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
