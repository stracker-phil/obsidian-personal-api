/**
 * Service for caching log entries until they can be written to a daily note
 */
export class CacheService {
    private cacheKey: string;
    private lastEntryTimeKey: string;
    
    /**
     * Create a new CacheService
     * @param cacheKey The key to use for localStorage
     */
    constructor(cacheKey: string = 'journalLogCache') {
        this.cacheKey = cacheKey;
        this.lastEntryTimeKey = `${cacheKey}_lastEntryTime`;
    }
    
    /**
     * Get cached entries
     * @returns Cached entries or null if none exist
     */
    getEntries(): string | null {
        return localStorage.getItem(this.cacheKey);
    }
    
    /**
     * Add an entry to the cache
     * @param entry The entry to cache
     */
    addEntry(entry: string): void {
        const cache = this.getEntries();
        
        if (cache) {
            localStorage.setItem(this.cacheKey, `${cache}\n${entry}`);
        } else {
            localStorage.setItem(this.cacheKey, entry);
        }
    }
    
    /**
     * Clear all cached entries
     */
    clearEntries(): void {
        localStorage.removeItem(this.cacheKey);
    }

    /**
     * Check if there are any cached entries
     * @returns True if cache has entries, false otherwise
     */
    hasEntries(): boolean {
        const cache = this.getEntries();
        return cache !== null && cache.trim() !== '';
    }
    
    /**
     * Update the last entry time to current time
     */
    updateLastEntryTime(): void {
        localStorage.setItem(this.lastEntryTimeKey, new Date().toISOString());
    }
    
    /**
     * Get the last entry time
     * @returns Date object of the last entry time or null if no entries have been made
     */
    getLastEntryTime(): Date | null {
        const lastEntryTime = localStorage.getItem(this.lastEntryTimeKey);
        return lastEntryTime ? new Date(lastEntryTime) : null;
    }
}
