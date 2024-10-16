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

export const isEmpty = (val: unknown) => {
  if (typeof val === 'string') {
    return val.trim() === ''
  }
  return val === null || val === undefined
}
