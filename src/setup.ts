import { staticPlugin } from '@elysiajs/static'
import { swagger } from '@elysiajs/swagger'
import type { Elysia } from 'elysia'

export const globalPlugin = (app: Elysia) => {
  return app
    .use(
      staticPlugin({
        assets: 'public',
        prefix: '/public'
      })
    )
    .use(
      swagger({
        path: '/swagger',
        // biome-ignore lint/style/useNamingConvention:
        scalarCDN: '/public/js/standalone.js',
        documentation: {
          tags: [
            {
              name: 'Auth',
              description: 'Auth Module'
            },
            {
              name: 'User',
              description: 'User Module'
            }
          ]
        }
      })
    )
}
