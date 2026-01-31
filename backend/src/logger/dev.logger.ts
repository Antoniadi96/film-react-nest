import { Injectable, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class DevLogger extends ConsoleLogger {
  constructor() {
    super();
    this.setLogLevels(['log', 'error', 'warn', 'debug', 'verbose']);
  }
}
