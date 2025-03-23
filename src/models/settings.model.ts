/**
 * Plugin settings
 */
export interface PluginSettings {
    /**
     * Format string for log entries. Uses '{entry}' as placeholder.
     */
    logEntryFormat: string;
    
    /**
     * The level of header to insert logs after
     */
    headerLevel: string;
    
    /**
     * Where to insert log entries in the daily note
     */
    insertLocation: 'last-heading' | 'file-start' | 'file-end';
    
    /**
     * Key for storing cached entries in localStorage
     */
    cacheKey: string;
}

/**
 * Default plugin settings
 */
export const DEFAULT_SETTINGS: PluginSettings = {
    logEntryFormat: '- [x] {entry}',
    headerLevel: '##',
    insertLocation: 'last-heading',
    cacheKey: 'journalLogCache'
};
