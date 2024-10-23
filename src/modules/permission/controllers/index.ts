import { GuardController } from '@/global/controllers/index'
import { ResourceController } from './resource'
import { RoleController } from './role'
import { RoleToResourceController } from './role-to-resource'
import { UserToRoleController } from './user-to-role'

export const Controller = GuardController.use(RoleController)
  .use(ResourceController)
  .use(UserToRoleController)
  .use(RoleToResourceController)
