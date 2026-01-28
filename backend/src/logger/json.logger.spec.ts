import { JsonLogger } from './json.logger';

describe('JsonLogger', () => {
  let logger: JsonLogger;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    logger = new JsonLogger();

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log method', () => {
    it('should log message in JSON format', () => {
      const message = 'Test message';
      logger.log(message);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);

      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('level', 'log');
      expect(parsed.message).toEqual({ message });
    });

    it('should log object message in JSON format', () => {
      const message = { action: 'create', userId: 123 };
      logger.log(message);

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);

      expect(parsed.message).toEqual(message);
    });

    it('should include optional params in JSON', () => {
      const message = 'Test';
      const param1 = 'additional';
      const param2 = { data: 'info' };

      logger.log(message, param1, param2);

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      expect(parsed).toHaveProperty('params');
      expect(parsed.params).toEqual([param1, param2]);
    });

    it('should handle single array param correctly', () => {
      const message = 'Test';
      const paramsArray = ['param1', 'param2'];

      logger.log(message, paramsArray);

      const loggedMessage = consoleLogSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);
      expect(parsed.params).toEqual([paramsArray]);
    });
  });

  describe('error method', () => {
    it('should log error in JSON format', () => {
      const error = new Error('Something went wrong');
      logger.error('Error occurred', error);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleErrorSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);

      expect(parsed.level).toBe('error');
    });
  });

  describe('warn method', () => {
    it('should log warning in JSON format', () => {
      logger.warn('Warning message');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      const loggedMessage = consoleWarnSpy.mock.calls[0][0];
      const parsed = JSON.parse(loggedMessage);

      expect(parsed.level).toBe('warn');
    });
  });

  describe('debug method', () => {
    it('should log debug in JSON format', () => {
      const consoleDebugSpy = jest.spyOn(console, 'debug');
      logger.debug('Debug message');

      expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('verbose method', () => {
    it('should log verbose in JSON format', () => {
      const consoleInfoSpy = jest.spyOn(console, 'info');
      logger.verbose('Verbose message');

      expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
    });
  });
});
