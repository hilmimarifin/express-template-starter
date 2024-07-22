import { type AuthEntity } from '../entities';
import { type AuthRepository } from '../repositories/repository';

export interface GetRefreshTokenUseCase {
	execute: (dto: string) => Promise<Omit<AuthEntity, 'user'>>;
}

export class GetRefreshToken implements GetRefreshTokenUseCase {
	constructor(private readonly repository: AuthRepository) {}

	async execute(dto: string): Promise<Omit<AuthEntity, 'user'>> {
		return await this.repository.getRefreshToken(dto);
	}
}
