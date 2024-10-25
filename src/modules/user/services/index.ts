import { db } from '@/db/index'
import {
  type SelectParams as ResourceSelectParams,
  resource as resourceTableSchema
} from '@/db/schemas/resource/index'
import { roleToResource as roleToResourceTableSchema } from '@/db/schemas/role-to-resource/index'
import {
  type SelectParams as RoleSelectParams,
  role as roleTableSchema
} from '@/db/schemas/role/index'
import { userToRole as userToRoleTableSchema } from '@/db/schemas/user-to-role/index'
import {
  type InsertParams,
  type SelectParams,
  user as tableSchema
} from '@/db/schemas/user/index'
import {
  BOOL_MAP,
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE
} from '@/global/constants/indext'
import { isEmpty, listToTree, omitObject } from '@/global/libs/index'
import type { PageParams, TimeRangeParams } from '@/types/index'
import {
  type SQLWrapper,
  and,
  count,
  eq,
  getTableColumns,
  gte,
  inArray,
  like,
  lte
} from 'drizzle-orm'

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

export const remove = async (params: Pick<SelectParams, 'username'>) => {
  const result = await db.transaction(async tx => {
    const userItem = await tx.query.user.findFirst({
      with: {
        roles: true
      },
      where: () => eq(tableSchema.username, params.username)
    })
    if (userItem?.roles && userItem.roles.length > 0) {
      const roleCodes = userItem.roles.map(o => o.roleCode)
      const roleList = await tx.query.role.findMany({
        with: {
          resources: true
        },
        where: fields => inArray(fields.roleCode, roleCodes)
      })

      const resourceCodes = roleList
        .flatMap(o => o.resources)
        .map(o => o.resourceCode)
      if (resourceCodes.length > 0) {
        await tx
          .delete(roleToResourceTableSchema)
          .where(
            and(
              inArray(roleToResourceTableSchema.roleCode, roleCodes),
              inArray(roleToResourceTableSchema.resourceCode, resourceCodes)
            )
          )
      }
      await tx
        .delete(userToRoleTableSchema)
        .where(
          and(
            eq(userToRoleTableSchema.username, params.username),
            inArray(userToRoleTableSchema.roleCode, roleCodes)
          )
        )
    }
    return (await tx
      .delete(tableSchema)
      .where(eq(tableSchema.username, params.username))
      .returning()
      .get()) as SelectParams | undefined
  })
  return result ? omitObject(result, ['password']) : result
}

export const getSensitive = async (params: Pick<SelectParams, 'username'>) => {
  const result = (await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema.username, params.username))
    .get()) as SelectParams | undefined
  return result
}

export const get = async (params: Pick<SelectParams, 'username'>) => {
  const result = await getSensitive(params)
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
  ) as Omit<SelectParams, 'password'>[]

  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}

export const findRoles = async (
  params: PageParams & Pick<SelectParams, 'username'>,
  returnAll?: boolean
) => {
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const userItem = await db.query.user.findFirst({
    with: {
      roles: true
    },
    where: () => eq(tableSchema.username, restParams.username)
  })

  if (!userItem) {
    return {
      records: [],
      total: 0
    }
  }

  const roleCodes = userItem.roles.map(o => o.roleCode)

  const recordsDynamic = db.select().from(roleTableSchema).$dynamic()
  const totalDynamic = db
    .select({ value: count() })
    .from(roleTableSchema)
    .$dynamic()

  const whereFilters: SQLWrapper[] = [
    inArray(roleTableSchema.roleCode, roleCodes)
  ]

  recordsDynamic.where(and(...whereFilters))
  totalDynamic.where(and(...whereFilters))

  const records = (
    returnAll
      ? await recordsDynamic.all()
      : await recordsDynamic
          .offset((pageIndex - 1) * pageSize)
          .limit(pageSize)
          .all()
  ) as RoleSelectParams[]

  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}

export const findResources = async (
  params: PageParams & Pick<SelectParams, 'username'>,
  returnAll?: boolean
) => {
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const userItem = await db.query.user.findFirst({
    with: {
      roles: true
    },
    where: () => eq(tableSchema.username, restParams.username)
  })

  if (!userItem) {
    return {
      records: [],
      total: 0
    }
  }

  const roleCodes = userItem.roles.map(o => o.roleCode)

  const roleList = await db.query.role.findMany({
    with: {
      resources: true
    },
    where: fields => inArray(fields.roleCode, roleCodes)
  })

  const resourceCodes = roleList
    .flatMap(o => o.resources)
    .map(o => o.resourceCode)

  const recordsDynamic = db.select().from(resourceTableSchema).$dynamic()
  const totalDynamic = db
    .select({ value: count() })
    .from(resourceTableSchema)
    .$dynamic()

  const whereFilters: SQLWrapper[] = [
    inArray(resourceTableSchema.resourceCode, resourceCodes)
  ]

  recordsDynamic.where(and(...whereFilters))
  totalDynamic.where(and(...whereFilters))

  const records = (
    returnAll
      ? await recordsDynamic.all()
      : await recordsDynamic
          .offset((pageIndex - 1) * pageSize)
          .limit(pageSize)
          .all()
  ) as ResourceSelectParams[]

  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}

export const findResourceTree = async (
  params: Pick<SelectParams, 'username'>
) => {
  const userItem = await db.query.user.findFirst({
    with: {
      roles: true
    },
    where: () => eq(tableSchema.username, params.username)
  })

  if (!userItem || userItem.roles.length === 0) {
    return []
  }

  const roleCodes = userItem.roles.map(o => o.roleCode)

  const roleList = await db.query.role.findMany({
    with: {
      resources: true
    },
    where: fields =>
      and(inArray(fields.roleCode, roleCodes), eq(fields.status, BOOL_MAP.yes))
  })

  const resourceCodes = roleList
    .flatMap(o => o.resources)
    .map(o => o.resourceCode)

  const resources = (await db.query.resource.findMany({
    where: fields =>
      and(
        inArray(fields.resourceCode, resourceCodes),
        eq(fields.status, BOOL_MAP.yes),
        eq(fields.isHide, BOOL_MAP.no)
      ),
    orderBy: fileds => fileds.sort
  })) as ResourceSelectParams[]

  const result = listToTree(resources, {
    judgeParentIdFn: item => item.parentId === 0
  })

  return result
}
