import { App } from 'obsidian';
import { DailyNoteService } from './dailyNote.service';
import { CacheService } from './cache.service';
import { LogEntryOptions, LogResult } from '../models/types';
import { MarkdownUtils } from '../utils/markdown.utils';
import { DEFAULT_SETTINGS } from '../models/settings.model';

/**
 * Service for logging entries to daily notes
 */
export class LoggingService {
    private app: App;
    private dailyNoteService: DailyNoteService;
    private cacheService: CacheService;
    private options: LogEntryOptions;
    
    /**
     * Create a new LoggingService
     * @param app The Obsidian App instance
     * @param dailyNoteService The daily note service
     * @param cacheService The cache service
     * @param options Default options for logging
     */
    constructor(
        app: App, 
        dailyNoteService: DailyNoteService,
        cacheService: CacheService,
        options?: Partial<LogEntryOptions>
    ) {
        this.app = app;
        this.dailyNoteService = dailyNoteService;
        this.cacheService = cacheService;
        this.options = {
            format: DEFAULT_SETTINGS.logEntryFormat,
            location: DEFAULT_SETTINGS.insertLocation,
            headerLevel: DEFAULT_SETTINGS.headerLevel,
            ...options
        };
    }
    
    /**
     * Add a log entry to the daily note
     * @param entry The log entry text
     * @param options Options to override defaults
     * @returns Result of the operation
     */
    async addLogEntry(
        entry: string, 
        options?: Partial<LogEntryOptions>
    ): Promise<LogResult> {
        const mergedOptions = { ...this.options, ...options };
        
        // Format the entry
        const formattedEntry = MarkdownUtils.formatLogEntry(entry, mergedOptions.format);
        
        // Get daily note
        const journal = this.dailyNoteService.getCurrentDailyNote();
        
        // If no daily note exists, cache the entry
        if (!journal) {
            this.cacheService.addEntry(formattedEntry);
            return {
                success: true,
                cached: true,
                message: 'Entry cached for later processing'
            };
        }
        
        try {
            // Get cached entries if any
            const cachedEntries = this.cacheService.getEntries();
            let finalEntry = formattedEntry;
            
            if (cachedEntries) {
                finalEntry = `${cachedEntries}\n${formattedEntry}`;
            }
            
            // Read the file
            const lines = await this.dailyNoteService.readFile(journal);
            
            // Find insert position based on location setting
            let insertPosition: number;
            
            switch (mergedOptions.location) {
                case 'file-start':
                    insertPosition = 0;
                    break;
                case 'file-end':
                    insertPosition = lines.length;
                    break;
                case 'last-heading':
                default:
                    insertPosition = this.dailyNoteService.findInsertPosition(
                        lines,
                        mergedOptions.headerLevel!,
                        'last'
                    );
                    break;
            }
            
            // Insert the entry
            lines.splice(insertPosition, 0, finalEntry);
            
            // Write the file
            const result = await this.dailyNoteService.writeFile(journal, lines);
            
            if (result.success) {
                // Clear cache if successful
                this.cacheService.clearEntries();
            }
            
            return result;
        } catch (error) {
            return {
                success: false,
                message: `Failed to add log entry: ${error}`
            };
        }
    }

    /**
     * Update logging options
     * @param options New options to use
     */
    updateOptions(options: Partial<LogEntryOptions>): void {
        this.options = { ...this.options, ...options };
    }
}
