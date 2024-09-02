import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '@/config/index'
import {
  insertSchema as insertUserSchema,
  selectSchema as selectUserSchema
} from '@/db/schemas/user/index'
import { authDerive } from '@/modules/auth/plugins/index'
import { BaseController } from '@/modules/shared/controllers/index'
import { getExpTimestamp } from '@/modules/shared/libs/index'
import {
  createUser,
  getSensitiveUserByUsername,
  getUserByUsername
} from '@/modules/user/services/index'
import { t } from 'elysia'

export const Controller = BaseController.group('/auth', app => {
  return app
    .post(
      '/signIn',
      async ({ body, set, jwt, cookie: { accessToken, refreshToken } }) => {
        const user = await getSensitiveUserByUsername({
          username: body.username
        })
        const invalidUserMessage =
          'The username or password you entered is incorrect'
        if (!user) {
          set.status = 'Bad Request'
          throw new Error(invalidUserMessage)
        }
        const matchPassword = await Bun.password.verify(
          body.password,
          user.password,
          'bcrypt'
        )
        if (!matchPassword) {
          set.status = 'Bad Request'
          throw new Error(invalidUserMessage)
        }

        // create access token
        const accessJwtToken = await jwt.sign({
          sub: user.username,
          exp: getExpTimestamp(ACCESS_TOKEN_EXP)
        })
        accessToken?.set({
          value: accessJwtToken,
          httpOnly: true,
          maxAge: ACCESS_TOKEN_EXP,
          path: '/'
        })

        // create refresh token
        const refreshJwtToken = await jwt.sign({
          sub: user.username,
          exp: getExpTimestamp(REFRESH_TOKEN_EXP)
        })
        refreshToken?.set({
          value: refreshJwtToken,
          httpOnly: true,
          maxAge: REFRESH_TOKEN_EXP,
          path: '/'
        })
        return {
          username: user.username,
          accessToken: accessJwtToken,
          refreshToken: refreshJwtToken
        }
      },
      {
        type: 'application/json',
        detail: { summary: '用户登录' },
        tags: ['Auth'],
        body: t.Pick(selectUserSchema, ['username', 'password']),
        response: {
          200: t.Composite([
            t.Pick(selectUserSchema, ['username']),
            t.Object({
              accessToken: t.String(),
              refreshToken: t.String()
            })
          ])
        }
      }
    )
    .post(
      '/signUp',
      async ({ body }) => {
        const hashPassword = await Bun.password.hash(body.password, {
          algorithm: 'bcrypt',
          cost: 10
        })
        const user = await createUser({ ...body, password: hashPassword })
        return {
          username: user.username
        }
      },
      {
        type: 'application/json',
        detail: { summary: '用户注册' },
        tags: ['Auth'],
        body: insertUserSchema,
        response: {
          200: t.Pick(selectUserSchema, ['username'])
        }
      }
    )
    .post(
      '/refresh',
      async ({ jwt, set, cookie: { accessToken, refreshToken } }) => {
        if (!refreshToken?.value) {
          set.status = 'Unauthorized'
          throw new Error('Refresh token is missing')
        }

        const jwtPayload = await jwt.verify(refreshToken.value)
        const invalidRefreshTokenMessage = 'Refresh token is invalid'
        if (!jwtPayload) {
          set.status = 'Forbidden'
          throw new Error(invalidRefreshTokenMessage)
        }

        if (!jwtPayload.sub) {
          set.status = 'Forbidden'
          throw new Error(invalidRefreshTokenMessage)
        }

        const user = await getUserByUsername({ username: jwtPayload.sub })
        if (!user) {
          set.status = 'Forbidden'
          throw new Error(invalidRefreshTokenMessage)
        }

        // create access token
        const accessJwtToken = await jwt.sign({
          sub: user.username,
          exp: getExpTimestamp(ACCESS_TOKEN_EXP)
        })
        accessToken?.set({
          value: accessJwtToken,
          httpOnly: true,
          maxAge: ACCESS_TOKEN_EXP,
          path: '/'
        })

        // create refresh token
        const refreshJwtToken = await jwt.sign({
          sub: user.username,
          exp: getExpTimestamp(REFRESH_TOKEN_EXP)
        })
        refreshToken?.set({
          value: refreshJwtToken,
          httpOnly: true,
          maxAge: REFRESH_TOKEN_EXP,
          path: '/'
        })

        return {
          accessToken: accessJwtToken,
          refreshToken: refreshJwtToken
        }
      },
      {
        type: 'application/json',
        detail: { summary: '令牌刷新' },
        tags: ['Auth'],
        response: {
          200: t.Object({
            accessToken: t.String(),
            refreshToken: t.String()
          })
        }
      }
    )
    .use(authDerive)
    .post(
      '/signOut',
      ({ cookie: { accessToken, refreshToken } }) => {
        accessToken?.remove()
        refreshToken?.remove()
        return null
      },
      {
        type: 'application/json',
        detail: { summary: '用户登出' },
        tags: ['Auth'],
        response: {
          200: t.Null()
        }
      }
    )
})
