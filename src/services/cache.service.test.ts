import { CacheService } from './cache.service';

describe('CacheService', () => {
	let cacheService: CacheService;
	let mockLocalStorage: { [key: string]: string };

	beforeEach(() => {
		// Mock localStorage
		mockLocalStorage = {};
		global.localStorage = {
			getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
			setItem: jest.fn((key: string, value: string) => {
				mockLocalStorage[key] = value;
			}),
			removeItem: jest.fn((key: string) => {
				delete mockLocalStorage[key];
			}),
			clear: jest.fn(() => {
				mockLocalStorage = {};
			}),
			length: 0,
			key: jest.fn(),
		} as Storage;

		cacheService = new CacheService('testCache');
	});

	describe('getEntries', () => {
		/*
		 * Given: No cached entries in localStorage
		 * When: Getting entries
		 * Then: Returns null
		 */
		it('should return null when no entries exist', () => {
			const result = cacheService.getEntries();
			expect(result).toBeNull();
		});

		/*
		 * Given: Cached entries exist in localStorage
		 * When: Getting entries
		 * Then: Returns the cached string
		 */
		it('should return cached entries when they exist', () => {
			mockLocalStorage['testCache'] = 'entry1\nentry2';
			const result = cacheService.getEntries();
			expect(result).toBe('entry1\nentry2');
		});
	});

	describe('addEntry', () => {
		/*
		 * Given: No existing cached entries
		 * When: Adding first entry
		 * Then: Stores entry directly without newline prefix
		 */
		it('should add first entry without newline prefix', () => {
			cacheService.addEntry('First entry');
			expect(mockLocalStorage['testCache']).toBe('First entry');
		});

		/*
		 * Given: Existing cached entries
		 * When: Adding subsequent entry
		 * Then: Appends entry with newline separator
		 */
		it('should append subsequent entries with newline separator', () => {
			mockLocalStorage['testCache'] = 'First entry';
			cacheService.addEntry('Second entry');
			expect(mockLocalStorage['testCache']).toBe('First entry\nSecond entry');
		});

		/*
		 * Given: Multiple cached entries
		 * When: Adding another entry
		 * Then: Maintains all entries with proper newline separation
		 */
		it('should maintain multiple entries with proper separation', () => {
			mockLocalStorage['testCache'] = 'First\nSecond';
			cacheService.addEntry('Third');
			expect(mockLocalStorage['testCache']).toBe('First\nSecond\nThird');
		});
	});

	describe('clearEntries', () => {
		/*
		 * Given: Cached entries exist
		 * When: Clearing entries
		 * Then: Entries are removed and no longer retrievable
		 */
		it('should remove entries from cache', () => {
			mockLocalStorage['testCache'] = 'Some entries';
			expect(cacheService.getEntries()).toBe('Some entries');

			cacheService.clearEntries();

			expect(cacheService.getEntries()).toBeNull();
			expect(cacheService.hasEntries()).toBe(false);
		});
	});

	describe('hasEntries', () => {
		/*
		 * Given: No cached entries (null)
		 * When: Checking if entries exist
		 * Then: Returns false
		 */
		it('should return false when cache is null', () => {
			expect(cacheService.hasEntries()).toBe(false);
		});

		/*
		 * Given: Empty string in cache
		 * When: Checking if entries exist
		 * Then: Returns false
		 */
		it('should return false when cache is empty string', () => {
			mockLocalStorage['testCache'] = '';
			expect(cacheService.hasEntries()).toBe(false);
		});

		/*
		 * Given: Only whitespace in cache
		 * When: Checking if entries exist
		 * Then: Returns false
		 */
		it('should return false when cache contains only whitespace', () => {
			mockLocalStorage['testCache'] = '   \n\t  ';
			expect(cacheService.hasEntries()).toBe(false);
		});

		/*
		 * Given: Valid entries in cache
		 * When: Checking if entries exist
		 * Then: Returns true
		 */
		it('should return true when cache has valid entries', () => {
			mockLocalStorage['testCache'] = 'Entry';
			expect(cacheService.hasEntries()).toBe(true);
		});
	});

	describe('updateLastEntryTime', () => {
		/*
		 * Given: Current system time
		 * When: Updating last entry time
		 * Then: Stores current time as ISO string in localStorage
		 */
		it('should store current time as ISO string', () => {
			const beforeTime = new Date();
			cacheService.updateLastEntryTime();
			const afterTime = new Date();

			const storedTime = new Date(mockLocalStorage['testCache_lastEntryTime']);
			expect(storedTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
			expect(storedTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
		});

		/*
		 * Given: Previous last entry time exists
		 * When: Updating last entry time
		 * Then: Overwrites with new time
		 */
		it('should overwrite previous time with new time', () => {
			const oldTime = new Date('2024-01-01T10:00:00');
			mockLocalStorage['testCache_lastEntryTime'] = oldTime.toISOString();

			cacheService.updateLastEntryTime();

			const newTime = new Date(mockLocalStorage['testCache_lastEntryTime']);
			expect(newTime.getTime()).toBeGreaterThan(oldTime.getTime());
		});
	});

	describe('getLastEntryTime', () => {
		/*
		 * Given: No last entry time stored
		 * When: Getting last entry time
		 * Then: Returns null
		 */
		it('should return null when no time is stored', () => {
			expect(cacheService.getLastEntryTime()).toBeNull();
		});

		/*
		 * Given: Valid ISO timestamp stored
		 * When: Getting last entry time
		 * Then: Returns Date object with correct time
		 */
		it('should return Date object when time exists', () => {
			const testTime = new Date('2024-01-01T14:30:00');
			mockLocalStorage['testCache_lastEntryTime'] = testTime.toISOString();

			const result = cacheService.getLastEntryTime();
			expect(result).toBeInstanceOf(Date);
			expect(result?.toISOString()).toBe(testTime.toISOString());
		});

		/*
		 * Given: Multiple updates to last entry time
		 * When: Getting last entry time
		 * Then: Returns most recent time
		 */
		it('should return most recent time after multiple updates', () => {
			const time1 = new Date('2024-01-01T10:00:00');
			mockLocalStorage['testCache_lastEntryTime'] = time1.toISOString();

			const time2 = new Date('2024-01-01T15:00:00');
			mockLocalStorage['testCache_lastEntryTime'] = time2.toISOString();

			const result = cacheService.getLastEntryTime();
			expect(result?.toISOString()).toBe(time2.toISOString());
		});
	});

	describe('Custom cache key', () => {
		/*
		 * Given: Custom cache key provided in constructor
		 * When: Performing cache operations
		 * Then: Uses custom key for all localStorage operations
		 */
		it('should use custom cache key for entries', () => {
			const customCache = new CacheService('myCustomKey');
			customCache.addEntry('Test');
			expect(mockLocalStorage['myCustomKey']).toBe('Test');
		});

		/*
		 * Given: Custom cache key provided
		 * When: Performing last entry time operations
		 * Then: Uses custom key with suffix for time storage
		 */
		it('should use custom cache key for last entry time', () => {
			const customCache = new CacheService('myCustomKey');
			customCache.updateLastEntryTime();
			expect(mockLocalStorage['myCustomKey_lastEntryTime']).toBeDefined();
		});

		/*
		 * Given: Default cache key (no parameter)
		 * When: Creating CacheService
		 * Then: Uses default 'journalLogCache' key
		 */
		it('should use default key when none provided', () => {
			const defaultCache = new CacheService();
			defaultCache.addEntry('Test');
			expect(mockLocalStorage['journalLogCache']).toBe('Test');
		});
	});

	describe('Integration scenarios', () => {
		/*
		 * Given: Multiple entries added over time
		 * When: Checking entries and clearing
		 * Then: Maintains proper state through lifecycle
		 */
		it('should handle full cache lifecycle', () => {
			// Initially empty
			expect(cacheService.hasEntries()).toBe(false);

			// Add entries
			cacheService.addEntry('Entry 1');
			expect(cacheService.hasEntries()).toBe(true);
			expect(cacheService.getEntries()).toBe('Entry 1');

			cacheService.addEntry('Entry 2');
			expect(cacheService.getEntries()).toBe('Entry 1\nEntry 2');

			// Clear
			cacheService.clearEntries();
			expect(cacheService.hasEntries()).toBe(false);
			expect(cacheService.getEntries()).toBeNull();
		});

		/*
		 * Given: Last entry time tracking
		 * When: Adding multiple entries with time updates
		 * Then: Maintains accurate last entry time
		 */
		it('should maintain last entry time across multiple entries', () => {
			// First entry
			cacheService.updateLastEntryTime();
			const firstTime = cacheService.getLastEntryTime();
			expect(firstTime).not.toBeNull();

			// Wait a bit (simulated by direct time manipulation)
			const secondTime = new Date(Date.now() + 1000);
			mockLocalStorage['testCache_lastEntryTime'] = secondTime.toISOString();

			const retrievedTime = cacheService.getLastEntryTime();
			expect(retrievedTime?.getTime()).toBe(secondTime.getTime());
		});
	});
});
