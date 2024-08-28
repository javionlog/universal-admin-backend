import { selectUserSchema } from '@/db/schemas/user'
import { GuardController } from '@/modules/shared/controllers/index'
import { findUsers, getUserByUsername } from '@/modules/user/services/index'
import { PageSchema } from '@/schematics/index'
import { t } from 'elysia'

export const Controller = GuardController.group('/user', app => {
  return app
    .post(
      '/get',
      async ({ set, body }) => {
        const user = await getUserByUsername(body)
        if (!user) {
          set.status = 'Bad Request'
          throw new Error('Can not find user')
        }
        return user
      },
      {
        type: 'application/json',
        detail: { summary: '用户信息' },
        tags: ['User'],
        body: t.Pick(selectUserSchema, ['username']),
        response: {
          200: t.Omit(selectUserSchema, ['password'])
        }
      }
    )
    .post(
      '/query',
      async ({ body }) => {
        const result = await findUsers(body)
        return result
      },
      {
        type: 'application/json',
        detail: { summary: '用户列表' },
        tags: ['User'],
        body: t.Composite([t.Pick(selectUserSchema, ['username']), PageSchema]),
        response: {
          200: t.Object({
            records: t.Array(t.Omit(selectUserSchema, ['password'])),
            total: t.Number()
          })
        }
      }
    )
})
