import { GuardController } from '@/modules/shared/controllers/index'
import { RoleController } from './role'
import { UserToRoleController } from './user-to-role'

export const Controller = GuardController.group('/permission', app => {
  return app.use(RoleController).use(UserToRoleController)
})
