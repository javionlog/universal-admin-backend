import {
  accessJwtJwtPlugin,
  authDerive,
  refreshJwtPlugin
} from '@/modules/auth/plugins/index'
import { Elysia } from 'elysia'

export const BaseController = new Elysia()
  .use(accessJwtJwtPlugin)
  .use(refreshJwtPlugin)

export const GuardController = new Elysia().use(authDerive)
