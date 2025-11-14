import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus, // <-- Importa HttpStatus
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch() // <-- 1. Déjalo en blanco para atrapar TODO (no solo HttpException)
export class OauthExceptionFilter implements ExceptionFilter {
  
  catch(exception: unknown, host: ArgumentsHost) { 
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    // Comprueba si el error es un HttpException (como 404, 409, 400)
    if (exception instanceof HttpException) {
      
      
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;

      // Comprueba si el error ocurrió en una ruta de callback de OAuth
      const isOauthCallback =
        request.url.includes('/auth/google/redirect') ||
        request.url.includes('/auth/github/redirect');

      if (isOauthCallback) {
        // ¡Sí es un error de OAuth! Redirigimos al frontend.
        let redirectUrl: string;
        let errorCode: string;

        if (status === HttpStatus.CONFLICT) { // 409 - "Email ya existe"
          redirectUrl = `${process.env.FRONTEND_URL}/login`;
          errorCode = 'email_exists';
        
        } else if (status === HttpStatus.NOT_FOUND) { // 404 - "Usuario no encontrado"
          redirectUrl = `${process.env.FRONTEND_URL}/register`;
          errorCode = 'user_not_found';
        
        } else {
          // Cualquier otro error (ej. 500)
          redirectUrl = `${process.env.FRONTEND_URL}/login`;
          errorCode = 'unknown_error';
        }

        const errorMessage =
          typeof exceptionResponse === 'string'
            ? exceptionResponse
            : exceptionResponse.message ||
              (exception as Error).message || // (Fallback por si acaso)
              'Error desconocido';

        // Construye la URL final con los errores
        const finalRedirect = new URL(redirectUrl);
        finalRedirect.searchParams.set('error', errorCode);
        finalRedirect.searchParams.set('message', encodeURIComponent(errorMessage));
        
        response.redirect(finalRedirect.toString());

      } else {
        // Es un error HTTP, pero no en el callback (ej. un 400 en /auth/login)
        // Devolvemos el JSON estándar
        response.status(status).json({
          statusCode: status,
          message: exceptionResponse.message || (exception as Error).message,
          error: exceptionResponse.error || 'HttpException',
        });
      }

    } else {
      
      console.error(
        'OauthExceptionFilter atrapó un error NO-HTTP:',
        exception,
      );
      
      // Devolvemos un error 500 genérico
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Internal server error',
      });
    }
  }
}