import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Post,
} from '@nestjs/common';
import { CreateRootUserDto } from 'src/core/users/dtos/create-root-user.dto';
import { SignInDto, SignInEmployeeDto } from '../dtos/sign-in.dto';
import { SignInRootUserUseCase } from '../use-cases/sign-in-root-user.usecase';
import { SignUpRootUserUseCase } from '../use-cases/sign-up-root-user.usecase';
import { HTTPResponse } from 'src/shared/http/response';
import { GetUser } from '../decorators/get-user.decorator';
import { Public } from '../decorators/public-route.decorator';
import { SignInEmployeeUseCase } from '../use-cases/sign-in-employee.usecase';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly signUpRootUserUseCase: SignUpRootUserUseCase,
    private readonly signInRootUserUseCase: SignInRootUserUseCase,
    private readonly signInEmployeeUseCase: SignInEmployeeUseCase,
  ) {}

  @Post('sign-up')
  @Public()
  public async create(@Body() data: CreateRootUserDto) {
    try {
      await this.signUpRootUserUseCase.execute(data);

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
      const jwt = await this.signInRootUserUseCase.execute(data);

      return HTTPResponse.ok(jwt);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new BadRequestException('Something went wrong');
    }
  }

  @Post('sign-in-employee')
  @Public()
  public async signInEmployee(@Body() data: SignInEmployeeDto) {
    try {
      const jwt = await this.signInEmployeeUseCase.execute(data);

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
