import { authResolve, jwtPlugin } from '@/modules/auth/plugins/index'
import { Elysia } from 'elysia'

export const BaseController = new Elysia().use(jwtPlugin)

export const GuardController = new Elysia().use(authResolve)
