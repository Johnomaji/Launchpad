import { Test } from '@nestjs/testing';
import { HttpExceptionFilter } from './http-exception-filter.filter';
import {
  HttpException,
  HttpStatus,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockRequest: any;
  let mockResponse: any;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new HttpExceptionFilter();

    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      url: '/test-url',
    };

    mockResponse = {
      status: mockStatus,
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    } as unknown as ArgumentsHost;
  });

  it('should handle standard HttpException', () => {
    const message = 'Standard error message';
    const status = HttpStatus.NOT_FOUND;
    const exception = new HttpException(message, status);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(status);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: status,
      timestamp: expect.any(String),
      path: '/test-url',
      message: message,
    });
  });

  it('should handle BadRequestException with string message', () => {
    const message = 'Bad request error message';
    const status = HttpStatus.BAD_REQUEST;
    const exception = new BadRequestException(message);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(status);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: status,
      timestamp: expect.any(String),
      path: '/test-url',
      message: message,
    });
  });

  it('should handle BadRequestException with array of messages', () => {
    const messageArray = ['Error 1', 'Error 2'];
    const status = HttpStatus.BAD_REQUEST;
    const exception = new BadRequestException(messageArray);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(status);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: status,
      timestamp: expect.any(String),
      path: '/test-url',
      message: messageArray,
    });
  });

  it('should handle BadRequestException with object containing message array', () => {
    const messageArray = ['Validation Error 1', 'Validation Error 2'];
    const status = HttpStatus.BAD_REQUEST;
    const exceptionResponse = {
      message: messageArray,
      error: 'Bad Request',
    };
    const exception = new BadRequestException(exceptionResponse);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(status);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: status,
      timestamp: expect.any(String),
      path: '/test-url',
      message: messageArray,
    });
  });

  it('should handle InternalServerErrorException', () => {
    const message = 'Internal server error';
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const exception = new InternalServerErrorException(message);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(status);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: status,
      timestamp: expect.any(String),
      path: '/test-url',
      message: message,
    });
  });

  it('should use default message when BadRequestException response is not an object', () => {
    const status = HttpStatus.BAD_REQUEST;
    const exception = new BadRequestException('Error message');
    jest.spyOn(exception, 'getResponse').mockReturnValue('string response');

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(status);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: status,
      timestamp: expect.any(String),
      path: '/test-url',
      message: 'Error message',
    });
  });

  it('should handle BadRequestException with empty message property', () => {
    const status = HttpStatus.BAD_REQUEST;
    const exceptionResponse = {
      error: 'Bad Request',
      message: '',
    };
    const exception = new BadRequestException(exceptionResponse);

    filter.catch(exception, mockArgumentsHost);

    expect(mockStatus).toHaveBeenCalledWith(status);
    expect(mockJson).toHaveBeenCalledWith({
      statusCode: status,
      timestamp: expect.any(String),
      path: '/test-url',
      message: '',
    });
  });

});
