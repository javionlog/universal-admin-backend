import { Controller as AuthController } from '@/modules/auth/controllers/index'
import { Controller as PermissionController } from '@/modules/permission/controllers/index'
import { Controller as UserController } from '@/modules/user/controllers/index'
import type { Elysia } from 'elysia'

export const modulePlugin = (app: Elysia) => {
  return app.use(AuthController).use(UserController).use(PermissionController)
}
