/**
 * Unified position for where to insert heading if not found
 * Keys are static - interpretation depends on heading level:
 * - For ##: first/second/last-section means "after Nth ## sibling"
 * - For ### and ####: first/second/last-section means "end of Nth parent section"
 */
export type HeadingInsertPosition =
	| 'file-start'
	| 'first-section'
	| 'second-section'
	| 'last-section'
	| 'file-end';

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
	 * Where to insert the heading if it doesn't exist
	 */
	headingInsertPosition: HeadingInsertPosition;

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
	headingInsertPosition: 'last-section',
	cacheKey: 'journalLogCache',
};
