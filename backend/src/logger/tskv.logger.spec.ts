import { TskvLogger } from './tskv.logger';

describe('TskvLogger', () => {
  let logger: TskvLogger;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new TskvLogger();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('TSKV formatting', () => {
    it('should format message in TSKV format', () => {
      const message = 'Test message';
      logger.log(message);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];

      // Проверяем TSKV формат
      expect(loggedMessage).toMatch(/^timestamp=/);
      expect(loggedMessage).toMatch(/\tlevel=log/);
      expect(loggedMessage).toMatch(/\tmessage=Test message/);
    });

    it('should escape special characters in TSKV', () => {
      const message = 'Line1\nLine2\tTab';
      logger.log(message);

      const loggedMessage = consoleLogSpy.mock.calls[0][0];

      expect(loggedMessage).toMatch(/message=Line1\\nLine2\\tTab/);
    });

    it('should handle object messages', () => {
      const message = { action: 'create', userId: 123, status: 'success' };
      logger.log(message);

      const loggedMessage = consoleLogSpy.mock.calls[0][0];

      expect(loggedMessage).toMatch(/action=create/);
      expect(loggedMessage).toMatch(/userId=123/);
      expect(loggedMessage).toMatch(/status=success/);
    });

    it('should include optional params', () => {
      const message = 'Request';
      const param1 = { ip: '127.0.0.1' };
      const param2 = 'additional info';

      logger.log(message, param1, param2);

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      expect(loggedMessage).toMatch(/0=\[object Object\]/);
      expect(loggedMessage).toMatch(/1=additional info/);
    });

    it('should format different log levels correctly', () => {
      logger.error('Error message');
      const errorMessage = jest.spyOn(console, 'error').mock.calls[0][0];
      expect(errorMessage).toMatch(/\tlevel=error/);

      logger.warn('Warning message');
      const warnMessage = jest.spyOn(console, 'warn').mock.calls[0][0];
      expect(warnMessage).toMatch(/\tlevel=warn/);

      logger.debug('Debug message');
      const debugMessage = jest.spyOn(console, 'debug').mock.calls[0][0];
      expect(debugMessage).toMatch(/\tlevel=debug/);

      logger.verbose('Verbose message');
      const verboseMessage = jest.spyOn(console, 'info').mock.calls[0][0];
      expect(verboseMessage).toMatch(/\tlevel=verbose/);
    });
  });

  describe('escapeTSKVValue method', () => {
    it('should escape tabs', () => {
      const value = 'before\tafter';
      const escaped = logger['escapeTSKVValue'](value);
      expect(escaped).toBe('before\\tafter');
    });

    it('should escape newlines', () => {
      const value = 'line1\nline2';
      const escaped = logger['escapeTSKVValue'](value);
      expect(escaped).toBe('line1\\nline2');
    });

    it('should escape backslashes', () => {
      const value = 'path\\to\\file';
      const escaped = logger['escapeTSKVValue'](value);
      expect(escaped).toBe('path\\\\to\\\\file');
    });
  });
});
