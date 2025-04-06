
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { MongoServerError } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const newUser = await this.userModel.create(createUserDto);
      return newUser;
    } catch (error) {
      console.log("\n\n === \n\n", error, error.code);
      
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException('Wallet address or username already exists');
      }
      throw error;
    }
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByWalletAddress(walletAddress: string): Promise<User> {
    const user = await this.userModel.findOne({ walletAddress }).exec();
    if (!user) {
      throw new NotFoundException(`User with wallet address ${walletAddress} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {

    try {
      const updatedUser = await this.userModel
        .findByIdAndUpdate(id, updateUserDto, { new: true })
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return updatedUser;
    } catch (error) {
      console.log(error, error.code);
      if (error instanceof MongoServerError && error.code === 11000) {
        throw new ConflictException('Wallet address or username already exists');
      }
      throw error;
    }
  }

  async updateByWalletAddress(walletAddress: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findOneAndUpdate({ walletAddress }, updateUserDto, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with wallet address ${walletAddress} not found`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return deletedUser;
  }

  async removeByWalletAddress(walletAddress: string): Promise<User> {
    const deletedUser = await this.userModel
      .findOneAndDelete({ walletAddress })
      .exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with wallet address ${walletAddress} not found`);
    }

    return deletedUser;
  }
}
