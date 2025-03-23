import { App, TFile, moment } from 'obsidian';
import { getAllDailyNotes, getDailyNote } from 'obsidian-daily-notes-interface';
import { DailyNoteOperationResult } from '../models/types';
import { FileUtils } from '../utils/file.utils';

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
				message: `Failed to write to file: ${error}`,
			};
		}
	}
}
