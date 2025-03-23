/**
 * Utilities for Markdown-specific operations
 */
export class MarkdownUtils {
    /**
     * Find the first heading of specified level
     * @param lines File lines
     * @param headingLevel The heading level to search for (e.g., '##')
     * @returns The line index of the heading, or -1 if not found
     */
    static findFirstHeading(lines: string[], headingLevel: string): number {
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith(`${headingLevel} `)) {
                return i;
            }
        }
        return -1;
    }
    
    /**
     * Find the last heading of specified level
     * @param lines File lines
     * @param headingLevel The heading level to search for (e.g., '##')
     * @returns The line index of the heading, or -1 if not found
     */
    static findLastHeading(lines: string[], headingLevel: string): number {
        let lastIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].startsWith(`${headingLevel} `)) {
                lastIndex = i;
            }
        }
        return lastIndex;
    }
    
    /**
     * Find the end of a section (right before the next heading of any level)
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
     * Find the insertion point at the start of a section
     * @param lines File lines
     * @param sectionStart The starting line of the section
     * @returns The line to insert at
     */
    static findSectionStartInsertPoint(lines: string[], sectionStart: number): number {
        // Start from line after heading
        let insertPoint = sectionStart + 1;
        const sectionEnd = this.findSectionEnd(lines, sectionStart);
        
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
    }
    
    /**
     * Find the insertion point at the end of a section
     * @param lines File lines
     * @param sectionStart The starting line of the section
     * @param sectionEnd The ending line of the section
     * @returns The line to insert at
     */
    static findSectionEndInsertPoint(lines: string[], sectionStart: number, sectionEnd: number): number {
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
    
    /**
     * Find insertion point at the start of a file, preserving frontmatter
     * @param lines File lines
     * @returns The line to insert at
     */
    static findStartOfFileInsertPoint(lines: string[]): number {
        // Handle empty file
        if (lines.length === 0) {
            return 0;
        }
        
        // Skip YAML frontmatter if present
        let position = 0;
        if (lines[0] === '---') {
            for (let i = 1; i < lines.length; i++) {
                if (lines[i] === '---') {
                    position = i + 1;
                    break;
                }
            }
        }
        
        // Find the first non-empty line after frontmatter
        let firstContentLine = position;
        while (firstContentLine < lines.length && lines[firstContentLine].trim() === '') {
            firstContentLine++;
        }
        
        // If we reached the end, insert at position
        if (firstContentLine >= lines.length) {
            return position;
        }
        
        return firstContentLine;
    }
    
    /**
     * Find insertion point at the end of a file
     * @param lines File lines
     * @returns The line to insert at
     */
    static findEndOfFileInsertPoint(lines: string[]): number {
        // Handle empty file
        if (lines.length === 0) {
            return 0;
        }
        
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
        sectionSelection: 'first-heading' | 'last-heading' | 'file',
        sectionPosition: 'start' | 'end',
        headingLevel: string = '##'
    ): number {
        // Handle empty file case
        if (lines.length === 0) {
            return 0;
        }
        
        switch (sectionSelection) {
            case 'file':
                if (sectionPosition === 'start') {
                    return this.findStartOfFileInsertPoint(lines);
                } else {
                    return this.findEndOfFileInsertPoint(lines);
                }
                
            case 'first-heading': {
                const headingLine = this.findFirstHeading(lines, headingLevel);
                
                // If no heading found, fall back to file
                if (headingLine === -1) {
                    if (sectionPosition === 'start') {
                        return this.findStartOfFileInsertPoint(lines);
                    } else {
                        return this.findEndOfFileInsertPoint(lines);
                    }
                }
                
                const sectionEnd = this.findSectionEnd(lines, headingLine);
                
                if (sectionPosition === 'start') {
                    return this.findSectionStartInsertPoint(lines, headingLine);
                } else {
                    return this.findSectionEndInsertPoint(lines, headingLine, sectionEnd);
                }
            }
                
            case 'last-heading': {
                const headingLine = this.findLastHeading(lines, headingLevel);
                
                // If no heading found, fall back to file
                if (headingLine === -1) {
                    if (sectionPosition === 'start') {
                        return this.findStartOfFileInsertPoint(lines);
                    } else {
                        return this.findEndOfFileInsertPoint(lines);
                    }
                }
                
                const sectionEnd = this.findSectionEnd(lines, headingLine);
                
                if (sectionPosition === 'start') {
                    return this.findSectionStartInsertPoint(lines, headingLine);
                } else {
                    return this.findSectionEndInsertPoint(lines, headingLine, sectionEnd);
                }
            }
                
            default:
                return 0;
        }
    }

    /**
     * Format a log entry according to a template
     * @param entry The raw log entry text
     * @param template The template with '{entry}' placeholder
     * @returns The formatted log entry
     */
    static formatLogEntry(entry: string, template: string = '- [x] {entry}'): string {
        return template.replace('{entry}', entry);
    }
}
