import { App, TFile } from 'obsidian';

/**
 * Utilities for file operations in Obsidian
 */
export class FileUtils {
	/**
	 * Read file content and split into lines
	 * @param app The Obsidian App instance
	 * @param file The file to read
	 * @returns Array of lines from the file
	 */
	static async readFileAsLines(app: App, file: TFile): Promise<string[]> {
		const content = await app.vault.read(file);

		return content.split('\n');
	}

	/**
	 * Write lines to a file
	 * @param app The Obsidian App instance
	 * @param file The file to write to
	 * @param lines The lines to write
	 */
	static async writeLinesToFile(app: App, file: TFile, lines: string[]): Promise<void> {
		await app.vault.modify(file, lines.join('\n'));
	}
}
