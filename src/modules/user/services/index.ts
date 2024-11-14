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
  DEFAULT_PAGE_INDEXX,
  DEFAULT_PAGE_SIZE,
  WHETHER_TYPE
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

const notFoundMessage = 'Can not find User'

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
  const userItem = await db.query.user.findFirst({
    with: {
      roles: true
    },
    where: () => eq(tableSchema.username, params.username)
  })
  if (!userItem) {
    throw new Error(notFoundMessage)
  }
  const result = await db.transaction(async tx => {
    if (userItem.roles.length > 0) {
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
      .get()) as SelectParams
  })
  return result ? omitObject(result, ['password']) : result
}

export const getSensitive = async (params: Pick<SelectParams, 'username'>) => {
  const result = await db
    .select()
    .from(tableSchema)
    .where(eq(tableSchema.username, params.username))
    .get()
  if (!result) {
    throw new Error(notFoundMessage)
  }
  return result as SelectParams
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
  config?: { isReturnAll?: boolean }
) => {
  const { password, ...rest } = getTableColumns(tableSchema)
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
    .select(rest)
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
  ) as Omit<SelectParams, 'password'>[]

  const total = (await totalDynamic)[0]?.value ?? 0

  return {
    records,
    total
  }
}

export const getRoles = async (
  params: PageParams & Pick<SelectParams, 'username'>,
  config?: { isReturnAll?: boolean }
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
    throw new Error(notFoundMessage)
  }

  if (userItem.roles.length === 0) {
    return {
      records: [],
      total: 0
    }
  }

  const roleCodes = userItem.roles.map(o => o.roleCode)

  const whereFilters: SQLWrapper[] = [
    inArray(roleTableSchema.roleCode, roleCodes)
  ]
  const recordsDynamic = db
    .select()
    .from(roleTableSchema)
    .where(and(...whereFilters))
  const totalDynamic = db
    .select({ value: count() })
    .from(roleTableSchema)
    .where(and(...whereFilters))

  const records = (
    config?.isReturnAll
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

export const getResources = async (
  params: PageParams & Pick<SelectParams, 'username'>,
  config?: { isReturnAll?: boolean }
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
    throw new Error(notFoundMessage)
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

  const whereFilters: SQLWrapper[] = [
    inArray(resourceTableSchema.resourceCode, resourceCodes)
  ]
  const recordsDynamic = db
    .select()
    .from(resourceTableSchema)
    .where(and(...whereFilters))
  const totalDynamic = db
    .select({ value: count() })
    .from(resourceTableSchema)
    .where(and(...whereFilters))

  const records = (
    config?.isReturnAll
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

export const findRoles = async (
  params: PageParams & Partial<Pick<SelectParams, 'username'>>,
  config?: { isReturnAll?: boolean }
) => {
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const userWhereFilters: SQLWrapper[] = []
  for (const k of Object.keys(restParams)) {
    type Key = keyof typeof restParams
    const key = k as Key
    const val = restParams[key as Key]
    if (!isEmpty(val)) {
      switch (key) {
        default: {
          userWhereFilters.push(like(tableSchema[key], `%${val}%`))
          break
        }
      }
    }
  }
  const userList = await db.query.user.findMany({
    with: {
      roles: true
    },
    where: () => and(...userWhereFilters)
  })

  if (userList.length === 0) {
    return {
      records: [],
      total: 0
    }
  }

  const roleCodes = userList.flatMap(o => o.roles).map(o => o.roleCode)

  const whereFilters: SQLWrapper[] = [
    inArray(roleTableSchema.roleCode, roleCodes)
  ]
  const recordsDynamic = db
    .select()
    .from(roleTableSchema)
    .where(and(...whereFilters))
  const totalDynamic = db
    .select({ value: count() })
    .from(roleTableSchema)
    .where(and(...whereFilters))

  const records = (
    config?.isReturnAll
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
  params: PageParams & Partial<Pick<SelectParams, 'username'>>,
  config?: { isReturnAll?: boolean }
) => {
  const {
    pageIndex = DEFAULT_PAGE_INDEXX,
    pageSize = DEFAULT_PAGE_SIZE,
    ...restParams
  } = params
  const userWhereFilters: SQLWrapper[] = []
  for (const k of Object.keys(restParams)) {
    type Key = keyof typeof restParams
    const key = k as Key
    const val = restParams[key as Key]
    if (!isEmpty(val)) {
      switch (key) {
        default: {
          userWhereFilters.push(like(tableSchema[key], `%${val}%`))
          break
        }
      }
    }
  }
  const userList = await db.query.user.findMany({
    with: {
      roles: true
    },
    where: () => and(...userWhereFilters)
  })

  if (userList.length === 0) {
    return {
      records: [],
      total: 0
    }
  }

  const roleCodes = userList.flatMap(o => o.roles).map(o => o.roleCode)

  const roleList = await db.query.role.findMany({
    with: {
      resources: true
    },
    where: fields => inArray(fields.roleCode, roleCodes)
  })

  const resourceCodes = roleList
    .flatMap(o => o.resources)
    .map(o => o.resourceCode)

  const whereFilters: SQLWrapper[] = [
    inArray(resourceTableSchema.resourceCode, resourceCodes)
  ]
  const recordsDynamic = db
    .select()
    .from(resourceTableSchema)
    .where(and(...whereFilters))
  const totalDynamic = db
    .select({ value: count() })
    .from(resourceTableSchema)
    .where(and(...whereFilters))

  const records = (
    config?.isReturnAll
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
      and(
        inArray(fields.roleCode, roleCodes),
        eq(fields.status, WHETHER_TYPE.yes)
      )
  })

  const resourceCodes = roleList
    .flatMap(o => o.resources)
    .map(o => o.resourceCode)

  const resources = (await db.query.resource.findMany({
    where: fields =>
      and(
        inArray(fields.resourceCode, resourceCodes),
        eq(fields.status, WHETHER_TYPE.yes),
        eq(fields.isHide, WHETHER_TYPE.no)
      ),
    orderBy: fileds => fileds.sort
  })) as ResourceSelectParams[]

  const result = listToTree(resources, {
    judgeParentIdFn: item => item.parentId === 0
  })

  return result
}
