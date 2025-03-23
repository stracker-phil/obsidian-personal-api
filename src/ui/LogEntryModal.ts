import { App, Modal, Setting } from 'obsidian';

export class LogEntryModal extends Modal {
	private logEntry: string = '';
	private onSubmit: (logEntry: string) => void;
	private textComponent: any;

	constructor(app: App, onSubmit: (logEntry: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		this.setTitle('Add Log Entry');

		contentEl.classList.add('personal-api-log');

		// Add description
		contentEl.createEl('p', {
			text: 'Enter the text you want to log to your daily note.',
		});

		// Add text input
		new Setting(contentEl)
			.setName('Log Entry')
			.addText((text) => {
				this.textComponent = text;
				text.setPlaceholder('What do you want to log?')
					.onChange((value) => {
						this.logEntry = value;
					});

				// Get the input element and add keydown event listener
				const inputEl = text.inputEl;
				inputEl.addEventListener('keydown', (event: KeyboardEvent) => {
					if (event.key === 'Enter') {
						this.submitForm();
						event.preventDefault();
					}
				});

				// Set focus on the input element when the modal opens
				setTimeout(() => {
					inputEl.focus();
				}, 10);
			});

		// Add buttons
		const buttonContainer = contentEl.createDiv();
		buttonContainer.addClass('modal-button-container');

		// Cancel button
		new Setting(buttonContainer)
			.addButton((btn) =>
				btn
					.setButtonText('Cancel')
					.onClick(() => {
						this.close();
					}),
			);

		// Submit button
		new Setting(buttonContainer)
			.addButton((btn) =>
				btn
					.setButtonText('Add Entry')
					.setCta()
					.onClick(() => {
						this.submitForm();
					}),
			);
	}

	// Extract form submission logic to a separate method
	submitForm() {
		const entry = this.logEntry?.trim();

		this.close();
		if (!entry) {
			return;
		}
		
		this.onSubmit(entry);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
