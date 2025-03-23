import { Plugin } from 'obsidian';
import { initializeApiExtension, removeApiExtension } from './restApi';
import { initializeJournal, addLogEntry } from './journal';

export default class PersonalRestApiPlugin extends Plugin {
	async onload() {
		console.log('Loading Personal REST API plugin');

		// Initialize modules with app instance
		initializeJournal(this.app);
		initializeApiExtension(this.app, addLogEntry);

		// Add the log command
		this.addCommand({
			id: 'add-log-entry',
			name: 'Add log entry',
			callback: () => addLogEntry('Test log entry')
		});
	}

	onunload() {
		console.log('Unloading Personal REST API plugin');
		removeApiExtension();
	}
}
