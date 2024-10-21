import { create as createResource } from '@/modules/permission/services/resource'
import { create as createRole } from '@/modules/permission/services/role'
import { BOOL_MAP, RESOURCE_TYPE } from '@/modules/shared/constants/indext'
import { create as createUser } from '@/modules/user/services/index'
import { password } from 'bun'

const init = async () => {
  const adminUsername = 'admin'
  const adminPassword = '123456'
  const byFields = { createdBy: adminUsername, updatedBy: adminUsername }
  const resourceFileds = {
    isLink: BOOL_MAP.no,
    isCache: BOOL_MAP.yes,
    isAffix: BOOL_MAP.yes,
    isHide: BOOL_MAP.yes,
    status: BOOL_MAP.yes
  }
  const hashPassword = await password.hash(adminPassword, {
    algorithm: 'bcrypt',
    cost: 10
  })
  await createUser({
    username: adminUsername,
    password: hashPassword,
    isAdmin: BOOL_MAP.yes,
    ...byFields
  })
  await createRole({
    roleCode: 'Admin',
    roleName: '管理员',
    ...byFields
  })
  await createResource({
    parentId: 0,
    resourceCode: 'Permission',
    resourceName: '权限管理',
    resourceType: RESOURCE_TYPE.menu,
    isLink: BOOL_MAP.no,
    isCache: BOOL_MAP.no,
    isAffix: BOOL_MAP.no,
    isHide: BOOL_MAP.no,
    ...byFields
  })
  await createResource({
    parentId: 1,
    resourceCode: 'PermissionUser',
    resourceName: '用户管理',
    resourceType: RESOURCE_TYPE.page,
    path: '/permission/user',
    ...resourceFileds,
    ...byFields
  })
  await createResource({
    parentId: 1,
    resourceCode: 'PermissionRole',
    resourceName: '角色管理',
    resourceType: RESOURCE_TYPE.page,
    path: '/permission/role',
    ...resourceFileds,
    ...byFields
  })
  await createResource({
    parentId: 1,
    resourceCode: 'PermissionResource',
    resourceName: '资源管理',
    resourceType: RESOURCE_TYPE.page,
    path: '/permission/resource',
    ...resourceFileds,
    ...byFields
  })
}

init()
