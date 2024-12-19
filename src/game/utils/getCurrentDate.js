
export function getCurrentDate() {
  const date = new Date()
  return new Date(
    date.getFullYear() + 100,
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds()
  )
}
