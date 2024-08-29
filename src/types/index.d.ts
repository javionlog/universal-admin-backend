import type { PageSchema, TimeRangeSchema } from '@/schematics/index'
import type { Static } from 'elysia'

export type PageParams = Static<typeof PageSchema>

export type TimeRangeParams = Static<typeof TimeRangeSchema>
