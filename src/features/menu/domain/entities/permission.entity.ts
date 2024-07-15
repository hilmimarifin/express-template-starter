// src/features/auth/domain/entities/user.entity.ts

import { AppError, ZERO } from '../../../../core';

export class PermissionEntity {
	constructor(
		public id: number,
		public name: string,
		public url: string
	) {}

	/**
	 * If someone wants to work with this entity (map an object coming from my database),
	 * let's make sure to do validations on its properties. …
	 * @param obj - The object coming from my database
	 * @returns PermissionEntity - A new PermissionEntity instance
	 */
	public static fromJson(obj: Record<string, unknown>): PermissionEntity {
		const { id, name, url } = obj;
		if (!id) {
			throw AppError.badRequest('This entity requires an id', [{ constraint: 'id is required', fields: ['id'] }]);
		}
		if (!name || (name as string).length === ZERO) {
			throw AppError.badRequest('This entity requires a name', [{ constraint: 'name is required', fields: ['name'] }]);
		}
		if (!url || (url as string).length === ZERO) {
			throw AppError.badRequest('This entity requires an url', [{ constraint: 'url is required', fields: ['url'] }]);
		}
		return new PermissionEntity(id as number, name as string, url as string);
	}
}
