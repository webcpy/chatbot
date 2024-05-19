export const gptModal = [
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-1106',
  'gpt-3.5-turbo-0613',
  'gpt-3.5-turbo-16k',
  'gpt-3.5-turbo-0301',
  'gpt-4',
  'gpt-4-0125-preview',
  'gpt-4-turbo-preview',
  'gpt-4-1106-preview',
  'gpt-4-0613',
  'gpt-4-0314',
  'gpt-4-32k',
  'gpt-4-32k-0314',
  'gpt-4-32k-0613',
  'text-davinci-003',
  'text-davinci-002',
  'code-davinci-002'
].map((it) => {
  return {
    label: it,
    value: it
  }
})

export const botType = {
  '0': ['open4v', 'showQuestion', 'model', 'showDownloadUrl', 'tts', 'proxyPass', 'openWhisper', 'voice', 'isAiAgent', 'debug'],
  '6': ['showQuestion', 'debug', 'voice', 'model', 'openWhisper', 'tts', 'open4v', 'proxyPass'],
  '9': ['showQuestion', 'debug'],
  '8': ['open4v', 'showQuestion', 'showDownloadUrl', 'isAiAgent', 'debug'],
  '11': ['showQuestion', 'debug', 'voice', 'open4v', 'openWhisper', 'tts', 'proxyPass', 'showDownloadUrl']
}
