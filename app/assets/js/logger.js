/**
 * LOGGER SERVICE - QA MASTER PATH
 * Servicio centralizado de logging para debugging y monitoreo
 * @module Logger
 */

export class Logger {
  static log(level, message, data = {}) {
    // En desarrollo, mostrar en consola con colores
    const colors = {
      info: '\x1b[36m', // Cyan
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      success: '\x1b[32m', // Green
    };

    const reset = '\x1b[0m';
    const color = colors[level] || '';

    // eslint-disable-next-line no-console
    console.log(`${color}[${level.toUpperCase()}]${reset}`, message, data);

    // En producción, podrías enviar a servicio de logging
    // this.sendToServer(logEntry);
  }

  static info(message, data) {
    this.log('info', message, data);
  }

  static warn(message, data) {
    this.log('warn', message, data);
  }

  static error(message, data) {
    this.log('error', message, data);
  }

  static success(message, data) {
    this.log('success', message, data);
  }
}
