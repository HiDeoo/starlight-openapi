import { bold, cyan, dim, red, reset } from 'kleur/colors'

const dateTimeFormat = new Intl.DateTimeFormat([], {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export function logInfo(message: string) {
  // eslint-disable-next-line no-console
  console.log(getPrefixedMessage(message, 'info'))
}

export function logError(message: string) {
  console.error(getPrefixedMessage(message, 'error'))
}

function getPrefixedMessage(message: string, type: LogType) {
  const dateTime = dim(`${dateTimeFormat.format(new Date())}`)
  const typeColorizer = type === 'info' ? cyan : red

  return `${reset(`${dateTime} ${bold(typeColorizer('[openapi]'))}`)} ${message}`
}

type LogType = 'error' | 'info'
