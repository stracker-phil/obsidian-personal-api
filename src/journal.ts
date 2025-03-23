import { App, TFile, moment } from 'obsidian';
import { getAllDailyNotes, getDailyNote } from "obsidian-daily-notes-interface";
import { getCachedEntries, addEntryToCache, flushCache } from './cache';
import { findLineByHeader, getFileAsLines, setFileFromLines } from './utils';

// Add a reference to the app instance
let appInstance: App;

export function initializeJournal(app: App) {
    appInstance = app;
}

export async function addLogEntry(entry: string) {
    if (!appInstance) {
        console.error("Journal module not initialized");
        return;
    }
    
    const journal = getCurrentDailyNote();
    entry = `- [x] ${entry}`;
    
    if (!journal) {
        addEntryToCache(entry);
        return;
    }
    
    const cached = getCachedEntries();
    if (cached) {
        entry = `${cached}\n${entry}`;
    }
    
    const lines = await getFileAsLines(appInstance, journal);
    
    const insertLine = findLineByHeader(lines, '##', 'last');
    lines.splice(insertLine, 0, entry);
    
    await setFileFromLines(appInstance, journal, lines);
    flushCache();
}

function getCurrentDailyNote(): TFile | null {
    const today = moment();
    const dailyNotes = getAllDailyNotes();
    return getDailyNote(today, dailyNotes) || null;
}
