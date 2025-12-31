import { App, PluginSettingTab, SettingGroup } from 'obsidian';
import PersonalRestApiPlugin from '../main';
import { FallbackReference, SectionPosition } from '../models/settings.model';
import { LoggingService } from '../services/logging.service';
import { SettingsService } from '../services/settings.service';
import { PluginUtils } from '../utils/plugin.utils';

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

		const statusEl = containerEl.createEl('div', { cls: 'plugin-status-container' });

		statusEl.createEl('div', {
			text: `${restApiStatus.isActive ? '✅' : '❌'} Local REST API plugin is ${restApiStatus.isActive ? 'active' : 'not active'}`,
			cls: restApiStatus.isActive ? 'status-ok' : 'status-error',
		});

		statusEl.createEl('div', {
			text: `${dailyNotesStatus.isActive ? '✅' : '❌'} Daily Notes plugin is ${dailyNotesStatus.isActive ? 'active' : 'not active'}`,
			cls: dailyNotesStatus.isActive ? 'status-ok' : 'status-error',
		});

		if (!restApiStatus.isActive || !dailyNotesStatus.isActive) {
			statusEl.createEl('div', {
				text: 'Warning: The log endpoint requires both plugins to be active.',
				cls: 'status-warning',
			});
		}

		const groupFormat = new SettingGroup(containerEl);

		groupFormat.setHeading('Log Entry Format');

		groupFormat.addSetting((setting) => {
			const desc = new DocumentFragment();
			const variablesList = desc.createEl('ul');
			variablesList.createEl('li', {
				text: '{entry} - The actual log entry text (required)',
			});
			variablesList.createEl('li', {
				text: '{currentTime} - Current time in 24-hour format (HH:MM)',
			});
			variablesList.createEl('li', {
				text: '{lastEntryTime} - Time of the last log entry in 24-hour format (HH:MM)',
			});

			setting.setName('Available variables for log entry formats:')
				.setDesc(desc);
		});


		groupFormat.addSetting((setting) =>
			setting.setName('API Entry Format')
				.setDesc('Format for log entries coming from the REST API.')
				.addText(text => text
					.setValue(settings.logEntryFormat)
					.onChange(async (value) => {
						await this.settingsService.updateSettings({ logEntryFormat: value });
						this.loggingService.updateOptions({ format: value });
					})),
		);

		groupFormat.addSetting((setting) =>
			setting.setName('Manual Entry Format')
				.setDesc('Format for log entries added manually via Obsidian.')
				.addText(text => text
					.setValue(settings.manualLogEntryFormat)
					.onChange(async (value) => {
						await this.settingsService.updateSettings({ manualLogEntryFormat: value });
						this.loggingService.setManualEntryFormat(value);
					})),
		);

		// Heading level selector

		const groupPlacement = new SettingGroup(containerEl);

		groupPlacement.setHeading('Log Entry Placement');

		groupPlacement.addSetting((setting) => {
			const options = {
				'#': 'Level 1 (#)',
				'##': 'Level 2 (##)',
				'###': 'Level 3 (###)',
				'####': 'Level 4 (####)',
			};

			setting.setName('Heading Level')
				.setDesc('The heading level to search for (e.g., ##, ###)')
				.addDropdown(dropdown => dropdown
					.addOptions(options)
					.setValue(settings.sectionHeadingLevel)
					.onChange(async (value) => {
						await this.settingsService.updateSettings({ sectionHeadingLevel: value });
						this.loggingService.updateOptions({ sectionHeadingLevel: value });
						this.display();
					}));
		});

		// Heading text input
		groupPlacement.addSetting((setting) =>
			setting.setName('Heading Text')
				.setDesc('The text of the heading to find (case-insensitive, punctuation is trimmed)')
				.addText(text => text
					.setPlaceholder('e.g., Log Items')
					.setValue(settings.sectionHeadingText)
					.onChange(async (value) => {
						await this.settingsService.updateSettings({ sectionHeadingText: value });
						this.loggingService.updateOptions({ sectionHeadingText: value });
					})),
		);

		// Fallback reference
		groupPlacement.addSetting((setting) => {
			const options = {
				'first-heading': `First ${settings.sectionHeadingLevel} heading`,
				'last-heading': `Last ${settings.sectionHeadingLevel} heading`,
				'file': 'File boundary (start or end)',
			};

			setting.setName('Insert Header Reference')
				.setDesc('Where to create the heading if it doesn\'t exist')
				.addDropdown(dropdown => dropdown
					.addOptions(options)
					.setValue(settings.fallbackReference)
					.onChange(async (value: FallbackReference) => {
						await this.settingsService.updateSettings({ fallbackReference: value });
						this.loggingService.updateOptions({ fallbackReference: value });
						this.display();
					}));
		});

		// Fallback position
		groupPlacement.addSetting((setting) => {
			const options = {
				before: 'Before heading',
				after: 'After heading',
			};

			if (settings.fallbackReference === 'file') {
				options.before = 'Start of the file';
				options.after = 'End of the file';
			}

			setting.setName('Insert Header Position')
				.setDesc('Whether to insert before or after the above reference line')
				.addDropdown(dropdown => dropdown
					.addOptions(options)
					.setValue(settings.fallbackPosition)
					.onChange(async (value: SectionPosition) => {
						await this.settingsService.updateSettings({ fallbackPosition: value });
						this.loggingService.updateOptions({ fallbackPosition: value });
					}));
		});
	}
}
