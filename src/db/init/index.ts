import { create as createResource } from '@/modules/permission/services/resource'
import { create as createRole } from '@/modules/permission/services/role'
import { create as createRoleToResource } from '@/modules/permission/services/role-to-resource'
import { create as createUserToRole } from '@/modules/permission/services/user-to-role'
import { BOOL_MAP, RESOURCE_TYPE } from '@/modules/shared/constants/indext'
import { create as createUser } from '@/modules/user/services/index'
import { password } from 'bun'

const init = async () => {
  const adminUsername = 'admin'
  const adminPassword = '123456'
  const adminRoleCode = 'Admin'

  const guestUsername = 'guest'
  const guestPassword = '123456'
  const guestRoleCode = 'Guest'

  const byFields = { createdBy: adminUsername, updatedBy: adminUsername }
  const resourceFileds = {
    isLink: BOOL_MAP.no,
    isCache: BOOL_MAP.yes,
    isAffix: BOOL_MAP.yes,
    isHide: BOOL_MAP.yes,
    status: BOOL_MAP.yes
  }
  const adminHashPassword = await password.hash(adminPassword, {
    algorithm: 'bcrypt',
    cost: 10
  })
  const guestHashPassword = await password.hash(guestPassword, {
    algorithm: 'bcrypt',
    cost: 10
  })
  const resources = [
    {
      parentId: 0,
      resourceCode: 'Permission',
      resourceName: '权限管理',
      resourceType: RESOURCE_TYPE.menu,
      isLink: BOOL_MAP.no,
      isCache: BOOL_MAP.no,
      isAffix: BOOL_MAP.no,
      isHide: BOOL_MAP.no,
      ...byFields
    },
    {
      parentId: 0,
      resourceCode: 'Test',
      resourceName: '测试管理',
      resourceType: RESOURCE_TYPE.menu,
      isLink: BOOL_MAP.no,
      isCache: BOOL_MAP.no,
      isAffix: BOOL_MAP.no,
      isHide: BOOL_MAP.no,
      ...byFields
    },
    {
      parentId: 1,
      resourceCode: 'PermissionUser',
      resourceName: '用户管理',
      resourceType: RESOURCE_TYPE.page,
      path: '/permission/user',
      ...resourceFileds,
      ...byFields
    },
    {
      parentId: 1,
      resourceCode: 'PermissionRole',
      resourceName: '角色管理',
      resourceType: RESOURCE_TYPE.page,
      path: '/permission/role',
      ...resourceFileds,
      ...byFields
    },
    {
      parentId: 1,
      resourceCode: 'PermissionResource',
      resourceName: '资源管理',
      resourceType: RESOURCE_TYPE.page,
      path: '/permission/resource',
      ...resourceFileds,
      ...byFields
    },
    {
      parentId: 2,
      resourceCode: 'TestPage',
      resourceName: '测试页面',
      resourceType: RESOURCE_TYPE.page,
      path: '/test/index',
      ...resourceFileds,
      ...byFields
    }
  ]

  await createUser({
    username: adminUsername,
    password: adminHashPassword,
    isAdmin: BOOL_MAP.yes,
    ...byFields
  })
  await createUser({
    username: guestUsername,
    password: guestHashPassword,
    ...byFields
  })
  await createRole({
    roleCode: adminRoleCode,
    roleName: '管理员',
    ...byFields
  })
  await createRole({
    roleCode: guestRoleCode,
    roleName: '访客',
    ...byFields
  })
  await createUserToRole({
    username: adminUsername,
    roleCode: adminRoleCode,
    ...byFields
  })
  await createUserToRole({
    username: adminUsername,
    roleCode: guestRoleCode,
    ...byFields
  })
  await createUserToRole({
    username: guestUsername,
    roleCode: guestRoleCode,
    ...byFields
  })
  for (const resource of resources) {
    await createResource(resource)
    if (resource.resourceCode.includes('Permission')) {
      await createRoleToResource({
        roleCode: adminRoleCode,
        resourceCode: resource.resourceCode,
        ...byFields
      })
    } else {
      await createRoleToResource({
        roleCode: adminRoleCode,
        resourceCode: resource.resourceCode,
        ...byFields
      })
      await createRoleToResource({
        roleCode: guestRoleCode,
        resourceCode: resource.resourceCode,
        ...byFields
      })
    }
  }
}

init()
