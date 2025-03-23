const CACHE_KEY = 'journalLogCache';

export function getCachedEntries(): string | null {
    return localStorage.getItem(CACHE_KEY);
}

export function addEntryToCache(entry: string): void {
    const cache = getCachedEntries();
    
    if (cache) {
        localStorage.setItem(CACHE_KEY, `${cache}\n${entry}`);
    } else {
        localStorage.setItem(CACHE_KEY, entry);
    }
}

export function flushCache(): void {
    localStorage.removeItem(CACHE_KEY);
}
