import { TFile } from 'obsidian';
import { FallbackReference, SectionPosition, SectionSelection } from './settings.model';

/**
 * Interface for the Local REST API plugin structure
 */
export interface LocalRestApiPlugin {
	requestHandler?: {
		apiExtensionRouter?: any;
	};
}

/**
 * Interface for HTTP request handlers
 */
export interface RouteHandler {
	(req: any, res: any, next: Function): void | Promise<void>;
}

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
 * Interface for daily note operation results
 */
export interface DailyNoteOperationResult {
	success: boolean;
	message?: string;
}

/**
 * Enum for log entry sources
 */
export enum LogEntrySource {
	API = 'api',
	MANUAL = 'manual'
}

/**
 * Interface for logging operation options
 */
export interface LogEntryOptions {
	format?: string;
	sectionSelection?: SectionSelection;
	sectionPosition?: SectionPosition;
	sectionHeadingLevel?: string;
	sectionHeadingText?: string;
	fallbackReference?: FallbackReference;
	source?: LogEntrySource;
}

/**
 * Interface for logging operation results
 */
export interface LogResult {
	success: boolean;
	cached?: boolean;
	message?: string;
}
