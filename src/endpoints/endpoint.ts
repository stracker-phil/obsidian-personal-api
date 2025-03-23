import { LoggingService, LogEntrySource } from "../services/logging.service";

/**
 * Base interface for all endpoint handlers
 */
export interface EndpointHandler {
    /**
     * Get the HTTP method for this endpoint
     */
    getMethod(): string;
    
    /**
     * Get the path for this endpoint
     */
    getPath(): string;
    
    /**
     * Handle the API request
     */
    handleRequest(req: any, res: any, next: Function): Promise<void>;
}

/**
 * Base class for all endpoint handlers
 */
export abstract class BaseEndpointHandler implements EndpointHandler {
    abstract getMethod(): string;
    abstract getPath(): string;
    abstract handleRequest(req: any, res: any, next: Function): Promise<void>;
}

/**
 * Handles the /log endpoint
 */
export class LogEndpointHandler extends BaseEndpointHandler {
    private loggingService: LoggingService;
    
    constructor(loggingService: LoggingService) {
        super();
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
                source: LogEntrySource.API
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
            new LogEndpointHandler(loggingService)
            // Add more endpoint handlers here
        ];
    }
}
