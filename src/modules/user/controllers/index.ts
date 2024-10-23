import {
  resourceNodeSchema,
  selectSchema as resourceSelectSchema
} from '@/db/schemas/resource/index'
import { selectSchema as roleSelectSchema } from '@/db/schemas/role/index'
import { insertSchema, selectSchema } from '@/db/schemas/user/index'
import { GuardController } from '@/global/controllers/index'
import {
  create,
  find,
  findResourceTree,
  findResources,
  findRoles,
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
          createdBy: body.username,
          updatedBy: body.username
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
        const result = await update({ ...body, updatedBy: user.username })
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
          id: body.id
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
        body: t.Pick(selectSchema, ['id']),
        response: {
          200: t.Omit(selectSchema, ['password'])
        }
      }
    )
    .post(
      '/get',
      async ({ set, body }) => {
        const result = await get({
          id: body.id
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
        body: t.Pick(selectSchema, ['id']),
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
        detail: { summary: `${summaryPrefix}列表` },
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
    .post(
      '/findAll',
      async ({ body }) => {
        const result = await find(body, true)
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}全部` },
        body: t.Composite([
          t.Partial(t.Omit(selectSchema, ['createdAt', 'updatedAt'])),
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
    .post(
      '/findRoles',
      async ({ body }) => {
        const result = await findRoles(body)
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}拥有的角色列表` },
        body: t.Composite([t.Pick(selectSchema, ['username']), PageSchema]),
        response: {
          200: t.Object({
            records: t.Array(roleSelectSchema),
            total: t.Number()
          })
        }
      }
    )
    .post(
      '/findAllRoles',
      async ({ body }) => {
        const result = await findRoles(body, true)
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}拥有的角色全部` },
        body: t.Composite([t.Pick(selectSchema, ['username'])]),
        response: {
          200: t.Object({
            records: t.Array(roleSelectSchema),
            total: t.Number()
          })
        }
      }
    )
    .post(
      '/findResources',
      async ({ body }) => {
        const result = await findResources(body)
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}拥有的资源列表` },
        body: t.Composite([t.Pick(selectSchema, ['username']), PageSchema]),
        response: {
          200: t.Object({
            records: t.Array(resourceSelectSchema),
            total: t.Number()
          })
        }
      }
    )
    .post(
      '/findAllResources',
      async ({ body }) => {
        const result = await findResources(body, true)
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}拥有的资源全部` },
        body: t.Composite([t.Pick(selectSchema, ['username'])]),
        response: {
          200: t.Object({
            records: t.Array(resourceSelectSchema),
            total: t.Number()
          })
        }
      }
    )
    .post(
      '/findResourceTree',
      async ({ body }) => {
        const result = await findResourceTree(body)
        return result
      },
      {
        tags,
        detail: { summary: `${summaryPrefix}资源树` },
        body: t.Pick(selectSchema, ['username']),
        response: {
          200: t.Array(resourceNodeSchema)
        }
      }
    )
})
