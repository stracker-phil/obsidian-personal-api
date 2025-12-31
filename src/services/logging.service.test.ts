import { LoggingService } from './logging.service';
import { DailyNoteService } from './dailyNote.service';
import { CacheService } from './cache.service';
import { LogEntrySource } from '../models/types';
import { TFile } from 'obsidian';

// Mock dependencies
jest.mock('./dailyNote.service');
jest.mock('./cache.service');
jest.mock('../utils/markdown.utils');

// Import after mocking
import { MarkdownUtils } from '../utils/markdown.utils';

describe('LoggingService', () => {
	let loggingService: LoggingService;
	let mockApp: any;
	let mockDailyNoteService: jest.Mocked<DailyNoteService>;
	let mockCacheService: jest.Mocked<CacheService>;
	let mockDailyNote: TFile;

	beforeEach(() => {
		// Reset mocks
		jest.clearAllMocks();

		// Mock App
		mockApp = {};

		// Mock DailyNoteService
		mockDailyNoteService = {
			getCurrentDailyNote: jest.fn(),
			readFile: jest.fn(),
			writeFile: jest.fn(),
		} as any;

		// Mock CacheService
		mockCacheService = {
			getEntries: jest.fn(),
			addEntry: jest.fn(),
			clearEntries: jest.fn(),
			hasEntries: jest.fn(),
			updateLastEntryTime: jest.fn(),
			getLastEntryTime: jest.fn(),
		} as any;

		// Mock TFile
		mockDailyNote = { path: 'daily/2024-01-01.md' } as TFile;

		// Mock MarkdownUtils static methods
		(MarkdownUtils.formatLogEntry as jest.Mock) = jest.fn(
			(entry, template) => `formatted: ${entry}`,
		);
		(MarkdownUtils.findInsertionPoint as jest.Mock) = jest.fn(() => 2);

		// Create service with default options
		loggingService = new LoggingService(
			mockApp,
			mockDailyNoteService,
			mockCacheService,
			{
				format: '- [x] {entry}',
				sectionHeadingLevel: '##',
				sectionHeadingText: 'Log Items',
				headingInsertPosition: 'last-section',
			},
		);
	});

	describe('addLogEntry - Daily note exists', () => {
		beforeEach(() => {
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(mockDailyNote);
			mockDailyNoteService.readFile.mockResolvedValue(['## Log Items', '- old entry']);
			mockDailyNoteService.writeFile.mockResolvedValue({ success: true });
			mockCacheService.getEntries.mockReturnValue(null);
			mockCacheService.getLastEntryTime.mockReturnValue(null);
		});

		/*
		 * Given: Daily note exists with target heading
		 * When: Adding log entry
		 * Then: Formats entry, finds insertion point, inserts, and clears cache
		 */
		it('should add entry to daily note when it exists', async () => {
			const result = await loggingService.addLogEntry('Test entry');

			expect(mockCacheService.updateLastEntryTime).toHaveBeenCalled();
			expect(MarkdownUtils.formatLogEntry).toHaveBeenCalledWith(
				'Test entry',
				'- [x] {entry}',
				null,
			);
			expect(mockDailyNoteService.readFile).toHaveBeenCalledWith(mockDailyNote);
			expect(MarkdownUtils.findInsertionPoint).toHaveBeenCalled();
			expect(mockDailyNoteService.writeFile).toHaveBeenCalled();

			// Verify the entry was inserted at position 2
			const writeCall = mockDailyNoteService.writeFile.mock.calls[0];
			const modifiedLines = writeCall[1];
			expect(modifiedLines[2]).toBe('formatted: Test entry');

			expect(mockCacheService.clearEntries).toHaveBeenCalled();
			expect(result).toEqual({ success: true });
		});

		/*
		 * Given: Daily note exists and cache has entries
		 * When: Adding new entry
		 * Then: Combines cached entries with new entry before insertion
		 */
		it('should combine cached entries with new entry', async () => {
			mockCacheService.getEntries.mockReturnValue('cached1\ncached2');

			const result = await loggingService.addLogEntry('New entry');

			const writeCall = mockDailyNoteService.writeFile.mock.calls[0];
			const modifiedLines = writeCall[1];
			expect(modifiedLines[2]).toBe('cached1\ncached2\nformatted: New entry');
			expect(result.success).toBe(true);
		});

		/*
		 * Given: Daily note exists and last entry time is available
		 * When: Adding entry
		 * Then: Passes last entry time to format function
		 */
		it('should use last entry time when formatting', async () => {
			const lastTime = new Date('2024-01-01T14:00:00');
			mockCacheService.getLastEntryTime.mockReturnValue(lastTime);

			await loggingService.addLogEntry('Test');

			expect(MarkdownUtils.formatLogEntry).toHaveBeenCalledWith(
				'Test',
				'- [x] {entry}',
				lastTime,
			);
		});

		/*
		 * Given: Daily note exists
		 * When: Adding manual entry (source: MANUAL)
		 * Then: Uses manual entry format instead of API format
		 */
		it('should use manual format for manual entries', async () => {
			loggingService.setManualEntryFormat('* {currentTime} {entry}');

			await loggingService.addLogEntry('Manual entry', {
				source: LogEntrySource.MANUAL,
			});

			expect(MarkdownUtils.formatLogEntry).toHaveBeenCalledWith(
				'Manual entry',
				'* {currentTime} {entry}',
				null,
			);
		});

		/*
		 * Given: Daily note exists
		 * When: Adding API entry (source: API or default)
		 * Then: Uses API format
		 */
		it('should use API format for API entries', async () => {
			await loggingService.addLogEntry('API entry', {
				source: LogEntrySource.API,
			});

			expect(MarkdownUtils.formatLogEntry).toHaveBeenCalledWith(
				'API entry',
				'- [x] {entry}',
				null,
			);
		});

		/*
		 * Given: Daily note exists
		 * When: Adding entry with custom options
		 * Then: Merges custom options with defaults
		 */
		it('should merge custom options with defaults', async () => {
			await loggingService.addLogEntry('Test', {
				sectionHeadingText: 'Custom Section',
				headingInsertPosition: 'first-section',
			});

			expect(MarkdownUtils.findInsertionPoint).toHaveBeenCalledWith(
				expect.any(Array),
				'##', // default
				'Custom Section', // overridden
				'first-section', // overridden
			);
		});

		/*
		 * Given: Daily note exists
		 * When: Entry is successfully written
		 * Then: Clears cache
		 */
		it('should clear cache after successful write', async () => {
			mockDailyNoteService.writeFile.mockResolvedValue({ success: true });

			await loggingService.addLogEntry('Test');

			expect(mockCacheService.clearEntries).toHaveBeenCalled();
		});

		/*
		 * Given: Daily note exists but write fails
		 * When: Adding entry
		 * Then: Does not clear cache
		 */
		it('should not clear cache when write fails', async () => {
			mockDailyNoteService.writeFile.mockResolvedValue({
				success: false,
				message: 'Write failed',
			});

			await loggingService.addLogEntry('Test');

			expect(mockCacheService.clearEntries).not.toHaveBeenCalled();
		});
	});

	describe('addLogEntry - No daily note', () => {
		beforeEach(() => {
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(null);
			mockCacheService.getLastEntryTime.mockReturnValue(null);
		});

		/*
		 * Given: No daily note exists
		 * When: Adding entry
		 * Then: Caches the formatted entry and returns cached result
		 */
		it('should cache entry when no daily note exists', async () => {
			const result = await loggingService.addLogEntry('Test entry');

			expect(mockCacheService.updateLastEntryTime).toHaveBeenCalled();
			expect(MarkdownUtils.formatLogEntry).toHaveBeenCalledWith(
				'Test entry',
				'- [x] {entry}',
				null,
			);
			expect(mockCacheService.addEntry).toHaveBeenCalledWith('formatted: Test entry');
			expect(result).toEqual({
				success: true,
				cached: true,
				message: 'Entry cached for later processing',
			});
		});

		/*
		 * Given: No daily note exists
		 * When: Adding entry
		 * Then: Does not attempt file operations
		 */
		it('should not perform file operations when no daily note', async () => {
			await loggingService.addLogEntry('Test');

			expect(mockDailyNoteService.readFile).not.toHaveBeenCalled();
			expect(mockDailyNoteService.writeFile).not.toHaveBeenCalled();
			expect(MarkdownUtils.findInsertionPoint).not.toHaveBeenCalled();
		});

		/*
		 * Given: No daily note exists
		 * When: Adding multiple entries
		 * Then: Caches all entries separately
		 */
		it('should cache multiple entries when no daily note exists', async () => {
			await loggingService.addLogEntry('Entry 1');
			await loggingService.addLogEntry('Entry 2');
			await loggingService.addLogEntry('Entry 3');

			expect(mockCacheService.addEntry).toHaveBeenCalledTimes(3);
			expect(mockCacheService.addEntry).toHaveBeenNthCalledWith(1, 'formatted: Entry 1');
			expect(mockCacheService.addEntry).toHaveBeenNthCalledWith(2, 'formatted: Entry 2');
			expect(mockCacheService.addEntry).toHaveBeenNthCalledWith(3, 'formatted: Entry 3');
		});
	});

	describe('addLogEntry - Error handling', () => {
		beforeEach(() => {
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(mockDailyNote);
			mockCacheService.getEntries.mockReturnValue(null);
			mockCacheService.getLastEntryTime.mockReturnValue(null);
		});

		/*
		 * Given: Daily note exists but readFile throws error
		 * When: Adding entry
		 * Then: Returns error result without crashing
		 */
		it('should handle readFile errors gracefully', async () => {
			mockDailyNoteService.readFile.mockRejectedValue(new Error('Read failed'));

			const result = await loggingService.addLogEntry('Test');

			expect(result).toEqual({
				success: false,
				message: 'Failed to add log entry: Error: Read failed',
			});
		});

		/*
		 * Given: Daily note exists but writeFile throws error
		 * When: Adding entry
		 * Then: Returns error result
		 */
		it('should handle writeFile errors gracefully', async () => {
			mockDailyNoteService.readFile.mockResolvedValue(['## Log Items']);
			mockDailyNoteService.writeFile.mockRejectedValue(new Error('Write failed'));

			const result = await loggingService.addLogEntry('Test');

			expect(result).toEqual({
				success: false,
				message: 'Failed to add log entry: Error: Write failed',
			});
		});

		/*
		 * Given: Daily note exists but write returns error result
		 * When: Adding entry
		 * Then: Returns the error result from writeFile
		 */
		it('should propagate writeFile error results', async () => {
			mockDailyNoteService.readFile.mockResolvedValue(['## Log Items']);
			mockDailyNoteService.writeFile.mockResolvedValue({
				success: false,
				message: 'Permission denied',
			});

			const result = await loggingService.addLogEntry('Test');

			expect(result).toEqual({
				success: false,
				message: 'Permission denied',
			});
		});
	});

	describe('setManualEntryFormat', () => {
		/*
		 * Given: Default manual entry format
		 * When: Setting custom manual format
		 * Then: Uses new format for manual entries
		 */
		it('should update manual entry format', async () => {
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(mockDailyNote);
			mockDailyNoteService.readFile.mockResolvedValue(['## Log Items']);
			mockDailyNoteService.writeFile.mockResolvedValue({ success: true });
			mockCacheService.getEntries.mockReturnValue(null);
			mockCacheService.getLastEntryTime.mockReturnValue(null);

			loggingService.setManualEntryFormat('+ {entry} at {currentTime}');

			await loggingService.addLogEntry('Manual', { source: LogEntrySource.MANUAL });

			expect(MarkdownUtils.formatLogEntry).toHaveBeenCalledWith(
				'Manual',
				'+ {entry} at {currentTime}',
				null,
			);
		});

		/*
		 * Given: Updated manual format
		 * When: Adding API entry
		 * Then: Does not affect API format
		 */
		it('should not affect API entry format', async () => {
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(mockDailyNote);
			mockDailyNoteService.readFile.mockResolvedValue(['## Log Items']);
			mockDailyNoteService.writeFile.mockResolvedValue({ success: true });
			mockCacheService.getEntries.mockReturnValue(null);
			mockCacheService.getLastEntryTime.mockReturnValue(null);

			loggingService.setManualEntryFormat('+ {entry}');

			await loggingService.addLogEntry('API entry', { source: LogEntrySource.API });

			expect(MarkdownUtils.formatLogEntry).toHaveBeenCalledWith(
				'API entry',
				'- [x] {entry}',
				null,
			);
		});
	});

	describe('updateOptions', () => {
		/*
		 * Given: Default options
		 * When: Updating specific options
		 * Then: Merges with existing options
		 */
		it('should merge new options with existing', async () => {
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(mockDailyNote);
			mockDailyNoteService.readFile.mockResolvedValue(['## Log Items']);
			mockDailyNoteService.writeFile.mockResolvedValue({ success: true });
			mockCacheService.getEntries.mockReturnValue(null);
			mockCacheService.getLastEntryTime.mockReturnValue(null);

			loggingService.updateOptions({
				sectionHeadingText: 'Updated Section',
				headingInsertPosition: 'first-section',
			});

			await loggingService.addLogEntry('Test');

			expect(MarkdownUtils.findInsertionPoint).toHaveBeenCalledWith(
				expect.any(Array),
				'##', // unchanged
				'Updated Section', // updated
				'first-section', // updated
			);
		});

		/*
		 * Given: Default options
		 * When: Updating format option
		 * Then: Uses new format for subsequent entries
		 */
		it('should update format for subsequent entries', async () => {
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(mockDailyNote);
			mockDailyNoteService.readFile.mockResolvedValue(['## Log Items']);
			mockDailyNoteService.writeFile.mockResolvedValue({ success: true });
			mockCacheService.getEntries.mockReturnValue(null);
			mockCacheService.getLastEntryTime.mockReturnValue(null);

			loggingService.updateOptions({ format: '* {entry}' });

			await loggingService.addLogEntry('Test');

			expect(MarkdownUtils.formatLogEntry).toHaveBeenCalledWith('Test', '* {entry}', null);
		});
	});

	describe('Integration scenarios', () => {
		/*
		 * Given: Multiple cached entries and daily note becomes available
		 * When: Adding new entry
		 * Then: Flushes all cached entries with new entry
		 */
		it('should flush cached entries when daily note becomes available', async () => {
			// First, cache some entries (no daily note)
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(null);
			await loggingService.addLogEntry('Cached 1');
			await loggingService.addLogEntry('Cached 2');

			// Now daily note exists
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(mockDailyNote);
			mockDailyNoteService.readFile.mockResolvedValue(['## Log Items']);
			mockDailyNoteService.writeFile.mockResolvedValue({ success: true });
			mockCacheService.getEntries.mockReturnValue(
				'formatted: Cached 1\nformatted: Cached 2',
			);
			mockCacheService.getLastEntryTime.mockReturnValue(null);

			await loggingService.addLogEntry('New entry');

			const writeCall = mockDailyNoteService.writeFile.mock.calls[0];
			const modifiedLines = writeCall[1];
			// Array has 1 element, splice at index 2 appends to end, so entry is at index 1
			expect(modifiedLines[1]).toBe(
				'formatted: Cached 1\nformatted: Cached 2\nformatted: New entry',
			);
			expect(mockCacheService.clearEntries).toHaveBeenCalled();
		});

		/*
		 * Given: API and manual entries mixed
		 * When: Adding entries with different sources
		 * Then: Applies correct format to each entry type
		 */
		it('should handle mixed API and manual entries with correct formats', async () => {
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(mockDailyNote);
			mockDailyNoteService.readFile.mockResolvedValue(['## Log Items']);
			mockDailyNoteService.writeFile.mockResolvedValue({ success: true });
			mockCacheService.getEntries.mockReturnValue(null);

			// First call returns null, second call returns a Date
			const testDate = new Date('2024-01-01T14:00:00');
			mockCacheService.getLastEntryTime
				.mockReturnValueOnce(null)
				.mockReturnValueOnce(testDate);

			loggingService.setManualEntryFormat('+ Manual: {entry}');

			// API entry
			await loggingService.addLogEntry('API task', { source: LogEntrySource.API });
			expect(MarkdownUtils.formatLogEntry).toHaveBeenLastCalledWith(
				'API task',
				'- [x] {entry}',
				null,
			);

			// Manual entry
			await loggingService.addLogEntry('Manual task', { source: LogEntrySource.MANUAL });
			expect(MarkdownUtils.formatLogEntry).toHaveBeenLastCalledWith(
				'Manual task',
				'+ Manual: {entry}',
				testDate,
			);
		});

		/*
		 * Given: Last entry time tracked across operations
		 * When: Adding multiple entries over time
		 * Then: Updates last entry time for each operation
		 */
		it('should update last entry time for each entry', async () => {
			mockDailyNoteService.getCurrentDailyNote.mockReturnValue(mockDailyNote);
			mockDailyNoteService.readFile.mockResolvedValue(['## Log Items']);
			mockDailyNoteService.writeFile.mockResolvedValue({ success: true });
			mockCacheService.getEntries.mockReturnValue(null);
			mockCacheService.getLastEntryTime.mockReturnValue(null);

			await loggingService.addLogEntry('Entry 1');
			await loggingService.addLogEntry('Entry 2');
			await loggingService.addLogEntry('Entry 3');

			expect(mockCacheService.updateLastEntryTime).toHaveBeenCalledTimes(3);
		});
	});
});
