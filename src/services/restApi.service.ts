import { App } from 'obsidian';
import { PluginUtils } from '../utils/plugin.utils';
import { LocalRestApiPlugin, RouteHandler } from '../models/types';

/**
 * Service for interacting with the Local REST API plugin
 */
export class RestApiService {
	private app: App;
	private router: any = null;
	private routes: Map<string, RouteHandler> = new Map();
	private middlewareAdded = false;

	/**
	 * Create a new RestApiService
	 * @param app The Obsidian App instance
	 */
	constructor(app: App) {
		this.app = app;
	}

	/**
	 * Initialize the REST API service
	 * @returns True if initialization successful, false otherwise
	 */
	initialize(): boolean {
		try {
			const result = PluginUtils.getPlugin<LocalRestApiPlugin>(
				this.app,
				'obsidian-local-rest-api',
			);

			if (!result.instance?.requestHandler?.apiExtensionRouter) {
				console.error('Local REST API plugin not found or incorrectly initialized');
				return false;
			}

			this.router = result.instance.requestHandler.apiExtensionRouter;
			this.addMiddleware();
			return true;
		} catch (error) {
			console.error('Error initializing REST API service:', error);
			return false;
		}
	}

	/**
	 * Register a route with the REST API
	 * @param method The HTTP method (GET, POST, etc.)
	 * @param path The route path
	 * @param handler The route handler function
	 */
	registerRoute(method: string, path: string, handler: RouteHandler): void {
		if (!this.router) {
			console.error('Cannot register route: REST API not initialized');
			return;
		}

		const normalizedPath = this.normalizePath(path);
		const key = `${method.toUpperCase()}:${normalizedPath}`;
		this.routes.set(key, handler);
		console.log(`Registered route ${method.toUpperCase()} ${normalizedPath}`);
	}

	/**
	 * Clean up and remove all routes
	 */
	cleanup(): void {
		this.routes.clear();
		this.middlewareAdded = false;
		this.router = null;
	}

	/**
	 * Add middleware to the router
	 */
	private addMiddleware(): void {
		if (this.middlewareAdded || !this.router) return;

		this.router.use((req: any, res: any, next: Function) => {
			const pathWithoutQuery = req.path.split('?')[0];
			const normalizedPath = this.normalizePath(pathWithoutQuery);
			const key = `${req.method}:${normalizedPath}`;

			if (this.routes.has(key)) {
				this.routes.get(key)!(req, res, next);
			} else {
				next();
			}
		});

		this.middlewareAdded = true;
	}

	/**
	 * Normalize a path by removing trailing slashes
	 * @param path The path to normalize
	 * @returns The normalized path
	 */
	private normalizePath(path: string): string {
		return path === '/' ? path : path.replace(/\/$/, '');
	}
}
