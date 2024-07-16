// src/features/auth/infraestructure/local.datasource.impl.ts

import { PrismaClient } from '@prisma/client';
import { AppError, basicEncript, basicJWT } from '../../../core';
import { type RegisterUserDto, type AuthDatasource, UserEntity, AuthEntity, type LoginUserDto } from '../domain';

export class AuthDatasourceImpl implements AuthDatasource {
	private readonly prisma = new PrismaClient();
	public async register(dto: RegisterUserDto): Promise<AuthEntity> {
		const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
		if (user) {
			throw AppError.badRequest('User already exists', [{ constraint: 'User already exists', fields: ['email'] }]);
		}
		const createdUser = {
			...dto,
			role_id: 1,
			avatar: ''
		};
		// Hash the password
		createdUser.password = basicEncript.hashPassword(dto.password);
		// Add the user to the mock
		await this.prisma.user.create({ data: createdUser });
		// Create the auth entity (omit the password)
		const userData = await this.prisma.user.findFirst({ where: { email: dto.email } });
		if (userData === null) {
			throw new Error('User not found');
		}

		const { password, ...rest } = UserEntity.fromJson(userData);
		const token = basicJWT.generateToken({ id: userData.id });
		// ? Here you can verify if the token is created correctly before to send it to the client
		return new AuthEntity(rest, token);
	}

	public async login(dto: LoginUserDto): Promise<AuthEntity> {
		const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
		if (!user) throw AppError.badRequest('User with this email not found');
		const isPasswordMatch = basicEncript.comparePassword(dto.password, user.password);
		if (!isPasswordMatch) throw AppError.badRequest('Invalid password');
		const { password, ...rest } = UserEntity.fromJson({ ...user });
		const token = basicJWT.generateToken({ id: user.id });
		// ? Here you can verify if the token is created correctly before to send it to the client
		return new AuthEntity(rest, token);
	}

	public async getUserById(dto: string): Promise<UserEntity> {
		const user = await this.prisma.user.findUnique({ where: { id: dto } });
		if (!user) throw AppError.badRequest('User with this id not found');
		return UserEntity.fromJson({ ...user });
	}
}
