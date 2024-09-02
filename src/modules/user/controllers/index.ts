import { insertSchema, selectSchema } from '@/db/schemas/user/index'
import { GuardController } from '@/modules/shared/controllers/index'
import {
  findUsers,
  getUserByUsername,
  updateUser
} from '@/modules/user/services/index'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { t } from 'elysia'

export const Controller = GuardController.group('/user', app => {
  return app
    .post(
      '/get',
      async ({ set, body }) => {
        const result = await getUserByUsername(body)
        if (!result) {
          set.status = 'Bad Request'
          throw new Error('Can not find user')
        }
        return result
      },
      {
        type: 'application/json',
        detail: { summary: '用户信息' },
        tags: ['User'],
        body: t.Pick(selectSchema, ['username']),
        response: {
          200: t.Omit(selectSchema, ['password'])
        }
      }
    )
    .post(
      '/update',
      async ({ set, body, user }) => {
        const row = await getUserByUsername(body)
        if (!row) {
          set.status = 'Bad Request'
          throw new Error('Can not find user')
        }
        const result = await updateUser({ ...body, updatedBy: user.username })
        return result
      },
      {
        type: 'application/json',
        detail: { summary: '用户更新' },
        tags: ['User'],
        body: t.Omit(insertSchema, ['password']),
        response: {
          200: t.Pick(selectSchema, ['username'])
        }
      }
    )
    .post(
      '/find',
      async ({ body }) => {
        const result = await findUsers(body)
        return result
      },
      {
        type: 'application/json',
        detail: { summary: '用户列表' },
        tags: ['User'],
        body: t.Composite([
          t.Partial(
            t.Omit(selectSchema, [
              'id',
              'password',
              'lastSignInAt',
              'createdAt',
              'updatedAt'
            ])
          ),
          PageSchema,
          TimeRangeSchema
        ]),
        response: {
          200: t.Object({
            records: t.Array(t.Omit(selectSchema, ['password'])),
            total: t.Number()
          })
        }
      }
    )
})
