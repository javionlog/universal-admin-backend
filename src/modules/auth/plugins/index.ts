import { JWT_NAME, JWT_SECRET } from '@/config/index'
import { getUserByUsername } from '@/modules/user/services/index'
import jwt from '@elysiajs/jwt'
import type { Elysia } from 'elysia'

export const jwtPlugin = (app: Elysia) => {
  return app.use(jwt({ name: JWT_NAME, secret: JWT_SECRET }))
}

export const authPlugin = (app: Elysia) => {
  return app.use(jwtPlugin).guard({
    async beforeHandle({ jwt, set, cookie: { accessToken } }) {
      if (!accessToken?.value) {
        set.status = 'Unauthorized'
        throw new Error('Access token is missing')
      }
      const jwtPayload = await jwt.verify(accessToken.value)
      if (!jwtPayload) {
        set.status = 'Forbidden'
        throw new Error('Access token is invalid')
      }
      if (!jwtPayload.sub) {
        set.status = 'Forbidden'
        throw new Error('Access token is invalid')
      }
      const user = await getUserByUsername({ username: jwtPayload.sub })
      if (!user) {
        set.status = 'Forbidden'
        throw new Error('Access token is invalid')
      }
    }
  })
}

export const authResolve = (app: Elysia) => {
  return app
    .use(jwt({ name: JWT_NAME, secret: JWT_SECRET }))
    .resolve(async ({ jwt, set, cookie: { accessToken } }) => {
      if (!accessToken?.value) {
        set.status = 'Unauthorized'
        throw new Error('Access token is missing')
      }
      const jwtPayload = await jwt.verify(accessToken.value)
      if (!jwtPayload) {
        set.status = 'Forbidden'
        throw new Error('Access token is invalid')
      }
      if (!jwtPayload.sub) {
        set.status = 'Forbidden'
        throw new Error('Access token is invalid')
      }
      const user = await getUserByUsername({ username: jwtPayload.sub })
      if (!user) {
        set.status = 'Forbidden'
        throw new Error('Access token is invalid')
      }
      return { user }
    })
}
