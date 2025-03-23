/**
 * Utilities for Markdown-specific operations
 */
export class MarkdownUtils {
    /**
     * Find the line index after a specific header level in a document
     * @param lines The document lines
     * @param headerLevel The header level to search for (e.g., '##')
     * @param position Whether to find the first or last occurrence
     * @param offset The occurrence to find (0-based)
     * @returns The line index after the header
     */
    static findLineAfterHeader(
        lines: string[], 
        headerLevel: string, 
        position: 'first' | 'last' = 'first', 
        offset: number = 0
    ): number {
        let count = 0;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (!line.startsWith(`${headerLevel} `)) {
                continue;
            }
            
            if (count === offset) {
                if (position === 'first') {
                    return i + 1;
                }
                
                // For 'last', continue searching to find the last one or the next header
                let j = i + 1;
                while (j < lines.length) {
                    if (lines[j].startsWith('#')) {
                        // Found the next header - insert before it
                        return j;
                    }
                    j++;
                }
                
                // If we get here, we need to find the last non-empty line in this section
                // and insert after it while preserving trailing empty lines
                let lastContentLine = i + 1;  // Default to right after the header
                for (let k = i + 1; k < lines.length; k++) {
                    if (lines[k].trim() !== '') {
                        lastContentLine = k + 1;  // Position after this non-empty line
                    }
                }
                return lastContentLine;
            }
            count++;
        }
        
        // If we get here, we need to find the last non-empty line in the file
        // and insert after it while preserving trailing empty lines
        let lastContentLine = 0;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim() !== '') {
                lastContentLine = i + 1;
            }
        }
        return lastContentLine;
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
