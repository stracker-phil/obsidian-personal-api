import { TimeUtils } from './time.utils';
import { FallbackReference, SectionPosition, SectionSelection } from '../models/settings.model';

/**
 * Internal position type for section/file insertion
 */
type InternalPosition = 'start' | 'end';

/**
 * Utilities for Markdown-specific operations
 */
export class MarkdownUtils {
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
	 * @param fallbackReference Where to position the heading
	 * @param position Before or after the reference point
	 * @returns The line index where content should be inserted (after the new heading)
	 */
	static insertHeadingAtFallback(
		lines: string[],
		headingLevel: string,
		headingText: string,
		fallbackReference: FallbackReference,
		position: SectionPosition,
	): number {
		const newHeading = `${headingLevel} ${headingText}`;
		let insertLine: number;

		if (fallbackReference === 'file') {
			// Insert at start or end of file
			if (position === 'before') {
				insertLine = this.findFileInsertPoint(lines, 'start');
			} else {
				insertLine = this.findFileInsertPoint(lines, 'end');
			}
		} else {
			// Find reference heading
			const findLast = fallbackReference === 'last-heading';
			const refHeading = this.findHeading(lines, headingLevel, findLast);

			if (refHeading === -1) {
				// No reference heading found, fall back to end of file
				insertLine = lines.length;
			} else {
				insertLine = position === 'before' ? refHeading : refHeading + 1;
			}
		}

		// Insert the heading and a blank line
		lines.splice(insertLine, 0, newHeading, '');

		// Return position after heading and blank line (where content should go)
		return insertLine + 2;
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
	 * Find insertion point based on section selection, position, and heading level
	 * @param lines File lines
	 * @param sectionSelection Which section to use
	 * @param sectionPosition Where relative to reference point
	 * @param headingLevel Heading level for section detection
	 * @param headingText Text of heading to find (for 'heading-text' mode)
	 * @param fallbackReference Where to create heading if not found (for 'heading-text' mode)
	 * @returns The line index to insert at
	 */
	static findInsertionPoint(
		lines: string[],
		sectionSelection: SectionSelection,
		sectionPosition: SectionPosition,
		headingLevel: string = '##',
		headingText?: string,
		fallbackReference?: FallbackReference,
	): number {
		// Handle empty file case
		if (lines.length === 0) {
			return 0;
		}

		// Handle heading-text mode
		if (sectionSelection === 'heading-text' && headingText) {
			const headingLine = this.findHeadingByText(lines, headingLevel, headingText);

			if (headingLine !== -1) {
				// Heading found - ALWAYS insert at end of section
				return this.findSectionInsertPoint(lines, headingLine, 'end');
			} else {
				// Heading not found - create it at fallback position
				const fallback = fallbackReference || 'file';
				const position = sectionPosition || 'after';
				return this.insertHeadingAtFallback(
					lines,
					headingLevel,
					headingText,
					fallback,
					position,
				);
			}
		}

		// Handle file selection
		if (sectionSelection === 'file') {
			const filePos = sectionPosition === 'before' ? 'start' : 'end';
			return this.findFileInsertPoint(lines, filePos);
		}

		// Handle first-heading/last-heading
		const findLast = sectionSelection === 'last-heading';
		const headingLine = this.findHeading(lines, headingLevel, findLast);

		// If no heading found, fall back to file
		if (headingLine === -1) {
			const filePos = sectionPosition === 'before' ? 'start' : 'end';
			return this.findFileInsertPoint(lines, filePos);
		}

		// Find insert point within section
		const secPos = sectionPosition === 'before' ? 'start' : 'end';
		return this.findSectionInsertPoint(lines, headingLine, secPos);
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
