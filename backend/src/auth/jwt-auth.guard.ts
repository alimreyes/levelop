import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Solo verifica que el JWT sea válido. No sabe nada de tenants ni roles. */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
