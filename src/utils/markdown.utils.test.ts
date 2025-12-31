import { MarkdownUtils } from './markdown.utils';

describe('MarkdownUtils', () => {
	describe('normalizeHeadingText', () => {
		/*
		 * Given: Heading text with leading and trailing whitespace
		 * When: Normalizing the text
		 * Then: Returns lowercase text with whitespace trimmed
		 */
		it('should trim whitespace and convert to lowercase', () => {
			expect(MarkdownUtils.normalizeHeadingText('  Log Items  ')).toBe('log items');
		});

		/*
		 * Given: Heading text with trailing punctuation
		 * When: Normalizing the text
		 * Then: Returns lowercase text with trailing punctuation removed
		 */
		it('should remove trailing punctuation', () => {
			expect(MarkdownUtils.normalizeHeadingText('Activity Log:')).toBe('activity log');
			expect(MarkdownUtils.normalizeHeadingText('Done Today!')).toBe('done today');
			expect(MarkdownUtils.normalizeHeadingText('Notes...')).toBe('notes');
		});

		/*
		 * Given: Heading text with multiple trailing punctuation marks
		 * When: Normalizing the text
		 * Then: Returns lowercase text with all trailing punctuation removed
		 */
		it('should handle multiple trailing punctuation marks', () => {
			expect(MarkdownUtils.normalizeHeadingText('What?!?')).toBe('what');
		});

		/*
		 * Given: Heading text with no punctuation
		 * When: Normalizing the text
		 * Then: Returns lowercase text unchanged except for case
		 */
		it('should handle text with no punctuation', () => {
			expect(MarkdownUtils.normalizeHeadingText('Simple Text')).toBe('simple text');
		});

		/*
		 * Given: Empty or whitespace-only strings
		 * When: Normalizing the text
		 * Then: Returns empty string
		 */
		it('should handle empty strings', () => {
			expect(MarkdownUtils.normalizeHeadingText('')).toBe('');
			expect(MarkdownUtils.normalizeHeadingText('   ')).toBe('');
		});
	});

	describe('formatLogEntry', () => {
		/*
		 * Given: Template with only {entry} placeholder
		 * When: Formatting a log entry
		 * Then: Returns entry with {entry} replaced
		 */
		it('should replace {entry} placeholder with entry text', () => {
			const result = MarkdownUtils.formatLogEntry('Did something', '- [x] {entry}');
			expect(result).toBe('- [x] Did something');
		});

		/*
		 * Given: Template with {currentTime} placeholder
		 * When: Formatting a log entry
		 * Then: Returns entry with {currentTime} replaced with current time
		 */
		it('should replace {currentTime} with current time in HH:MM format', () => {
			const result = MarkdownUtils.formatLogEntry('Task', '- {currentTime} {entry}');
			expect(result).toMatch(/^- \d{2}:\d{2} Task$/);
		});

		/*
		 * Given: Template with {lastEntryTime} and last entry time exists
		 * When: Formatting a log entry
		 * Then: Returns entry with {lastEntryTime} replaced with formatted last entry time
		 */
		it('should replace {lastEntryTime} with formatted time when last entry exists', () => {
			const lastTime = new Date('2024-01-01T14:00:00');
			const result = MarkdownUtils.formatLogEntry(
				'Task',
				'{lastEntryTime}-{currentTime} {entry}',
				lastTime,
			);
			expect(result).toMatch(/^14:00-\d{2}:\d{2} Task$/);
		});

		/*
		 * Given: Template with {lastEntryTime} but last entry time is null
		 * When: Formatting a log entry
		 * Then: Returns entry with {lastEntryTime} replaced with "--:--"
		 */
		it('should replace {lastEntryTime} with "--:--" when last entry is null', () => {
			const result = MarkdownUtils.formatLogEntry(
				'Task',
				'{lastEntryTime}-{currentTime} {entry}',
				null,
			);
			expect(result).toMatch(/^--:---\d{2}:\d{2} Task$/);
		});

		/*
		 * Given: Template without any placeholders
		 * When: Formatting a log entry
		 * Then: Returns entry text with {entry} replaced
		 */
		it('should handle template with no variables', () => {
			const result = MarkdownUtils.formatLogEntry('Do it', '- Task: {entry}');
			expect(result).toBe('- Task: Do it');
		});

		/*
		 * Given: Template with multiple {entry} placeholders
		 * When: Formatting a log entry
		 * Then: Returns entry with only first {entry} occurrence replaced (known limitation)
		 */
		it('should replace only first occurrence of {entry}', () => {
			const result = MarkdownUtils.formatLogEntry('Text', '{entry} ({entry})');
			expect(result).toBe('Text ({entry})');
		});

		/*
		 * Given: Template with all available placeholders
		 * When: Formatting a log entry with last entry time
		 * Then: Returns entry with all placeholders replaced correctly
		 */
		it('should replace all variables when all are present', () => {
			const lastTime = new Date('2024-01-01T13:00:00');
			const result = MarkdownUtils.formatLogEntry(
				'Work',
				'{lastEntryTime}-{currentTime} {entry}',
				lastTime,
			);
			expect(result).toMatch(/^13:00-\d{2}:\d{2} Work$/);
		});

		/*
		 * Given: No template provided (uses default)
		 * When: Formatting a log entry
		 * Then: Returns entry with default template applied
		 */
		it('should use default template when none provided', () => {
			const result = MarkdownUtils.formatLogEntry('Task');
			expect(result).toBe('- [x] Task');
		});
	});

	describe('findInsertionPoint - Heading Exists', () => {
		/*
		 * Given: A daily note with "## Log Items" section and existing entry
		 * When: Finding insertion point with matching heading level and text
		 * Then: Returns position after the existing entry (end of section)
		 */
		it('should insert at end of section when heading matches', () => {
			const lines = ['## Log Items', '- old entry'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(result).toBe(2); // After "- old entry"
			expect(lines).toEqual(['## Log Items', '- old entry']); // No modification
		});

		/*
		 * Given: A daily note with "## log items" (lowercase)
		 * When: Finding insertion point with "Log Items" (mixed case)
		 * Then: Returns position in existing section (case-insensitive match)
		 */
		it('should match heading case-insensitively', () => {
			const lines = ['## log items', '- old entry'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(result).toBe(2);
		});

		/*
		 * Given: A daily note with "## Activity Log:" (with punctuation)
		 * When: Finding insertion point with "Activity Log" (no punctuation)
		 * Then: Returns position in existing section (punctuation trimmed)
		 */
		it('should match heading with punctuation trimmed', () => {
			const lines = ['## Activity Log:', '- old entry'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Activity Log',
				'last-section',
			);
			expect(result).toBe(2);
		});

		/*
		 * Given: A daily note with "## Log Items" followed by blank line and next section
		 * When: Finding insertion point
		 * Then: Returns position after heading in empty section
		 */
		it('should handle empty section', () => {
			const lines = ['## Log Items', '', '## Next Section'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(result).toBe(1); // After heading, before blank line
		});

		/*
		 * Given: A daily note with section containing trailing blank lines
		 * When: Finding insertion point
		 * Then: Returns position after last non-blank content
		 */
		it('should insert after last content, ignoring trailing blank lines', () => {
			const lines = ['## Log Items', '- entry', '', '', '## Next'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(result).toBe(2); // After "- entry"
		});

		/*
		 * Given: A daily note with multiple ## sections
		 * When: Finding insertion point for middle section
		 * Then: Returns position in correct section, not first or last
		 */
		it('should find correct section among multiple sections of same level', () => {
			const lines = ['## First', 'text', '## Log Items', '- entry', '## Third'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(result).toBe(4); // After "- entry"
		});

		/*
		 * Given: A daily note with #, ##, and ### headings
		 * When: Finding insertion point for ## level heading
		 * Then: Returns position in correct level section, ignoring other levels
		 */
		it('should match only headings of specified level', () => {
			const lines = ['# Top', '## Log Items', '- entry', '### Sub'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(result).toBe(3); // After "- entry", before "### Sub"
		});
	});

	describe('findInsertionPoint - Heading Not Found (Fallback)', () => {
		/*
		 * Given: A daily note with "## Section A" and "## Section B", no "## Log Items"
		 * When: Finding insertion point with fallback "first-heading" and position "before"
		 * Then: Creates "## Log Items" before "## Section A" and returns insert position
		 */
		it('should create heading before first heading when fallback is first-heading/before', () => {
			const lines = ['## Section A', 'text', '## Section B'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'file-start',
			);
			expect(lines[0]).toBe('## Log Items');
			expect(lines[1]).toBe('');
			expect(lines[2]).toBe('## Section A');
			expect(result).toBe(2); // Position after created heading
		});

		/*
		 * Given: A daily note with "## Section A" and "## Section B", no "## Log Items"
		 * When: Finding insertion point with fallback "first-heading" and position "after"
		 * Then: Creates "## Log Items" after "## Section A" heading and returns insert position
		 */
		it('should create heading at end of first section', () => {
			const lines = ['## Section A', 'text', '## Section B'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'first-section',
			);
			// Inserts at end of "## Section A" section (after "text", before "## Section B")
			expect(lines[1]).toBe('text');
			expect(lines[2]).toBe('');
			expect(lines[3]).toBe('## Log Items');
			expect(lines[4]).toBe('');
			expect(lines[5]).toBe('## Section B');
			expect(result).toBe(5);
		});

		/*
		 * Given: A daily note with "## Section A" and "## Section B", no "## Log Items"
		 * When: Finding insertion point with fallback "after-last-sibling"
		 * Then: Creates "## Log Items" after "## Section B" and returns insert position
		 */
		it('should create heading after last sibling when fallback is after-last-sibling', () => {
			const lines = ['## Section A', 'text', '## Section B'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(lines[2]).toBe('## Section B');
			expect(lines[3]).toBe('');
			expect(lines[4]).toBe('## Log Items');
			expect(lines[5]).toBe('');
			expect(result).toBe(6); // Position after created heading
		});

		/*
		 * Given: A daily note with "## Section A" and "## Section B", no "## Log Items"
		 * When: Finding insertion point with fallback "last-heading" and position "after"
		 * Then: Creates "## Log Items" after "## Section B" heading and returns insert position
		 */
		it('should create heading after last heading when fallback is last-heading/after', () => {
			const lines = ['## Section A', 'text', '## Section B'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(lines[3]).toBe('');
			expect(lines[4]).toBe('## Log Items');
			expect(lines[5]).toBe('');
			expect(result).toBe(6); // Position after created heading
		});

		/*
		 * Given: A daily note with content but no "## Log Items"
		 * When: Finding insertion point with fallback "file" and position "before"
		 * Then: Creates "## Log Items" at start of content and returns insert position
		 */
		it('should create heading at start of file when fallback is file/before', () => {
			const lines = ['Some content', 'More content'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'file-start',
			);
			expect(lines[0]).toBe('## Log Items');
			expect(lines[1]).toBe('');
			expect(result).toBe(2); // Position after created heading
		});

		/*
		 * Given: A daily note with content but no "## Log Items"
		 * When: Finding insertion point with fallback "file" and position "after"
		 * Then: Creates "## Log Items" at end of file and returns insert position
		 */
		it('should create heading at end of file when fallback is file/after', () => {
			const lines = ['Some content', 'More content'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'file-end',
			);
			expect(lines[2]).toBe('');
			expect(lines[3]).toBe('## Log Items');
			expect(lines[4]).toBe('');
			expect(result).toBe(5); // Position after created heading
		});
	});

	describe('findInsertionPoint - Second Sibling/Parent Positioning', () => {
		/*
		 * Given: A daily note with 3+ ## headings, no "## Log Items"
		 * When: Finding insertion point with fallback "after-second-sibling"
		 * Then: Creates "## Log Items" after second ## heading
		 */
		it('should create heading after second sibling when multiple siblings exist', () => {
			const lines = ['## Section A', 'text', '## Section B', 'more', '## Section C'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'second-section',
			);
			// Inserts at end of "## Section B" section (after "more", before "## Section C")
			expect(lines[3]).toBe('more');
			expect(lines[4]).toBe('');
			expect(lines[5]).toBe('## Log Items');
			expect(lines[6]).toBe('');
			expect(lines[7]).toBe('## Section C');
			expect(result).toBe(7);
		});

		/*
		 * Given: A daily note with only 1 ## heading, no "## Log Items"
		 * When: Finding insertion point with fallback "after-second-sibling"
		 * Then: Falls back to end of file (second heading doesn't exist)
		 */
		it('should fallback to end of file when second sibling does not exist', () => {
			const lines = ['## Section A', 'text'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'second-section',
			);
			expect(lines[2]).toBe('');
			expect(lines[3]).toBe('## Log Items');
			expect(lines[4]).toBe('');
			expect(result).toBe(5);
		});

		/*
		 * Given: A daily note with no ## headings
		 * When: Finding insertion point with fallback "after-second-sibling"
		 * Then: Falls back to end of file
		 */
		it('should fallback to end of file when no siblings exist', () => {
			const lines = ['Some content'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'second-section',
			);
			expect(lines[1]).toBe('');
			expect(lines[2]).toBe('## Log Items');
			expect(result).toBe(4);
		});

		/*
		 * Given: A daily note with multiple ## sections, looking for ### heading
		 * When: Finding insertion point with fallback "end-of-second-parent"
		 * Then: Creates ### heading at end of second ## section
		 */
		it('should create heading at end of second parent section when multiple parents exist', () => {
			const lines = [
				'## Parent A',
				'content',
				'## Parent B',
				'more content',
				'## Parent C',
			];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'###',
				'Details',
				'second-section',
			);
			// Should insert at end of "## Parent B" section (after "more content", before "## Parent C")
			expect(lines[3]).toBe('more content');
			expect(lines[4]).toBe('');
			expect(lines[5]).toBe('### Details');
			expect(lines[6]).toBe('');
			expect(result).toBe(7);
		});

		/*
		 * Given: A daily note with only 1 ## section, looking for ### heading
		 * When: Finding insertion point with fallback "end-of-second-parent"
		 * Then: Falls back to end of file (second parent doesn't exist)
		 */
		it('should fallback to end of file when second parent does not exist', () => {
			const lines = ['## Parent A', 'content'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'###',
				'Details',
				'second-section',
			);
			expect(lines[2]).toBe('');
			expect(lines[3]).toBe('### Details');
			expect(result).toBe(5);
		});
	});

	describe('findInsertionPoint - Robust Fallback Scenarios', () => {
		/*
		 * Given: A daily note with only # heading (title), looking for ### heading
		 * When: Finding insertion point with fallback "end-of-first-parent"
		 * Then: Falls back to end of file (no ## parent exists for ###)
		 */
		it('should fallback to end of file when parent level does not exist', () => {
			const lines = ['# My Daily Note', 'Some content'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'###',
				'Details',
				'first-section',
			);
			expect(lines[2]).toBe('');
			expect(lines[3]).toBe('### Details');
			expect(result).toBe(5);
		});

		/*
		 * Given: An empty daily note
		 * When: Finding insertion point
		 * Then: Returns 0 (empty file special case - no heading created)
		 */
		it('should return 0 for empty file without creating heading', () => {
			const lines: string[] = [];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'first-section',
			);
			expect(lines.length).toBe(0); // No modification
			expect(result).toBe(0);
		});

		/*
		 * Given: A note with only #### headings, looking for #### with ### parent
		 * When: Finding insertion point with fallback "end-of-last-parent"
		 * Then: Falls back to end of file (no ### parent exists)
		 */
		it('should fallback when looking for #### but only #### exists (no ### parent)', () => {
			const lines = ['#### Detail A', 'text', '#### Detail B'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'####',
				'New Detail',
				'last-section',
			);
			expect(lines[3]).toBe('');
			expect(lines[4]).toBe('#### New Detail');
			expect(result).toBe(6);
		});
	});

	describe('findInsertionPoint - Edge Cases', () => {
		/*
		 * Given: An empty daily note
		 * When: Finding insertion point
		 * Then: Returns position 0 (no heading created for empty file)
		 */
		it('should handle empty file', () => {
			const lines: string[] = [];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(result).toBe(0);
		});

		/*
		 * Given: A daily note with only YAML frontmatter
		 * When: Finding insertion point with fallback "file/before"
		 * Then: Creates heading after frontmatter
		 */
		it('should skip frontmatter when creating heading at file start', () => {
			const lines = ['---', 'title: Test', '---', ''];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'file-start',
			);
			expect(lines[4]).toBe('## Log Items');
			expect(result).toBe(6); // Position after created heading
		});

		/*
		 * Given: A daily note with frontmatter and content
		 * When: Finding insertion point with fallback "file/before"
		 * Then: Creates heading after frontmatter, before content
		 */
		it('should create heading after frontmatter but before content', () => {
			const lines = ['---', 'title: Test', '---', '', '# Heading'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'file-start',
			);
			expect(lines[4]).toBe(''); // Blank line before heading
			expect(lines[5]).toBe('## Log Items');
			expect(lines[6]).toBe('');
			expect(lines[7]).toBe('# Heading');
			expect(result).toBe(7);
		});

		/*
		 * Given: A daily note with # and ### headings but no ## headings
		 * When: Finding insertion point with level ## and fallback "last-heading"
		 * Then: No reference heading found, falls back to end of file
		 */
		it('should handle no matching heading level for fallback', () => {
			const lines = ['# Level 1', 'text', '### Level 3'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			// No ## heading found, should create at end of file
			expect(lines[3]).toBe('');
			expect(lines[4]).toBe('## Log Items');
			expect(result).toBe(6);
		});

		/*
		 * Given: A section with multiple blank lines after heading
		 * When: Finding insertion point in that section
		 * Then: Returns position after heading, skipping blank lines
		 */
		it('should skip blank lines immediately after heading', () => {
			const lines = ['## Log Items', '', '', 'text'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(result).toBe(4); // After "text"
		});

		/*
		 * Given: A section with multiple blank lines in the middle
		 * When: Finding insertion point in that section
		 * Then: Returns position after last non-blank content
		 */
		it('should insert after last non-blank line in section', () => {
			const lines = ['## Log Items', '- entry', '', '', 'text'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'last-section',
			);
			expect(result).toBe(5); // After "text"
		});

		/*
		 * Given: Creating heading at beginning of file (line 0)
		 * When: Inserting heading
		 * Then: No blank line added before heading
		 */
		it('should not add blank line before heading when creating at line 0', () => {
			const lines = ['Content'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'file-start',
			);
			expect(lines[0]).toBe('## Log Items');
			expect(lines[1]).toBe('');
			expect(lines[2]).toBe('Content');
			expect(result).toBe(2);
		});

		/*
		 * Given: Creating heading at any position > 0
		 * When: Inserting heading
		 * Then: Blank line added before heading for proper spacing
		 */
		it('should add blank line before heading when creating at position > 0', () => {
			const lines = ['Content', 'More content'];
			const result = MarkdownUtils.findInsertionPoint(
				lines,
				'##',
				'Log Items',
				'file-end',
			);
			expect(lines[2]).toBe(''); // Blank line before heading
			expect(lines[3]).toBe('## Log Items');
			expect(lines[4]).toBe('');
			expect(result).toBe(5);
		});
	});

	describe('findHeadingByText', () => {
		/*
		 * Given: Lines with heading matching level and text
		 * When: Searching for heading
		 * Then: Returns index of matching heading
		 */
		it('should find heading by exact match', () => {
			const lines = ['# Title', '## Log Items', 'content'];
			const result = MarkdownUtils.findHeadingByText(lines, '##', 'Log Items');
			expect(result).toBe(1);
		});

		/*
		 * Given: Lines with heading in different case
		 * When: Searching for heading
		 * Then: Returns index of heading (case-insensitive match)
		 */
		it('should find heading case-insensitively', () => {
			const lines = ['## log items'];
			const result = MarkdownUtils.findHeadingByText(lines, '##', 'Log Items');
			expect(result).toBe(0);
		});

		/*
		 * Given: Lines with heading with trailing punctuation
		 * When: Searching for heading without punctuation
		 * Then: Returns index of heading (punctuation trimmed)
		 */
		it('should find heading with punctuation trimmed', () => {
			const lines = ['## Activity Log:'];
			const result = MarkdownUtils.findHeadingByText(lines, '##', 'Activity Log');
			expect(result).toBe(0);
		});

		/*
		 * Given: Lines with multiple headings of same level
		 * When: Searching for heading
		 * Then: Returns index of first matching heading
		 */
		it('should return first match when multiple headings match', () => {
			const lines = ['## Notes', '## Notes', '## Notes'];
			const result = MarkdownUtils.findHeadingByText(lines, '##', 'Notes');
			expect(result).toBe(0);
		});

		/*
		 * Given: Lines without matching heading
		 * When: Searching for heading
		 * Then: Returns -1
		 */
		it('should return -1 when heading not found', () => {
			const lines = ['## Other Section', 'content'];
			const result = MarkdownUtils.findHeadingByText(lines, '##', 'Log Items');
			expect(result).toBe(-1);
		});

		/*
		 * Given: Lines with heading of different level
		 * When: Searching for heading
		 * Then: Returns -1 (level must match)
		 */
		it('should not match headings of different levels', () => {
			const lines = ['### Log Items'];
			const result = MarkdownUtils.findHeadingByText(lines, '##', 'Log Items');
			expect(result).toBe(-1);
		});
	});

	describe('findHeading', () => {
		/*
		 * Given: Lines with multiple headings of same level
		 * When: Searching for first heading
		 * Then: Returns index of first heading
		 */
		it('should find first heading of specified level', () => {
			const lines = ['# Title', '## First', 'text', '## Second'];
			const result = MarkdownUtils.findHeading(lines, '##', false);
			expect(result).toBe(1);
		});

		/*
		 * Given: Lines with multiple headings of same level
		 * When: Searching for last heading
		 * Then: Returns index of last heading
		 */
		it('should find last heading of specified level', () => {
			const lines = ['# Title', '## First', 'text', '## Second'];
			const result = MarkdownUtils.findHeading(lines, '##', true);
			expect(result).toBe(3);
		});

		/*
		 * Given: Lines without matching heading level
		 * When: Searching for heading
		 * Then: Returns -1
		 */
		it('should return -1 when no heading of level found', () => {
			const lines = ['# Title', '### Subheading'];
			const result = MarkdownUtils.findHeading(lines, '##', false);
			expect(result).toBe(-1);
		});
	});

	describe('findSectionEnd', () => {
		/*
		 * Given: A section followed by another heading
		 * When: Finding section end
		 * Then: Returns line before next heading
		 */
		it('should find line before next heading', () => {
			const lines = ['## Section', 'content', 'more content', '## Next Section'];
			const result = MarkdownUtils.findSectionEnd(lines, 0);
			expect(result).toBe(2); // Line before "## Next Section"
		});

		/*
		 * Given: A section at end of file
		 * When: Finding section end
		 * Then: Returns last line index
		 */
		it('should return last line when no next heading exists', () => {
			const lines = ['## Section', 'content', 'more content'];
			const result = MarkdownUtils.findSectionEnd(lines, 0);
			expect(result).toBe(2);
		});

		/*
		 * Given: A section followed immediately by another heading
		 * When: Finding section end
		 * Then: Returns heading line (section has no content)
		 */
		it('should handle section with no content', () => {
			const lines = ['## Section', '## Next Section'];
			const result = MarkdownUtils.findSectionEnd(lines, 0);
			expect(result).toBe(0);
		});
	});

	describe('findSectionInsertPoint', () => {
		/*
		 * Given: A section with content
		 * When: Finding insert point at start of section
		 * Then: Returns position after heading, skipping blank lines
		 */
		it('should find start position after heading, skipping blank lines', () => {
			const lines = ['## Heading', '', '', 'content'];
			const result = MarkdownUtils.findSectionInsertPoint(lines, 0, 'start');
			expect(result).toBe(3); // Before "content"
		});

		/*
		 * Given: A section with content
		 * When: Finding insert point at end of section
		 * Then: Returns position after last non-empty line
		 */
		it('should find end position after last non-empty line', () => {
			const lines = ['## Heading', 'content', 'more content', '## Next'];
			const result = MarkdownUtils.findSectionInsertPoint(lines, 0, 'end');
			expect(result).toBe(3); // After "more content"
		});

		/*
		 * Given: A section with trailing blank lines
		 * When: Finding insert point at end
		 * Then: Returns position after last non-blank content
		 */
		it('should ignore trailing blank lines when finding end', () => {
			const lines = ['## Heading', 'content', '', '', '## Next'];
			const result = MarkdownUtils.findSectionInsertPoint(lines, 0, 'end');
			expect(result).toBe(2); // After "content"
		});

		/*
		 * Given: An empty section (only heading)
		 * When: Finding insert point at start
		 * Then: Returns position right after heading
		 */
		it('should handle empty section when finding start', () => {
			const lines = ['## Heading', '## Next'];
			const result = MarkdownUtils.findSectionInsertPoint(lines, 0, 'start');
			expect(result).toBe(1);
		});
	});

	describe('findFileInsertPoint', () => {
		/*
		 * Given: A file with frontmatter
		 * When: Finding insert point at start
		 * Then: Returns position after frontmatter
		 */
		it('should skip frontmatter when finding start position', () => {
			const lines = ['---', 'title: Test', '---', '', 'content'];
			const result = MarkdownUtils.findFileInsertPoint(lines, 'start');
			expect(result).toBe(4); // After frontmatter and blank line
		});

		/*
		 * Given: A file without frontmatter
		 * When: Finding insert point at start
		 * Then: Returns position at first non-blank content
		 */
		it('should find first content line when no frontmatter', () => {
			const lines = ['', '', 'content'];
			const result = MarkdownUtils.findFileInsertPoint(lines, 'start');
			expect(result).toBe(2);
		});

		/*
		 * Given: A file with content
		 * When: Finding insert point at end
		 * Then: Returns position after last non-empty line
		 */
		it('should find position after last non-empty line for end', () => {
			const lines = ['content', 'more content', '', ''];
			const result = MarkdownUtils.findFileInsertPoint(lines, 'end');
			expect(result).toBe(2); // After "more content"
		});

		/*
		 * Given: An empty file
		 * When: Finding insert point
		 * Then: Returns 0
		 */
		it('should return 0 for empty file', () => {
			const lines: string[] = [];
			const result = MarkdownUtils.findFileInsertPoint(lines, 'start');
			expect(result).toBe(0);
		});

		/*
		 * Given: A file with only blank lines
		 * When: Finding insert point at end
		 * Then: Returns 0 (no content found)
		 */
		it('should return 0 for file with only blank lines', () => {
			const lines = ['', '', ''];
			const result = MarkdownUtils.findFileInsertPoint(lines, 'end');
			expect(result).toBe(0);
		});
	});
});
