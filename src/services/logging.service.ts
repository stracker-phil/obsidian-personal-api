import { App } from 'obsidian';
import { DailyNoteService } from './dailyNote.service';
import { CacheService } from './cache.service';
import { LogResult } from '../models/types';
import { MarkdownUtils } from '../utils/markdown.utils';
import { DEFAULT_SETTINGS, SectionPosition, SectionSelection } from '../models/settings.model';

/**
 * Options for logging entries
 */
export interface LogEntryOptions {
    format?: string;
    sectionSelection?: SectionSelection;
    sectionPosition?: SectionPosition;
    sectionHeadingLevel?: string;
}

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
            sectionSelection: DEFAULT_SETTINGS.sectionSelection,
            sectionPosition: DEFAULT_SETTINGS.sectionPosition,
            sectionHeadingLevel: DEFAULT_SETTINGS.sectionHeadingLevel,
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
            
            // Find the insertion point using the new logic
            const insertPosition = MarkdownUtils.findInsertionPoint(
                lines,
                mergedOptions.sectionSelection as SectionSelection,
                mergedOptions.sectionPosition as SectionPosition,
                mergedOptions.sectionHeadingLevel
            );
            
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
