
import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException, 
  HttpStatus,   
} from '@nestjs/common';
import { Response } from 'express'; 

@Catch(HttpException)
export class RateLimitExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>(); 


    if (exception.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
      const retryAfter = response.getHeader('Retry-After');
      
      const waitTime = retryAfter ? (typeof retryAfter === 'number' ? retryAfter : parseInt(retryAfter as string, 10)) : 60;

      response.status(HttpStatus.TOO_MANY_REQUESTS).json({
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: `🚫 Você fez muitas requisições. Tente novamente em ${waitTime} segundos.`,
      });
    } else {
      response.status(exception.getStatus()).json(exception.getResponse());
    }
  }
}