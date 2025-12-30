/**
 * Section selection type
 */
export type SectionSelection = 'heading-text' | 'first-heading' | 'last-heading' | 'file';

/**
 * Position relative to reference point
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
	 * The heading level to identify sections (e.g., '#', '##')
	 */
	sectionHeadingLevel: string;

	/**
	 * Which section to insert the log entry into
	 */
	sectionSelection: SectionSelection;

	/**
	 * The text of the heading to find (only used when sectionSelection is 'heading-text')
	 */
	sectionHeadingText: string;

	/**
	 * Where to create the heading if it doesn't exist (only used when sectionSelection is 'heading-text')
	 */
	fallbackReference: FallbackReference;

	/**
	 * Position relative to the reference point
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
	logEntryFormat: '- [x] {entry}',
	manualLogEntryFormat: '- [x] {lastEntryTime} - {currentTime} {entry}',
	sectionHeadingLevel: '##',
	sectionSelection: 'heading-text',
	sectionHeadingText: 'Log Items',
	fallbackReference: 'last-heading',
	sectionPosition: 'after',
	cacheKey: 'journalLogCache',
};
