import {
  defaultPageIndex,
  defaultPageSize
} from '@/modules/shared/constants/indext'
import { t } from 'elysia'

export const PageSchema = t.Object({
  pageIndex: t.Number({ default: defaultPageIndex }),
  pageSize: t.Number({ default: defaultPageSize })
})
