import { db } from '@/db/index'
import {
  type InsertParams,
  type SelectParams,
  resource
} from '@/db/schemas/resource/index'
import {
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE
} from '@/modules/shared/constants/indext'
import type { PageParams, TimeRangeParams } from '@/types/index'
import { count, eq, getTableColumns, gte, lte } from 'drizzle-orm'

export type FindParams = SelectParams & PageParams & TimeRangeParams

export const createResource = async (params: InsertParams) => {
  const result = await db
    .insert(resource)
    .values({
      ...params,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
    .returning({ resourceCode: resource.resourceCode })
    .get()
  return result
}

export const updateResource = async (params: InsertParams) => {
  const { resourceCode, createdAt, createdBy, ...rest } = params
  const result = await db
    .update(resource)
    .set(rest)
    .where(eq(resource.resourceCode, params.resourceCode))
    .returning({ resourceCode: resource.resourceCode })
    .get()
  return result
}

export const deleteResource = async (
  params: Pick<InsertParams, 'resourceCode'>
) => {
  const result = await db
    .delete(resource)
    .where(eq(resource.resourceCode, params.resourceCode))
    .returning({ resourceCode: resource.resourceCode })
    .get()
  return result ?? { resourceCode: '' }
}

export const getResourceById = async (params: Pick<SelectParams, 'id'>) => {
  const result = await db
    .select()
    .from(resource)
    .where(eq(resource.id, params.id))
    .get()
  return result
}

export const getResourceByResoureCode = async (
  params: Pick<SelectParams, 'resourceCode'>
) => {
  const result = await db
    .select()
    .from(resource)
    .where(eq(resource.resourceCode, params.resourceCode))
    .get()
  return result
}

export const findResources = async (params: Partial<FindParams>) => {
  const columns = getTableColumns(resource)
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const recordsDynamic = db.select(columns).from(resource).$dynamic()
  const totalDynamic = db.select({ value: count() }).from(resource).$dynamic()

  for (const k of Object.keys(restParams)) {
    type Key = keyof typeof restParams
    const key = k as Key
    const val = restParams[key as Key]
    if (val) {
      switch (key) {
        case 'createdFrom': {
          recordsDynamic.where(gte(resource.createdAt, val as number))
          totalDynamic.where(gte(resource.createdAt, val as number))
          break
        }
        case 'createdTo': {
          recordsDynamic.where(lte(resource.createdAt, val as number))
          totalDynamic.where(lte(resource.createdAt, val as number))
          break
        }
        case 'updatedFrom': {
          recordsDynamic.where(gte(resource.updatedAt, val as number))
          totalDynamic.where(gte(resource.updatedAt, val as number))
          break
        }
        case 'updatedTo': {
          recordsDynamic.where(lte(resource.updatedAt, val as number))
          totalDynamic.where(lte(resource.updatedAt, val as number))
          break
        }
        default: {
          recordsDynamic.where(eq(resource[key], val))
          totalDynamic.where(eq(resource[key], val))
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
