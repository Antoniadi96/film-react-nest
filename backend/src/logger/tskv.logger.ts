import { LoggerService, Injectable } from '@nestjs/common';

@Injectable()
export class TskvLogger implements LoggerService {
  private formatTSKV(
    level: string,
    message: any,
    ...optionalParams: any[]
  ): string {
    const timestamp = new Date().toISOString();
    let tskvString = `timestamp=${timestamp}\tlevel=${level}`;

    // Обрабатываем основное сообщение
    if (typeof message === 'object') {
      Object.entries(message).forEach(([key, value]) => {
        tskvString += `\t${key}=${this.escapeTSKVValue(String(value))}`;
      });
    } else {
      tskvString += `\tmessage=${this.escapeTSKVValue(String(message))}`;
    }

    // Обрабатываем дополнительные параметры
    if (optionalParams.length > 0) {
      optionalParams.forEach((param, index) => {
        if (typeof param === 'object') {
          Object.entries(param).forEach(([key, value]) => {
            tskvString += `\t${key}=${this.escapeTSKVValue(String(value))}`;
          });
        } else {
          tskvString += `\tparam${index}=${this.escapeTSKVValue(String(param))}`;
        }
      });
    }

    return tskvString;
  }

  private escapeTSKVValue(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  log(message: any, ...optionalParams: any[]) {
    console.log(this.formatTSKV('log', message, optionalParams));
  }

  error(message: any, ...optionalParams: any[]) {
    console.error(this.formatTSKV('error', message, optionalParams));
  }

  warn(message: any, ...optionalParams: any[]) {
    console.warn(this.formatTSKV('warn', message, optionalParams));
  }

  debug(message: any, ...optionalParams: any[]) {
    console.debug(this.formatTSKV('debug', message, optionalParams));
  }

  verbose(message: any, ...optionalParams: any[]) {
    console.info(this.formatTSKV('verbose', message, optionalParams));
  }
}
