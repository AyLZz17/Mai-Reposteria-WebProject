function write(level, message, fields = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: process.env.SERVICE_NAME || 'catalog-service',
    ...fields,
    message,
  };
  console.log(JSON.stringify(entry));
}

module.exports = {
  success: (message, fields) => write('info', message, fields),
  warning: (message, fields) => write('warn', message, fields),
  error: (message, fields) => write('error', message, fields),
  info: (message, fields) => write('info', message, fields),
};
