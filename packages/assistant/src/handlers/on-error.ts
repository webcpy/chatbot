async function onError(error: any) {
  log.fail('捕捉到了一只❌，如果系统仍能正常运行，可以先不予理会。', error)
}
export default onError
