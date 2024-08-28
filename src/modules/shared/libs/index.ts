export const getExpTimestamp = (seconds: number) => {
  const currentTime = Date.now()
  const secondsInto = seconds * 1000
  const expirationTime = currentTime + secondsInto

  return Math.floor(expirationTime / 1000)
}
