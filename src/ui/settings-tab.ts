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

		const endpointLog = new SettingGroup(containerEl);

		endpointLog.setHeading('Log Endpoint');
		endpointLog.addSetting((setting) =>
			setting.setName('Adds a new log-entry to the current daily note')
		);
		endpointLog.addSetting((setting) => {
			const port = restApiStatus?.inst?.settings?.port || 27124;
			const desc = new DocumentFragment();
			const infos = desc.createEl('ul');

			addInfoItem(infos, 'Method', 'GET');
			addInfoItem(infos, 'Endpoint', '/log');
			addInfoItem(infos, 'Param', 'log', 'required');
			addInfoItem(infos, 'Sample', '', `GET https://localhost:${port}/log?log=Your+log+entry+here`);

			setting.setName('REST API details:').setDesc(desc);
		});
		endpointLog.addSetting((setting) => {
			const desc = new DocumentFragment();
			const infos = desc.createEl('ul');

			addInfoItem(infos, 'Command', 'Add log entry');

			setting.setName('Command palette details:').setDesc(desc);
		});

		const groupFormat = new SettingGroup(containerEl);
		groupFormat.setHeading('Log: Format');

		groupFormat.addSetting((setting) => {
			const desc = new DocumentFragment();
			const variables = desc.createEl('ul');
			addCodeItem(variables, '{entry}', 'The actual log entry text (required)');
			addCodeItem(variables, '{currentTime}', 'Current time in 24-hour format (HH:MM)');
			addCodeItem(variables, '{lastEntryTime}', 'Time of the last log entry in 24-hour format (HH:MM)');

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

		groupPlacement.setHeading('Log: Placement');

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

function addInfoItem(list: HTMLElement, label: string, value: string, description: string = '') {
	const item = list.createEl('li');
	item.createEl('span', { text: label });
	item.createEl('span', { text: ': ' });

	if (value) {
		item.createEl('strong', { text: value });

		if (description) {
			item.createEl('span', { text: ' - ' });
		}
	}

	if (description) {
		item.createEl('span', { text: description });
	}
}

function addCodeItem(list: HTMLElement, label: string, description: string) {
	const item = list.createEl('li');
	item.createEl('code', { text: label });
	item.createEl('span', { text: ' - ' });
	item.createEl('span', { text: description });
}
