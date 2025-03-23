import { TimeUtils } from './time.utils';
import { SectionPosition, SectionSelection } from '../models/settings.model';

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
	 * Find the insertion point within a section
	 * @param lines File lines
	 * @param sectionStart The starting line of the section
	 * @param position Whether to insert at the start or end of the section
	 * @returns The line to insert at
	 */
	static findSectionInsertPoint(lines: string[], sectionStart: number, position: SectionPosition): number {
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
	static findFileInsertPoint(lines: string[], position: SectionPosition): number {
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
	 * @param sectionPosition Where in the section to insert
	 * @param headingLevel Heading level for section detection
	 * @returns The line index to insert at
	 */
	static findInsertionPoint(
		lines: string[],
		sectionSelection: SectionSelection,
		sectionPosition: SectionPosition,
		headingLevel: string = '##',
	): number {
		// Handle empty file case
		if (lines.length === 0) {
			return 0;
		}

		// Handle file selection
		if (sectionSelection === 'file') {
			return this.findFileInsertPoint(lines, sectionPosition);
		}

		// Find the heading
		const findLast = sectionSelection === 'last-heading';
		const headingLine = this.findHeading(lines, headingLevel, findLast);

		// If no heading found, fall back to file
		if (headingLine === -1) {
			return this.findFileInsertPoint(lines, sectionPosition);
		}

		// Find insert point within section
		return this.findSectionInsertPoint(lines, headingLine, sectionPosition);
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
