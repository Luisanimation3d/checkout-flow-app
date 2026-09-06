const isDev = import.meta.env.DEV

type LogData = unknown

const write = (
  level: 'log' | 'warn' | 'error',
  scope: string,
  message: string,
  data?: LogData,
) => {
  if (!isDev) return
  const prefix = `[${scope}]`
  if (data !== undefined) console[level](prefix, message, data)
  else console[level](prefix, message)
}

export const logger = {
  info: (scope: string, message: string, data?: LogData) => write('log', scope, message, data),
  warn: (scope: string, message: string, data?: LogData) => write('warn', scope, message, data),
  error: (scope: string, message: string, data?: LogData) => write('error', scope, message, data),
}
