import {
  ACCESS_JWT_NAME,
  ACCESS_JWT_SECRET,
  REFRESH_JWT_NAME,
  REFRESH_JWT_SECRET
} from '@/config/index'
import { get as getUser } from '@/modules/user/services/index'
import jwt from '@elysiajs/jwt'
import type { Elysia } from 'elysia'

export const accessJwtJwtPlugin = (app: Elysia) => {
  return app.use(jwt({ name: ACCESS_JWT_NAME, secret: ACCESS_JWT_SECRET }))
}

export const refreshJwtPlugin = (app: Elysia) => {
  return app.use(jwt({ name: REFRESH_JWT_NAME, secret: REFRESH_JWT_SECRET }))
}

export const authDerive = (app: Elysia) => {
  return app
    .use(accessJwtJwtPlugin)
    .use(refreshJwtPlugin)
    .resolve(async ({ accessJwt, set, cookie: { accessToken } }) => {
      if (!accessToken?.value) {
        set.status = 'Unauthorized'
        throw new Error('Access token is missing')
      }
      const accessJwtPayload = await accessJwt.verify(accessToken.value)
      if (!accessJwtPayload) {
        set.status = 'Forbidden'
        throw new Error('Access token is invalid')
      }
      if (!accessJwtPayload.sub) {
        set.status = 'Forbidden'
        throw new Error('Access token is invalid')
      }
      const user = await getUser({ username: accessJwtPayload.sub })
      if (!user) {
        set.status = 'Forbidden'
        throw new Error('Access token is invalid')
      }
      return { user }
    })
}
