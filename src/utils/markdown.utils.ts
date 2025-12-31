import { TimeUtils } from './time.utils';
import { HeadingInsertPosition } from '../models/settings.model';

/**
 * Internal position type for section/file insertion
 */
type InternalPosition = 'start' | 'end';

/**
 * Internal reference type (extracted from HeadingInsertPosition)
 */
type InternalReference = 'first-heading' | 'last-heading' | 'file';

/**
 * Internal position relative to reference (extracted from HeadingInsertPosition)
 */
type InternalRelativePosition = 'before' | 'after';

/**
 * Utilities for Markdown-specific operations
 */
export class MarkdownUtils {
	/**
	 * Get parent heading level (e.g., ### -> ##, #### -> ###)
	 * @param headingLevel The current heading level
	 * @returns The parent heading level
	 */
	private static getParentLevel(headingLevel: string): string {
		return headingLevel.slice(0, -1);
	}

	/**
	 * Find a heading of specified level
	 * @param lines File lines
	 * @param headingLevel The heading level to search for (e.g., '##')
	 * @param findLast Whether to find the last occurrence (true) or first (false)
	 * @returns The line index of the heading, or -1 if not found
	 */
	static findHeading(lines: string[], headingLevel: string, findLast = false): number {
		let result = -1;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith(`${headingLevel} `)) {
				if (!findLast) return i;
				result = i;
			}
		}
		return result;
	}

	/**
	 * Find the nth heading of specified level (1-indexed)
	 * @param lines File lines
	 * @param headingLevel The heading level to search for (e.g., '##')
	 * @param index The 1-based index (1 = first, 2 = second, etc.)
	 * @returns The line index of the heading, or -1 if not found
	 */
	static findNthHeading(lines: string[], headingLevel: string, index: number): number {
		let count = 0;
		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith(`${headingLevel} `)) {
				count++;
				if (count === index) {
					return i;
				}
			}
		}
		return -1;
	}

	/**
	 * Find the section end (right before the next heading of any level)
	 * @param lines File lines
	 * @param startLine The line to start searching from
	 * @returns The line index of the end of the section
	 */
	static findSectionEnd(lines: string[], startLine: number): number {
		for (let i = startLine + 1; i < lines.length; i++) {
			if (lines[i].startsWith('#')) {
				return i - 1;
			}
		}
		return lines.length - 1;
	}

	/**
	 * Normalize heading text for comparison (trim whitespace and punctuation)
	 * @param text The text to normalize
	 * @returns Normalized text (lowercase, trimmed, punctuation removed)
	 */
	static normalizeHeadingText(text: string): string {
		return text.trim().replace(/[.,;:!?]+$/, '').toLowerCase();
	}

	/**
	 * Find heading by level and text (case-insensitive, trimmed, first match only)
	 * @param lines File lines
	 * @param headingLevel The heading level to search for (e.g., '##')
	 * @param headingText The text to search for
	 * @returns The line index of the heading, or -1 if not found
	 */
	static findHeadingByText(
		lines: string[],
		headingLevel: string,
		headingText: string,
	): number {
		const normalizedSearch = this.normalizeHeadingText(headingText);

		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith(`${headingLevel} `)) {
				const lineText = lines[i].substring(headingLevel.length + 1);
				if (this.normalizeHeadingText(lineText) === normalizedSearch) {
					return i;
				}
			}
		}
		return -1;
	}

	/**
	 * Insert heading at fallback position and return line index after it
	 * @param lines File lines (will be modified)
	 * @param headingLevel The heading level to create
	 * @param headingText The heading text
	 * @param headingInsertPosition Where to position the heading
	 * @returns The line index where content should be inserted (after the new heading)
	 */
	static insertHeadingAtFallback(
		lines: string[],
		headingLevel: string,
		headingText: string,
		headingInsertPosition: HeadingInsertPosition,
	): number {
		const newHeading = `${headingLevel} ${headingText}`;
		let insertLine: number;

		// Determine the level to search for sections
		// For ##: search for ## sections
		// For ### and ####: search for parent (## or ###) sections
		const sectionLevel = headingLevel === '##' ? headingLevel : this.getParentLevel(headingLevel);

		switch (headingInsertPosition) {
			case 'file-start':
				insertLine = this.findFileInsertPoint(lines, 'start');
				break;

			case 'file-end':
				insertLine = this.findFileInsertPoint(lines, 'end');
				break;

			case 'first-section': {
				// Find first section and insert at end of its content
				const sectionHeading = this.findNthHeading(lines, sectionLevel, 1);

				if (sectionHeading === -1) {
					insertLine = lines.length;
				} else {
					insertLine = this.findSectionInsertPoint(lines, sectionHeading, 'end');
				}
				break;
			}

			case 'second-section': {
				// Find second section and insert at end of its content
				const sectionHeading = this.findNthHeading(lines, sectionLevel, 2);

				if (sectionHeading === -1) {
					insertLine = lines.length;
				} else {
					insertLine = this.findSectionInsertPoint(lines, sectionHeading, 'end');
				}
				break;
			}

			case 'last-section': {
				// Find last section and insert at end of its content
				const sectionHeading = this.findHeading(lines, sectionLevel, true);

				if (sectionHeading === -1) {
					insertLine = lines.length;
				} else {
					insertLine = this.findSectionInsertPoint(lines, sectionHeading, 'end');
				}
				break;
			}
		}

		// Insert the heading with appropriate spacing
		if (insertLine === 0) {
			// At beginning of file - no blank line before
			lines.splice(insertLine, 0, newHeading, '');
			return insertLine + 2;
		} else {
			// Not at beginning - add blank line before heading
			lines.splice(insertLine, 0, '', newHeading, '');
			return insertLine + 3;
		}
	}

	/**
	 * Find the insertion point within a section
	 * @param lines File lines
	 * @param sectionStart The starting line of the section
	 * @param position Whether to insert at the start or end of the section
	 * @returns The line to insert at
	 */
	static findSectionInsertPoint(lines: string[], sectionStart: number, position: InternalPosition): number {
		const sectionEnd = this.findSectionEnd(lines, sectionStart);

		if (position === 'start') {
			// Start from line after heading
			let insertPoint = sectionStart + 1;

			// Skip any blank lines after the heading
			while (insertPoint <= sectionEnd && lines[insertPoint].trim() === '') {
				insertPoint++;
			}

			// If we've reached the end of the section or file (all blank lines),
			// insert at the first blank line after header
			if (insertPoint > sectionEnd || insertPoint >= lines.length) {
				return sectionStart + 1;
			}

			// Insert before the first non-blank line
			return insertPoint;
		} else {
			// Find the last non-empty line in the section
			let lastNonEmptyLine = sectionStart;

			for (let i = sectionStart + 1; i <= sectionEnd; i++) {
				if (lines[i].trim() !== '') {
					lastNonEmptyLine = i;
				}
			}

			// Insert after the last non-empty line
			return lastNonEmptyLine + 1;
		}
	}

	/**
	 * Find insertion point at the start or end of a file, preserving frontmatter
	 * @param lines File lines
	 * @param position Whether to insert at the start or end of the file
	 * @returns The line to insert at
	 */
	static findFileInsertPoint(lines: string[], position: InternalPosition): number {
		// Handle empty file
		if (lines.length === 0) {
			return 0;
		}

		if (position === 'start') {
			// Skip YAML frontmatter if present
			let startPos = 0;
			if (lines[0] === '---') {
				for (let i = 1; i < lines.length; i++) {
					if (lines[i] === '---') {
						startPos = i + 1;
						break;
					}
				}
			}

			// Find the first non-empty line after frontmatter
			let firstContentLine = startPos;
			while (firstContentLine < lines.length && lines[firstContentLine].trim() === '') {
				firstContentLine++;
			}

			// If we reached the end, insert at position
			if (firstContentLine >= lines.length) {
				return startPos;
			}

			return firstContentLine;
		} else {
			// Find the last non-empty line
			let lastNonEmptyLine = -1;
			for (let i = 0; i < lines.length; i++) {
				if (lines[i].trim() !== '') {
					lastNonEmptyLine = i;
				}
			}

			// If no content, insert at start
			if (lastNonEmptyLine === -1) {
				return 0;
			}

			// Insert after the last non-empty line
			return lastNonEmptyLine + 1;
		}
	}

	/**
	 * Find insertion point by searching for a specific heading by text
	 * @param lines File lines
	 * @param headingLevel Heading level to search for (e.g., '##')
	 * @param headingText Text of heading to find (case-insensitive, punctuation trimmed)
	 * @param headingInsertPosition Where to create heading if not found
	 * @returns The line index to insert at
	 */
	static findInsertionPoint(
		lines: string[],
		headingLevel: string,
		headingText: string,
		headingInsertPosition: HeadingInsertPosition,
	): number {
		// Handle empty file case
		if (lines.length === 0) {
			return 0;
		}

		// Search for the heading
		const headingLine = this.findHeadingByText(lines, headingLevel, headingText);

		if (headingLine !== -1) {
			// Heading found - ALWAYS insert at end of section
			return this.findSectionInsertPoint(lines, headingLine, 'end');
		} else {
			// Heading not found - create it at fallback position
			return this.insertHeadingAtFallback(
				lines,
				headingLevel,
				headingText,
				headingInsertPosition,
			);
		}
	}

	/**
	 * Format a log entry according to a template with variables
	 * @param entry The raw log entry text
	 * @param template The template with placeholders
	 * @param lastEntryTime Optional last entry time
	 * @returns The formatted log entry
	 */
	static formatLogEntry(
		entry: string,
		template: string = '- [x] {entry}',
		lastEntryTime?: Date | null,
	): string {
		let result = template;

		// Replace current time variable
		if (result.includes('{currentTime}')) {
			const currentTime = TimeUtils.getCurrentTime24h();
			result = result.replace('{currentTime}', currentTime);
		}

		// Replace last entry time variable
		if (result.includes('{lastEntryTime}')) {
			let lastTimeFormatted: string = '--:--';

			if (lastEntryTime) {
				lastTimeFormatted = TimeUtils.formatTime24h(lastEntryTime);
			}

			result = result.replace('{lastEntryTime}', lastTimeFormatted);
		}

		return result.replace('{entry}', entry);
	}
}
