import log from 'loglevel';

const isDev = import.meta.env.MODE === 'development';
log.setLevel(isDev ? 'debug' : 'warn');

export const logger = {
  info:  (...args) => log.info('[INFO]', ...args),
  warn:  (...args) => log.warn('[WARN]', ...args),
  error: (...args) => log.error('[ERROR]', ...args),
  debug: (...args) => log.debug('[DEBUG]', ...args),
  api:   (method, url, data) => log.info(`[API] ${method} ${url}`, data ?? ''),
};

export default logger;
