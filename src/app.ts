// src\app.ts

import { PrismaClient } from '@prisma/client';
import { envs } from './core';
import { AppRoutes } from './routes';
import { Server } from './server';

(() => {
	main();
})();

function main(): void {
	// * At this point you can connect to your database for example MongoDB
	const prisma = new PrismaClient();
	const server = new Server({
		port: envs.PORT,
		apiPrefix: envs.API_PREFIX,
		routes: AppRoutes.routes,
		db: prisma
	});
	void server.start();
}
