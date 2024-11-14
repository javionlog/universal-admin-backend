import { RESOURCE_TYPE, WHETHER_TYPE } from '@/global/constants/indext'
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
    status: WHETHER_TYPE.yes
  }
  const resourceFileds = {
    isLink: WHETHER_TYPE.no,
    isCache: WHETHER_TYPE.yes,
    isAffix: WHETHER_TYPE.no,
    isHide: WHETHER_TYPE.no,
    status: WHETHER_TYPE.yes
  }

  const users = [
    {
      username: adminUsername,
      password: password.hashSync('123456', {
        algorithm: 'bcrypt',
        cost: 10
      }),
      isAdmin: WHETHER_TYPE.yes,
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
      resourceNameEn: 'Permission Management',
      resourceNameZhCn: '权限管理',
      resourceType: RESOURCE_TYPE.menu,
      isLink: WHETHER_TYPE.no,
      isCache: WHETHER_TYPE.no,
      isAffix: WHETHER_TYPE.no,
      isHide: WHETHER_TYPE.no,
      sort: 0,
      ...commonFields
    },
    {
      parentId: 1,
      resourceCode: 'PermissionUser',
      resourceNameEn: 'User Management',
      resourceNameZhCn: '用户管理',
      resourceType: RESOURCE_TYPE.page,
      path: '/permission/user',
      component: '/permission/view/user/index',
      sort: 2,
      ...resourceFileds,
      ...commonFields
    },
    {
      parentId: 1,
      resourceCode: 'PermissionRole',
      resourceNameEn: 'Role Management',
      resourceNameZhCn: '角色管理',
      resourceType: RESOURCE_TYPE.page,
      path: '/permission/role',
      component: '/permission/view/role/index',
      sort: 3,
      ...resourceFileds,
      ...commonFields
    },
    {
      parentId: 1,
      resourceCode: 'PermissionResource',
      resourceNameEn: 'Resource Management',
      resourceNameZhCn: '资源管理',
      resourceType: RESOURCE_TYPE.page,
      path: '/permission/resource',
      component: '/permission/view/resource/index',
      sort: 4,
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
