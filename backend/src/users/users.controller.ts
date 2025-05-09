import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  UseGuards,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './schemas/users.schema';
import { UserDto } from './dto/user.dto';
import { User as UserDecorator } from './users.decorator';
import { GetUsersResponseDto } from './dto/get-users-response.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '@auth/jwt-auth.guard';
import { ExceptionResponseDto } from '@common/dto/exception-response.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'User created successfully',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Bad Request',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @Get('by-wallet')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by wallet address' })
  @ApiQuery({
    name: 'address',
    type: String,
    description: 'The Wallet address of the user to retrieve',
    example: 'abc123',
    required: true,
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Bad Request',
  })
  async findByWalletAddress(
    @Query('address') walletAddress: string,
  ): Promise<User> {
    try {
      const user = await this.usersService.findByWalletAddress(walletAddress);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get all users' })
  @ApiOkResponse({
    type: [GetUsersResponseDto],
    description: 'Users retrieved successfully',
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Bad Request',
  })
  async findAll(): Promise<User[]> {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new BadRequestException('Failed to retrieve users');
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User retrieved successfully',
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Bad Request',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the user to retrieve',
    example: 'abc123',
  })
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to retrieve user');
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User updated successfully',
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Bad Request',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the user to update',
    example: 'abc123',
  })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  @Patch('wallet/:address')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update user by wallet address' })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User updated successfully',
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Bad Request',
  })
  @ApiParam({
    name: 'address',
    type: String,
    description: 'The wallet address of the user to update',
    example: 'abc123',
  })
  @ApiBody({ type: UpdateUserDto })
  async updateByWalletAddress(
    @Param('address') walletAddress: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    try {
      const user = await this.usersService.updateByWalletAddress(
        walletAddress,
        updateUserDto,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update user');
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user by ID' })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Bad Request',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The ID of the current user to be removed',
    example: 'abc123',
  })
  async remove(
    @Param('id') id: string,
    @UserDecorator() userDec: User,
  ): Promise<User> {
    try {
      const user = await this.usersService.remove(userDec.id);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }

  @Delete('wallet/:address')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete user by wallet address' })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({
    type: ExceptionResponseDto,
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    type: ExceptionResponseDto,
    description: 'Bad Request',
  })
  @ApiParam({
    name: 'address',
    type: String,
    description: 'The Wallet address of the current user',
    example: 'abc123',
  })
  async removeByWalletAddress(
    @Param('address') walletAddress: string,
    @UserDecorator() userDec: User,
  ): Promise<User> {
    try {
      const user = await this.usersService.removeByWalletAddress(
        userDec.walletAddress,
      );
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete user');
    }
  }
}
