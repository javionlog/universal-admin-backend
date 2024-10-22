import { insertSchema, selectSchema, uniqueKey } from '@/db/schemas/user/index'
import { primaryKey } from '@/db/shared/index'
import { GuardController } from '@/modules/shared/controllers/index'
import {
  create,
  find,
  get,
  remove,
  update
} from '@/modules/user/services/index'
import { PageSchema, TimeRangeSchema } from '@/schematics/index'
import { password } from 'bun'
import { t } from 'elysia'

const notFoundMessage = 'Can not find User'
const summaryPrefix = '用户'
const tags = ['User']

export const Controller = GuardController.group('/user', app => {
  return app
    .post(
      '/create',
      async ({ body }) => {
        const hashPassword = await password.hash(body.password, {
          algorithm: 'bcrypt',
          cost: 10
        })
        const result = await create({
          ...body,
          password: hashPassword,
          createdBy: body[uniqueKey],
          updatedBy: body[uniqueKey]
        })
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}创建` },
        body: insertSchema,
        response: {
          200: t.Omit(selectSchema, ['password'])
        }
      }
    )
    .post(
      '/update',
      async ({ body, user }) => {
        const result = await update({ ...body, updatedBy: user[uniqueKey] })
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}更新` },
        body: selectSchema,
        response: {
          200: t.Omit(selectSchema, ['password'])
        }
      }
    )
    .post(
      '/remove',
      async ({ set, body }) => {
        const result = await remove({
          [primaryKey]: body[primaryKey]
        })
        if (!result) {
          set.status = 'Bad Request'
          throw new Error(notFoundMessage)
        }
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}删除` },
        body: t.Pick(selectSchema, [primaryKey]),
        response: {
          200: t.Omit(selectSchema, ['password'])
        }
      }
    )
    .post(
      '/get',
      async ({ set, body }) => {
        const result = await get({
          [primaryKey]: body[primaryKey]
        })
        if (!result) {
          set.status = 'Bad Request'
          throw new Error(notFoundMessage)
        }
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}信息` },
        body: t.Pick(selectSchema, [primaryKey]),
        response: {
          200: t.Omit(selectSchema, ['password'])
        }
      }
    )
    .post(
      '/find',
      async ({ body }) => {
        const result = await find(body)
        return result
      },
      {
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
