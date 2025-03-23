import { TFile } from 'obsidian';

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
 * Interface for daily note operation results
 */
export interface DailyNoteOperationResult {
    success: boolean;
    message?: string;
}

/**
 * Interface for logging operation options
 */
export interface LogEntryOptions {
    format?: string;
    location?: 'last-heading' | 'file-start' | 'file-end';
    headerLevel?: string;
}

/**
 * Interface for logging operation results
 */
export interface LogResult {
    success: boolean;
    cached?: boolean;
    message?: string;
}

/**
 * Interface for file operation results
 */
export interface FileOperationResult {
    success: boolean;
    file?: TFile;
    message?: string;
}
