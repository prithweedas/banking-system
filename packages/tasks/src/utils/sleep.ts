export const sleep = (seconds: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true)
    }, 1000 * seconds)
  })
}
