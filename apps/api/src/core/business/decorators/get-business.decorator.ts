import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetBusiness = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const business = req.business;

    return business;
  },
);
