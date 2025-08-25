import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Post,
} from '@nestjs/common';
import { CreateRootUserDto } from 'src/core/users/dtos/create-root-user.dto';
import { SignInDto } from '../dtos/sign-in.dto';
import { SignInUserUseCase } from '../use-cases/sign-in.usecase';
import { SignUpUserUseCase } from '../use-cases/sign-up.usercase';
import { HTTPResponse } from 'src/shared/http/response';
import { GetUser } from '../decorators/get-user.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { Public } from '../decorators/public-route.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpUserUseCase: SignUpUserUseCase,
    private readonly signInUserUseCase: SignInUserUseCase,
  ) {}

  @Post('sign-up')
  @Public()
  public async create(@Body() data: CreateRootUserDto) {
    try {
      await this.signUpUserUseCase.execute(data);

      return HTTPResponse.created(null);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Something went wrong');
    }
  }

  @Post('sign-in')
  @Public()
  public async signIn(@Body() data: SignInDto) {
    try {
      const jwt = await this.signInUserUseCase.execute(data);

      return HTTPResponse.ok(jwt);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Something went wrong');
    }
  }

  @Get('profile')
  public getUser(@GetUser() user: unknown) {
    return HTTPResponse.ok(user);
  }
}
