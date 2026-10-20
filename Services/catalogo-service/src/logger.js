const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  blue: '\x1b[36m',
};

function write(color, prefix, message, ...args) {
  console.log(`${colors[color]}${prefix} ${message}${colors.reset}`, ...args);
}

module.exports = {
  success: (message, ...args) => write('green', '[+]', message, ...args),
  warning: (message, ...args) => write('yellow', '[!]', message, ...args),
  error: (message, ...args) => write('red', '[x]', message, ...args),
  info: (message, ...args) => write('blue', '[i]', message, ...args),
};
