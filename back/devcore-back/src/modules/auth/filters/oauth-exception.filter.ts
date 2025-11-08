import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

export class OauthExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    //Comprobamos si el error ocurio en una ruta de callback
    const isOauthCallback =
      request.url.includes('google/redirect') ||
      request.url.includes('github/redirect');

    if (isOauthCallback) {
      let redirectUrl: string;
      let errorCode: string;

      //si el email ya existe lo mandamos a login
      if (status === HttpStatus.CONFLICT) {
        redirectUrl = `${process.env.FRONTEND_URL}/login`;
        errorCode = 'email_exists';
      } else if (status === HttpStatus.NOT_FOUND) {
        //si el email no existe lo mandamos a register
        redirectUrl = `${process.env.FRONTEND_URL}/register`;
        errorCode = 'user_not_found';
      } else {
        redirectUrl = `${process.env.FRONTEND_URL}/login`;
        errorCode = 'unknown_error';
      }

      const errorMessage = typeof exceptionResponse === 'string' ? exceptionResponse : exceptionResponse.message || 'Error Desconocido';

      //Construimos la url con los errores
      const finalRedirect = new URL(redirectUrl);
      finalRedirect.searchParams.set('error', errorCode);
      finalRedirect.searchParams.set('error_description', errorMessage);

      response.redirect(finalRedirect.toString());
    } else {
        // No es un error de OAuth, devuelve el JSON estándar
      response.status(status).json({
        statusCode: status,
        message: exceptionResponse.message || exception.message,
        error: exceptionResponse.error || 'HttpException',
      });
    }
  }
}
