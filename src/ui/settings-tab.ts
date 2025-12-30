import { App, PluginSettingTab, Setting } from 'obsidian';
import PersonalRestApiPlugin from '../main';
import { SettingsService } from '../services/settings.service';
import { LoggingService } from '../services/logging.service';
import { PluginUtils } from '../utils/plugin.utils';
import { FallbackReference, SectionPosition } from '../models/settings.model';

export class PersonalRestApiSettingTab extends PluginSettingTab {
	private settingsService: SettingsService;
	private loggingService: LoggingService;

	constructor(
		app: App,
		plugin: PersonalRestApiPlugin,
		settingsService: SettingsService,
		loggingService: LoggingService,
	) {
		super(app, plugin);
		this.settingsService = settingsService;
		this.loggingService = loggingService;
	}

	display(): void {
		const { containerEl } = this;
		const settings = this.settingsService.getSettings();

		containerEl.empty();

		containerEl.createEl('h1', { text: 'Personal REST API Settings' });

		// Plugin dependency status
		const restApiStatus = PluginUtils.isPluginActive(this.app, 'obsidian-local-rest-api');
		const dailyNotesStatus = PluginUtils.isPluginActive(this.app, 'daily-notes');

		const statusEl = containerEl.createEl('div', { cls: 'plugin-status' });

		statusEl.createEl('div', {
			text: `${restApiStatus.isActive ? '✅' : '❌'} Local REST API plugin is ${restApiStatus.isActive ? 'active' : 'not active'}`,
			cls: restApiStatus.isActive ? 'status-ok' : 'status-error',
		});

		statusEl.createEl('div', {
			text: `${dailyNotesStatus.isActive ? '✅' : '❌'} Daily Notes plugin is ${dailyNotesStatus.isActive ? 'active' : 'not active'}`,
			cls: dailyNotesStatus.isActive ? 'status-ok' : 'status-error',
		});

		if (!restApiStatus.isActive || !dailyNotesStatus.isActive) {
			const warningEl = statusEl.createEl('div', {
				text: 'Warning: The log endpoint requires both plugins to be active.',
				cls: 'status-warning',
			});
			warningEl.style.marginTop = '10px';
			warningEl.style.fontWeight = 'bold';
		}

		statusEl.style.backgroundColor = 'var(--setting-items-background)';
		statusEl.style.padding = '10px';
		statusEl.style.borderRadius = '5px';
		statusEl.style.marginBottom = '20px';
		statusEl.style.marginTop = '10px';

		containerEl.createEl('h2', { text: 'Log Entry Formats' });

		// Add format variables documentation
		const formatDocsEl = containerEl.createEl('div', { cls: 'format-variables-docs' });
		formatDocsEl.createEl('p', {
			text: 'Available variables for log entry formats:',
			cls: 'format-docs-title',
		});

		const variablesList = formatDocsEl.createEl('ul', { cls: 'format-variables-list' });
		variablesList.createEl('li', {
			text: '{entry} - The actual log entry text (required)',
		});
		variablesList.createEl('li', {
			text: '{currentTime} - Current time in 24-hour format (HH:MM)',
		});
		variablesList.createEl('li', {
			text: '{lastEntryTime} - Time of the last log entry in 24-hour format (HH:MM)',
		});

		formatDocsEl.style.backgroundColor = '#f5f5f5';
		formatDocsEl.style.padding = '10px';
		formatDocsEl.style.borderRadius = '5px';
		formatDocsEl.style.marginBottom = '15px';

		new Setting(containerEl)
			.setName('API Entry Format')
			.setDesc('Format for log entries coming from the REST API.')
			.addText(text => text
				.setValue(settings.logEntryFormat)
				.onChange(async (value) => {
					await this.settingsService.updateSettings({ logEntryFormat: value });
					this.loggingService.updateOptions({ format: value });
				}));

		new Setting(containerEl)
			.setName('Manual Entry Format')
			.setDesc('Format for log entries added manually via Obsidian.')
			.addText(text => text
				.setValue(settings.manualLogEntryFormat)
				.onChange(async (value) => {
					await this.settingsService.updateSettings({ manualLogEntryFormat: value });
					this.loggingService.setManualEntryFormat(value);
				}));

		containerEl.createEl('h2', { text: 'Log Entry Placement' });

		// Explanation
		const explanationEl = containerEl.createEl('div', { cls: 'setting-item-description' });
		explanationEl.style.marginBottom = '15px';
		explanationEl.style.color = 'var(--text-muted)';
		explanationEl.createEl('p', {
			text: 'Log entries are inserted by searching for a specific heading. If the heading is found, entries are added at the end of that section. If not found, the heading is created at the fallback location.',
		});

		// Heading level selector
		new Setting(containerEl)
			.setName('Heading Level')
			.setDesc('The heading level to search for (e.g., ##, ###)')
			.addDropdown(dropdown => dropdown
				.addOption('#', 'Level 1 (#)')
				.addOption('##', 'Level 2 (##)')
				.addOption('###', 'Level 3 (###)')
				.addOption('####', 'Level 4 (####)')
				.setValue(settings.sectionHeadingLevel)
				.onChange(async (value) => {
					await this.settingsService.updateSettings({ sectionHeadingLevel: value });
					this.loggingService.updateOptions({ sectionHeadingLevel: value });
				}));

		// Heading text input
		new Setting(containerEl)
			.setName('Heading Text')
			.setDesc('The text of the heading to find (case-insensitive, punctuation is trimmed)')
			.addText(text => text
				.setPlaceholder('e.g., Log Items')
				.setValue(settings.sectionHeadingText)
				.onChange(async (value) => {
					await this.settingsService.updateSettings({ sectionHeadingText: value });
					this.loggingService.updateOptions({ sectionHeadingText: value });
				}));

		// Fallback reference
		new Setting(containerEl)
			.setName('Fallback Reference')
			.setDesc('Where to create the heading if it doesn\'t exist')
			.addDropdown(dropdown => dropdown
				.addOption('first-heading', 'First heading of level')
				.addOption('last-heading', 'Last heading of level')
				.addOption('file', 'File boundary (start or end)')
				.setValue(settings.fallbackReference)
				.onChange(async (value: FallbackReference) => {
					await this.settingsService.updateSettings({ fallbackReference: value });
					this.loggingService.updateOptions({ fallbackReference: value });
				}));

		// Fallback position
		new Setting(containerEl)
			.setName('Fallback Position')
			.setDesc('Whether to insert before or after the fallback reference')
			.addDropdown(dropdown => dropdown
				.addOption('before', 'Before')
				.addOption('after', 'After')
				.setValue(settings.fallbackPosition)
				.onChange(async (value: SectionPosition) => {
					await this.settingsService.updateSettings({ fallbackPosition: value });
					this.loggingService.updateOptions({ fallbackPosition: value });
				}));
	}
}
