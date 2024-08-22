import { Controller as BaseController } from '@/modules/shared/controllers/index'
import { t } from 'elysia'

export const Controller = BaseController.group('/auth', app => {
  return app.post(
    '/login',
    ({ body }) => {
      return body
    },
    {
      type: 'application/json',
      body: t.Object({
        name: t.String({ description: '用户名' }),
        password: t.String({ description: '密码' })
      }),
      detail: { summary: '用户登录' }
    }
  )
})
