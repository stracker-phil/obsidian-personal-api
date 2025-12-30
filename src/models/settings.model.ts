/**
 * Position relative to fallback reference point (before or after)
 */
export type SectionPosition = 'before' | 'after';

/**
 * Fallback reference point when heading is not found
 */
export type FallbackReference = 'first-heading' | 'last-heading' | 'file';

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
	 * The heading level to search for (e.g., '#', '##', '###')
	 */
	sectionHeadingLevel: string;

	/**
	 * The text of the heading to find (case-insensitive, punctuation trimmed)
	 */
	sectionHeadingText: string;

	/**
	 * Where to create the heading if it doesn't exist
	 */
	fallbackReference: FallbackReference;

	/**
	 * Position relative to the fallback reference (before or after)
	 */
	fallbackPosition: SectionPosition;

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
	manualLogEntryFormat: '- [x] {lastEntryTime} - {currentTime} {entry}',
	sectionHeadingLevel: '##',
	sectionHeadingText: 'Log Items',
	fallbackReference: 'last-heading',
	fallbackPosition: 'after',
	cacheKey: 'journalLogCache',
};
