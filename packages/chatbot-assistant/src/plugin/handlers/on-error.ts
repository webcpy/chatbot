async function onError(error: any) {
  log.fail('捕捉到🐛，如果还能正常运行，可以忽略', error)
}
export default onError
