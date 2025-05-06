import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './user.dto';

export class UserResponseDto {
  @ApiProperty({ default: true })
  success: boolean;

  @ApiProperty({ type: UserDto })
  data: UserDto;
}
