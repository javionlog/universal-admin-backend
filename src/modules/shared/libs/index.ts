export const getExpTimestamp = (seconds: number) => {
  const currentTime = Date.now()
  const secondsInto = seconds * 1000
  const expirationTime = currentTime + secondsInto

  return Math.floor(expirationTime / 1000)
}

export const pickObject = <
  T extends Record<PropertyKey, unknown>,
  K extends keyof T
>(
  obj: T,
  keys: K[]
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(o => keys.includes(o[0] as K))
  ) as Pick<T, K>
}

export const omitObject = <
  T extends Record<PropertyKey, unknown>,
  K extends keyof T
>(
  obj: T,
  keys: K[]
) => {
  return Object.fromEntries(
    Object.entries(obj).filter(o => !keys.includes(o[0] as K))
  ) as Omit<T, K>
}

export const isEmpty = (val: unknown): val is null | undefined | '' => {
  if (typeof val === 'string') {
    return val.trim() === ''
  }
  return val === null || val === undefined
}

type TreeNode<T, K extends number | string> = T & {
  [_K in K]: TreeNode<T, K>[]
}

export const listToTree = <
  T extends Record<number | string, any>,
  K extends keyof T & (number | string),
  C extends number | string = 'children'
>(
  list: T[],
  props?: {
    parentId?: K
    id?: K
    childrenKey?: C
    judgeParentIdFn?: (item: T) => boolean
  }
): TreeNode<T, C>[] => {
  const {
    parentId = 'parentId',
    id = 'id',
    childrenKey = 'children',
    judgeParentIdFn = (item: T) => isEmpty(item[parentId])
  } = props ?? {}
  const result: TreeNode<T, C>[] = []
  const idMap: {
    [key: number | string]: TreeNode<T, C>
  } = {}

  for (const item of list) {
    idMap[item[id]] = { ...item, [childrenKey]: [] }
  }

  for (const item of list) {
    const pId = item[parentId]
    const cId = item[id]
    if (judgeParentIdFn(item)) {
      result.push(idMap[cId] as TreeNode<T, C>)
    } else {
      const mapItem = idMap[pId]
      mapItem[childrenKey].push(idMap[cId])
    }
  }

  return result
}

export const deduplicateArray = <
  T extends Record<number | string, any>,
  K extends keyof T
>(
  arr: T[],
  prop: K
) => {
  const uniqueItems: T[] = []
  return arr.filter(item => {
    return !uniqueItems.includes(item[prop]) && uniqueItems.push(item[prop])
  })
}
