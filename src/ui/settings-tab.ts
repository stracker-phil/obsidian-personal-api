import { App, PluginSettingTab, Setting } from 'obsidian';
import PersonalRestApiPlugin from '../main';
import { SettingsService } from '../services/settings.service';
import { LoggingService } from '../services/logging.service';
import { PluginUtils } from '../utils/plugin.utils';

export class PersonalRestApiSettingTab extends PluginSettingTab {
    private plugin: PersonalRestApiPlugin;
    private settingsService: SettingsService;
    private loggingService: LoggingService;

    constructor(
        app: App, 
        plugin: PersonalRestApiPlugin,
        settingsService: SettingsService,
        loggingService: LoggingService
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
            cls: restApiStatus.isActive ? 'status-ok' : 'status-error'
        });
        
        statusEl.createEl('div', { 
            text: `${dailyNotesStatus.isActive ? '✅' : '❌'} Daily Notes plugin is ${dailyNotesStatus.isActive ? 'active' : 'not active'}`,
            cls: dailyNotesStatus.isActive ? 'status-ok' : 'status-error'
        });

        if (!restApiStatus.isActive || !dailyNotesStatus.isActive) {
            const warningEl = statusEl.createEl('div', { 
                text: 'Warning: The log endpoint requires both plugins to be active.',
                cls: 'status-warning'
            });
            warningEl.style.marginTop = '10px';
            warningEl.style.fontWeight = 'bold';
        }

        statusEl.style.backgroundColor = '#f5f5f5';
        statusEl.style.padding = '10px';
        statusEl.style.borderRadius = '5px';
        statusEl.style.marginBottom = '20px';
        statusEl.style.marginTop = '10px';

        containerEl.createEl('h2', { text: 'Log Entry Settings' });

        new Setting(containerEl)
            .setName('Log Entry Format')
            .setDesc('Format for log entries. Use {entry} as a placeholder for the actual content.')
            .addText(text => text
                .setValue(settings.logEntryFormat)
                .onChange(async (value) => {
                    await this.settingsService.updateSettings({ logEntryFormat: value });
                    this.loggingService.updateOptions({ format: value });
                }));

        new Setting(containerEl)
            .setName('Header Level')
            .setDesc('The level of header to insert logs after (e.g., ##)')
            .addText(text => text
                .setValue(settings.headerLevel)
                .onChange(async (value) => {
                    await this.settingsService.updateSettings({ headerLevel: value });
                    this.loggingService.updateOptions({ headerLevel: value });
                }));

        new Setting(containerEl)
            .setName('Insert Location')
            .setDesc('Where to insert log entries in the daily note')
            .addDropdown(dropdown => dropdown
                .addOption('last-heading', 'After last heading')
                .addOption('file-start', 'Start of file')
                .addOption('file-end', 'End of file')
                .setValue(settings.insertLocation)
                .onChange(async (value: 'last-heading' | 'file-start' | 'file-end') => {
                    await this.settingsService.updateSettings({ insertLocation: value });
                    this.loggingService.updateOptions({ location: value });
                }));
    }
}
