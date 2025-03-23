import { LoggingService } from '../services/logging.service';
import { EndpointHandler, LogEntrySource } from '../models/types';

/**
 * Handles the /log endpoint
 */
export class LogEndpointHandler implements EndpointHandler {
	private loggingService: LoggingService;

	constructor(loggingService: LoggingService) {
		this.loggingService = loggingService;
	}

	getMethod(): string {
		return 'GET';
	}

	getPath(): string {
		return '/log';
	}

	async handleRequest(req: any, res: any, next: Function): Promise<void> {
		if (!req.query.log) {
			res.send('No Log');
			return;
		}

		try {
			const result = await this.loggingService.addLogEntry(req.query.log, {
				source: LogEntrySource.API,
			});

			if (result.success) {
				res.send('OK');
			} else {
				res.status(500).send(result.message || 'Unknown error');
			}
		} catch (error) {
			console.error('Error handling log request:', error);
			res.status(500).send('Error processing log entry');
		}
	}
}

/**
 * Factory for creating endpoint handlers
 */
export class EndpointFactory {
	/**
	 * Create all registered endpoint handlers
	 * @param loggingService The logging service
	 * @returns Array of endpoint handlers
	 */
	static createEndpoints(loggingService: LoggingService): EndpointHandler[] {
		return [
			new LogEndpointHandler(loggingService),
			// Add more endpoint handlers here
		];
	}
}
