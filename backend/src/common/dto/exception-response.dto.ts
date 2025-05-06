import { ApiProperty } from '@nestjs/swagger';

export class ExceptionResponseDto {
  @ApiProperty({
    description: 'HTTP status code of the response',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Timestamp of when the response was generated',
    example: '2025-05-04T12:34:56.789Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'The request URL path',
    example: '/api/v1/users',
  })
  path: string;

  @ApiProperty({
    description: 'A human-readable message describing the response',
    example: 'Request successful',
  })
  message: string;
}
