/**
 * Section selection type
 */
export type SectionSelection = 'first-heading' | 'last-heading' | 'file';

/**
 * Position within section
 */
export type SectionPosition = 'start' | 'end';

/**
 * Plugin settings
 */
export interface PluginSettings {
    /**
     * Format string for log entries from REST API. Uses '{entry}' as placeholder.
     */
    logEntryFormat: string;
    
    /**
     * Format string for manual log entries. Uses '{entry}' as placeholder.
     */
    manualLogEntryFormat: string;
    
    /**
     * The heading level to identify sections (e.g., '#', '##')
     */
    sectionHeadingLevel: string;
    
    /**
     * Which section to insert the log entry into
     */
    sectionSelection: SectionSelection;
    
    /**
     * Where in the section to insert the log entry
     */
    sectionPosition: SectionPosition;
    
    /**
     * Key for storing cached entries in localStorage
     */
    cacheKey: string;
}

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: PluginSettings = {
    logEntryFormat: '- [x] {currentTime} {entry}',
    manualLogEntryFormat: '- [x] 📝 {currentTime} {entry}',
    sectionHeadingLevel: '##',
    sectionSelection: 'last-heading',
    sectionPosition: 'end',
    cacheKey: 'journalLogCache'
};
