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
  '0': [
    'tencentAESKey',
    'tencentToken',
    'difyAgent',
    'openaiSystemMessage',
    'showQuestion',
    'chatFilter',
    'filterType',
    'filterAppid',
    'filterApiKey',
    'filterSecretKey',
    'openaiDebug',
    'openaiTimeout',
    'openaiModel',
    'gpttoken',
    'proxyPassUrl',
    'proxyUrl',
    'dify_token',
    'dify_baseUrl',
    'proxyPassUrl'
  ],
  '1': ['preventWords', 'roomAt', 'defaultBot'],
  '5': ['tencentAESKey', 'tencentToken'],
  '6': [
    'openaiSystemMessage',
    'showQuestion',
    'chatFilter',
    'openaiDebug',
    'openaiTimeout',
    'openaiModel',
    'gpttoken',
    'proxyPassUrl',
    'proxyUrl'
  ],
  '11': [
    'openaiSystemMessage',
    'showQuestion',
    'chatFilter',
    'openaiDebug',
    'openaiTimeout',
    'openaiModel',
    'gpttoken',
    'proxyPassUrl',
    'proxyUrl'
  ],
  '8': [
    'openaiSystemMessage',
    'showQuestion',
    'chatFilter',
    'openaiDebug',
    'openaiTimeout',
    'dify_token',
    'dify_baseUrl',
    'difyAgent'
  ],
  '9': [
    'openaiSystemMessage',
    'showQuestion',
    'chatFilter',
    'openaiDebug',
    'openaiTimeout',
    'gpttoken',
    'proxyPassUrl'
  ]
}
