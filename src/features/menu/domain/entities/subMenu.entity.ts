// src/features/auth/domain/entities/user.entity.ts

import { AppError, ZERO } from '../../../../core';

export class SubMenuEntity {
	constructor(
		public id: number,
		public name: string,
		public url: string,
		public menuId: number
	) {}

	/**
	 * If someone wants to work with this entity (map an object coming from my database),
	 * let's make sure to do validations on its properties. …
	 * @param obj - The object coming from my database
	 * @returns SubMenuEntity - A new SubMenuEntity instance
	 */
	public static fromJson(obj: Record<string, unknown>): SubMenuEntity {
		const { id, name, url, menuId } = obj;
		if (!id) {
			throw AppError.badRequest('This entity requires an id', [{ constraint: 'id is required', fields: ['id'] }]);
		}
		if (!name || (name as string).length === ZERO) {
			throw AppError.badRequest('This entity requires a name', [{ constraint: 'name is required', fields: ['name'] }]);
		}
		if (!url || (url as string).length === ZERO) {
			throw AppError.badRequest('This entity requires an url', [{ constraint: 'url is required', fields: ['url'] }]);
		}
		if (!menuId || (menuId as number) === null) {
			throw AppError.badRequest('This entity requires an menuId', [
				{ constraint: 'menuId is required', fields: ['menuId'] }
			]);
		}
		return new SubMenuEntity(id as number, name as string, url as string, menuId as number);
	}
}
