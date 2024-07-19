// src\server.ts

import { type Server as ServerHttp, type IncomingMessage, type ServerResponse } from 'http';
import express, { type Router, type Request, type Response, type NextFunction } from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { HttpCode, ONE_HUNDRED, ONE_THOUSAND, SIXTY, AppError } from './core';
import { CustomMiddlewares } from './features/shared';
import { type PrismaClient } from '@prisma/client';
import { logger } from './core/utils/logger';
import cookieParser from 'cookie-parser';

interface ServerOptions {
	port: number;
	routes: Router;
	apiPrefix: string;
	db: PrismaClient;
}

export class Server {
	public readonly app = express(); // This is public for testing purposes
	private serverListener?: ServerHttp<typeof IncomingMessage, typeof ServerResponse>;
	private readonly port: number;
	private readonly routes: Router;
	private readonly apiPrefix: string;
	private readonly db: PrismaClient;

	constructor(options: ServerOptions) {
		const { port, routes, apiPrefix, db } = options;
		this.port = port;
		this.routes = routes;
		this.apiPrefix = apiPrefix;
		this.db = db;
	}

	async start(): Promise<void> {
		//* Middlewares
		this.app.use(express.json()); // parse json in request body (allow raw)
		this.app.use(express.urlencoded({ extended: true })); // allow x-www-form-urlencoded
		this.app.use(compression());
		//  limit repeated requests to public APIs
		this.app.use(
			rateLimit({
				max: ONE_HUNDRED,
				windowMs: SIXTY * SIXTY * ONE_THOUSAND,
				message: 'Too many requests from this IP, please try again in one hour'
			})
		);

		// Shared Middlewares
		this.app.use(CustomMiddlewares.writeInConsole);

		// CORS
		this.app.use((req, res, next) => {
			// Add your origins
			const allowedOrigins = ['http://localhost:3000'];
			const origin = req.headers.origin;
			// TODO: Fix this
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			if (allowedOrigins.includes(origin!)) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				res.setHeader('Access-Control-Allow-Origin', origin!);
			}
			res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
			res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
			next();
		});

		//* Routes
		this.app.use(this.apiPrefix, this.routes);

		this.app.use(cookieParser());
		// Test rest api
		this.app.get('/', (_req: Request, res: Response) => {
			return res.status(HttpCode.OK).send({
				message: `Welcome to Initial API! \n Endpoints available at http://localhost:${this.port}/`
			});
		});

		//* Handle not found routes in /api/v1/* (only if 'Public content folder' is not available)
		this.routes.all('*', (req: Request, _: Response, next: NextFunction): void => {
			next(AppError.notFound(`Cant find ${req.originalUrl} on this server!`));
		});

		// Handle errors middleware
		// this.routes.use(ErrorMiddleware.handleError);

		this.db
			.$connect()
			.then(() => {
				logger.info('Successfully connected to database!');
			})
			.catch((error) => {
				logger.error(error);
			});
		this.serverListener = this.app.listen(this.port, () => {
			logger.info(`Server running on port ${this.port}...`);
		});
	}

	close(): void {
		this.serverListener?.close();
	}
}
