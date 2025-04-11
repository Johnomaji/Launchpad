import { TransformInterceptor } from './transform.interceptor'; // adjust path as needed
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response data in { success: true, data }', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockData = { message: 'Hello world' };

    const mockCallHandler: CallHandler = {
      handle: () => of(mockData),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: mockData,
      });
      done();
    });
  });

  it('should handle null response data correctly', (done) => {
    const mockContext = {} as ExecutionContext;
    const mockCallHandler: CallHandler = {
      handle: () => of(null),
    };

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
      expect(result).toEqual({
        success: true,
        data: null,
      });
      done();
    });
  });

  it('should preserve data types like arrays or primitives', (done) => {
    const mockContext = {} as ExecutionContext;
    const testCases = [42, 'text', [1, 2, 3], true];

    testCases.forEach((mockData, index) => {
      const mockCallHandler: CallHandler = {
        handle: () => of(mockData),
      };

      interceptor.intercept(mockContext, mockCallHandler).subscribe((result) => {
        expect(result).toEqual({
          success: true,
          data: mockData,
        });

        if (index === testCases.length - 1) done();
      });
    });
  });
});
