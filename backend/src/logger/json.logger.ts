import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class JsonLogger implements LoggerService {
  private formatMessage(level: string, message: any, optionalParams: any[]) {
    const timestamp = new Date().toISOString();
    const result: any = {
      timestamp,
      level,
    };

    if (typeof message === 'object') {
      result.message = message;
    } else {
      result.message = { message };
    }
    if (optionalParams.length > 0) {
      result.params = optionalParams;
    }

    return JSON.stringify(result);
  }

  /**
   * Write a 'log' level log.
   */
  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatMessage('log', message, optionalParams));
  }

  /**
   * Write an 'error' level log.
   */
  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatMessage('error', message, optionalParams));
  }

  /**
   * Write a 'warn' level log.
   */
  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatMessage('warn', message, optionalParams));
  }

  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...optionalParams: any[]) {
    console.debug(this.formatMessage('debug', message, optionalParams));
  }

  /**
   * Write a 'verbose' level log.
   */
  verbose(message: any, ...optionalParams: any[]) {
    console.info(this.formatMessage('verbose', message, optionalParams));
  }
}
