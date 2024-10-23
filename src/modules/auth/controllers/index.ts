import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from '@/config/index'
import { resourceNodeSchema } from '@/db/schemas/resource/index'
import { selectSchema as selectUserSchema } from '@/db/schemas/user/index'
import { BaseController } from '@/global/controllers/index'
import { getExpTimestamp } from '@/global/libs/index'
import { authDerive } from '@/modules/auth/plugins/index'
import {
  findResourceTree,
  gainSensitive as getSensitiveUser,
  gain as getUser,
  update as updateUser
} from '@/modules/user/services/index'
import { password } from 'bun'
import { t } from 'elysia'

export const Controller = BaseController.group('/auth', app => {
  return app
    .post(
      '/signIn',
      async ({
        body,
        set,
        accessJwt,
        refreshJwt,
        cookie: { accessToken, refreshToken }
      }) => {
        const user = await getSensitiveUser({
          username: body.username
        })
        const invalidUserMessage =
          'The username or password you entered is incorrect'
        if (!user) {
          set.status = 'Bad Request'
          throw new Error(invalidUserMessage)
        }
        const matchPassword = await password.verify(
          body.password,
          user.password,
          'bcrypt'
        )
        if (!matchPassword) {
          set.status = 'Bad Request'
          throw new Error(invalidUserMessage)
        }

        try {
          updateUser({ ...user, lastSignInAt: Date.now() })
        } catch {
          // print log
        }

        // create access token
        const accessJwtToken = await accessJwt.sign({
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
        const refreshJwtToken = await refreshJwt.sign({
          sub: user.username,
          exp: getExpTimestamp(REFRESH_TOKEN_EXP)
        })
        refreshToken?.set({
          value: refreshJwtToken,
          httpOnly: true,
          maxAge: REFRESH_TOKEN_EXP,
          path: '/'
        })

        const resourceTree = await findResourceTree({ username: user.username })

        return {
          username: user.username,
          accessToken: accessJwtToken,
          refreshToken: refreshJwtToken,
          resourceTree
        }
      },
      {
        detail: { summary: '用户登录' },
        tags: ['Auth'],
        body: t.Pick(selectUserSchema, ['username', 'password']),
        response: {
          200: t.Composite([
            t.Pick(selectUserSchema, ['username']),
            t.Object({
              accessToken: t.String(),
              refreshToken: t.String(),
              resourceTree: t.Array(resourceNodeSchema)
            })
          ])
        }
      }
    )
    .post(
      '/refresh',
      async ({
        accessJwt,
        refreshJwt,
        set,
        cookie: { accessToken, refreshToken }
      }) => {
        if (!refreshToken?.value) {
          set.status = 'Unauthorized'
          throw new Error('Refresh token is missing')
        }

        const refreshJwtPayload = await refreshJwt.verify(refreshToken.value)
        const invalidRefreshTokenMessage = 'Refresh token is invalid'
        if (!refreshJwtPayload) {
          set.status = 'Forbidden'
          throw new Error(invalidRefreshTokenMessage)
        }

        if (!refreshJwtPayload.sub) {
          set.status = 'Forbidden'
          throw new Error(invalidRefreshTokenMessage)
        }

        const user = await getUser({
          username: refreshJwtPayload.sub
        })
        if (!user) {
          set.status = 'Forbidden'
          throw new Error(invalidRefreshTokenMessage)
        }

        // create access token
        const accessJwtToken = await accessJwt.sign({
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
        const refreshJwtToken = await refreshJwt.sign({
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
        detail: { summary: '用户登出' },
        tags: ['Auth'],
        response: {
          200: t.Null()
        }
      }
    )
})
