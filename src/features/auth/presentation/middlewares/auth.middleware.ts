import { type Response, type NextFunction, type Request } from 'express';
import { AppError, ONE, ONE_THOUSAND, basicJWT } from '../../../../core';

import { type AuthRepository, GetUserById } from '../../../auth';
import { logger } from '../../../../core/utils/logger';

export class AuthMiddleware {
	//* Dependency injection
	constructor(private readonly repository: AuthRepository) {}

	public validateJWT = (req: Request, _: Response, next: NextFunction): void => {
		const authorization = req.header('Authorization');

		if (!authorization) {
			logger.error('Unauthorized (no authorization header)');
			throw AppError.unauthorized('Unauthorized (no authorization header)');
		}

		if (!authorization.startsWith('Bearer ')) {
			logger.error('Invalid authorization header (Bearer token required)');
			throw AppError.unauthorized('Invalid authorization header (Bearer token required)');
		}

		const token = authorization.split(' ').at(ONE) ?? '';
		const payload = basicJWT.validateToken<{ id: string; exp: number }>(token);

		if (!payload) {
			logger.error('Invalid token');
			throw AppError.unauthorized('Invalid token');
		}
		if (payload.exp < Date.now() / ONE_THOUSAND) {
			logger.error('Token expired');
			throw AppError.unauthorized('Token expired');
		}
		new GetUserById(this.repository)
			.execute(payload.id)
			.then((result) => {
				req.body.user = result;
				next();
			})
			.catch(next);
	};
}
