import { App, PluginSettingTab, Setting } from 'obsidian';
import PersonalRestApiPlugin from '../main';
import { SettingsService } from '../services/settings.service';
import { LoggingService } from '../services/logging.service';
import { PluginUtils } from '../utils/plugin.utils';
import { SectionPosition, SectionSelection } from '../models/settings.model';

export class PersonalRestApiSettingTab extends PluginSettingTab {
	private plugin: PersonalRestApiPlugin;
	private settingsService: SettingsService;
	private loggingService: LoggingService;
	private headingLevelSetting: Setting | null = null;

	constructor(
		app: App,
		plugin: PersonalRestApiPlugin,
		settingsService: SettingsService,
		loggingService: LoggingService,
	) {
		super(app, plugin);
		this.plugin = plugin;
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

		statusEl.style.backgroundColor = '#f5f5f5';
		statusEl.style.padding = '10px';
		statusEl.style.borderRadius = '5px';
		statusEl.style.marginBottom = '20px';
		statusEl.style.marginTop = '10px';

		containerEl.createEl('h2', { text: 'Log Entry Formats' });
        
        // Add format variables documentation
        const formatDocsEl = containerEl.createEl('div', { cls: 'format-variables-docs' });
        formatDocsEl.createEl('p', { 
            text: 'Available variables for log entry formats:',
            cls: 'format-docs-title'
        });
        
        const variablesList = formatDocsEl.createEl('ul', { cls: 'format-variables-list' });
        variablesList.createEl('li', { 
            text: '{entry} - The actual log entry text (required)'
        });
        variablesList.createEl('li', { 
            text: '{currentTime} - Current time in 24-hour format (HH:MM)'
        });
        variablesList.createEl('li', { 
            text: '{lastEntryTime} - Time of the last log entry in 24-hour format (HH:MM)'
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

		// Section selection dropdown
		new Setting(containerEl)
			.setName('Section Selection')
			.setDesc('Which section to insert the log entry into')
			.addDropdown(dropdown => dropdown
				.addOption('first-heading', 'First heading of level')
				.addOption('last-heading', 'Last heading of level')
				.addOption('file', 'Whole file')
				.setValue(settings.sectionSelection)
				.onChange(async (value: SectionSelection) => {
					await this.settingsService.updateSettings({ sectionSelection: value });
					this.loggingService.updateOptions({ sectionSelection: value });

					// Dynamically show/hide heading level setting
					this.updateHeadingLevelVisibility(value);
				}));

		// Create heading level setting
		this.headingLevelSetting = new Setting(containerEl)
			.setName('Heading Level')
			.setDesc('Which heading level to use for section identification')
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

		// Position within section dropdown
		new Setting(containerEl)
			.setName('Position within Section')
			.setDesc('Where to insert the log entry within the selected section')
			.addDropdown(dropdown => dropdown
				.addOption('start', 'Start of section')
				.addOption('end', 'End of section')
				.setValue(settings.sectionPosition)
				.onChange(async (value: SectionPosition) => {
					await this.settingsService.updateSettings({ sectionPosition: value });
					this.loggingService.updateOptions({ sectionPosition: value });
				}));

		// Set initial visibility
		this.updateHeadingLevelVisibility(settings.sectionSelection);
	}

	/**
	 * Update the visibility of the heading level setting based on section selection
	 * @param sectionSelection The current section selection
	 */
	private updateHeadingLevelVisibility(sectionSelection: SectionSelection): void {
		const container = this.headingLevelSetting?.settingEl;

		if (!container) return;

		if (sectionSelection === 'file') {
			container.style.display = 'none';
		} else {
			container.style.display = '';
		}
	}
}
