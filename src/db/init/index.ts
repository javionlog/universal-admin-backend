import { BOOL_MAP, RESOURCE_TYPE } from '@/global/constants/indext'
import { create as createResource } from '@/modules/permission/services/resource'
import { create as createRole } from '@/modules/permission/services/role'
import { create as createRoleToResource } from '@/modules/permission/services/role-to-resource'
import { create as createUserToRole } from '@/modules/permission/services/user-to-role'
import { create as createUser } from '@/modules/user/services/index'
import { password } from 'bun'

const init = async () => {
  const adminUsername = 'admin'
  const adminRoleCode = 'Admin'

  const guestUsername = 'guest'
  const guestRoleCode = 'Guest'

  const commonFields = {
    createdBy: adminUsername,
    updatedBy: adminUsername,
    status: BOOL_MAP.yes
  }
  const resourceFileds = {
    isLink: BOOL_MAP.no,
    isCache: BOOL_MAP.yes,
    isAffix: BOOL_MAP.yes,
    isHide: BOOL_MAP.no,
    status: BOOL_MAP.yes
  }

  const users = [
    {
      username: adminUsername,
      password: password.hashSync('123456', {
        algorithm: 'bcrypt',
        cost: 10
      }),
      isAdmin: BOOL_MAP.yes,
      ...commonFields
    },
    {
      username: guestUsername,
      password: password.hashSync('123456', {
        algorithm: 'bcrypt',
        cost: 10
      }),
      ...commonFields
    }
  ]

  const roles = [
    {
      roleCode: adminRoleCode,
      roleName: '管理员',
      ...commonFields
    },
    {
      roleCode: guestRoleCode,
      roleName: '访客',
      ...commonFields
    }
  ]

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
      sort: 0,
      ...commonFields
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
      sort: 1,
      ...commonFields
    },
    {
      parentId: 1,
      resourceCode: 'PermissionUser',
      resourceName: '用户管理',
      resourceType: RESOURCE_TYPE.page,
      path: '/permission/user',
      sort: 2,
      ...resourceFileds,
      ...commonFields
    },
    {
      parentId: 1,
      resourceCode: 'PermissionRole',
      resourceName: '角色管理',
      resourceType: RESOURCE_TYPE.page,
      path: '/permission/role',
      sort: 3,
      ...resourceFileds,
      ...commonFields
    },
    {
      parentId: 1,
      resourceCode: 'PermissionResource',
      resourceName: '资源管理',
      resourceType: RESOURCE_TYPE.page,
      path: '/permission/resource',
      sort: 4,
      ...resourceFileds,
      ...commonFields
    },
    {
      parentId: 2,
      resourceCode: 'TestPage',
      resourceName: '测试页面',
      resourceType: RESOURCE_TYPE.page,
      path: '/test/index',
      sort: 5,
      ...resourceFileds,
      ...commonFields
    }
  ]

  for (const user of users) {
    await createUser(user)
  }

  for (const role of roles) {
    await createRole(role)
    if (role.roleCode === adminRoleCode) {
      await createUserToRole({
        username: adminUsername,
        roleCode: role.roleCode,
        ...commonFields
      })
    } else {
      await createUserToRole({
        username: adminUsername,
        roleCode: role.roleCode,
        ...commonFields
      })
      await createUserToRole({
        username: guestUsername,
        roleCode: role.roleCode,
        ...commonFields
      })
    }
  }

  for (const resource of resources) {
    await createResource(resource)
    if (resource.resourceCode.includes('Permission')) {
      await createRoleToResource({
        roleCode: adminRoleCode,
        resourceCode: resource.resourceCode,
        ...commonFields
      })
    } else {
      await createRoleToResource({
        roleCode: adminRoleCode,
        resourceCode: resource.resourceCode,
        ...commonFields
      })
      await createRoleToResource({
        roleCode: guestRoleCode,
        resourceCode: resource.resourceCode,
        ...commonFields
      })
    }
  }
}

init()
