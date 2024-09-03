import { GuardController } from '@/modules/shared/controllers/index'
import { RoleController } from './role'
import { UserToRoleController } from './user-to-role'

export const Controller =
  GuardController.use(RoleController).use(UserToRoleController)
