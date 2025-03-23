import { App, TFile, moment } from 'obsidian';
import { getAllDailyNotes, getDailyNote } from 'obsidian-daily-notes-interface';
import { DailyNoteOperationResult, FileOperationResult } from '../models/types';
import { FileUtils } from '../utils/file.utils';
import { MarkdownUtils } from '../utils/markdown.utils';
import { SectionPosition } from '../models/settings.model';

/**
 * Service for interacting with daily notes
 */
export class DailyNoteService {
    private app: App;
    
    /**
     * Create a new DailyNoteService
     * @param app The Obsidian App instance
     */
    constructor(app: App) {
        this.app = app;
    }
    
    /**
     * Get the current daily note file
     * @returns The current daily note or null if it doesn't exist
     */
    getCurrentDailyNote(): TFile | null {
        const today = moment();
        const dailyNotes = getAllDailyNotes();
        return getDailyNote(today, dailyNotes) || null;
    }
    
    /**
     * Read content from a file as lines
     * @param file The file to read
     * @returns Array of lines from the file
     */
    async readFile(file: TFile): Promise<string[]> {
        return FileUtils.readFileAsLines(this.app, file);
    }
    
    /**
     * Write lines to a file
     * @param file The file to write to
     * @param lines The lines to write
     * @returns Result of the operation
     */
    async writeFile(file: TFile, lines: string[]): Promise<DailyNoteOperationResult> {
        try {
            await FileUtils.writeLinesToFile(this.app, file, lines);
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                message: `Failed to write to file: ${error}` 
            };
        }
    }
    
    /**
     * Find the position to insert content under a specific header
     * @param lines The lines of the file
     * @param headerLevel The header level to search for
     * @param position Whether to find the first or last occurrence
     * @returns The line index to insert content
     */
    findInsertPosition(
        lines: string[], 
        headerLevel: string, 
        position: 'first' | 'last' = 'last'
    ): number {
        // Convert old parameters to new format
        const sectionSelection = position === 'first' ? 'first-heading' : 'last-heading';
        const sectionPosition: SectionPosition = 'end'; // Default to end of section
        
        return MarkdownUtils.findInsertionPoint(
            lines, 
            sectionSelection, 
            sectionPosition, 
            headerLevel
        );
    }

    /**
     * Insert content at a specific position in a file
     * @param file The file to modify
     * @param content The content to insert
     * @param position The position to insert at (line number)
     * @returns Result of the operation
     */
    async insertContent(
        file: TFile,
        content: string,
        position: number
    ): Promise<FileOperationResult> {
        try {
            const lines = await this.readFile(file);
            lines.splice(position, 0, content);
            await this.writeFile(file, lines);
            
            return {
                success: true,
                file
            };
        } catch (error) {
            return {
                success: false,
                message: `Failed to insert content: ${error}`
            };
        }
    }
}
