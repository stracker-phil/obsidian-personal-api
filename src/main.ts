import { Plugin } from 'obsidian';
import { RestApiService } from './services/restApi.service';
import { LoggingService } from './services/logging.service';
import { DailyNoteService } from './services/dailyNote.service';
import { CacheService } from './services/cache.service';
import { SettingsService } from './services/settings.service';
import { PersonalRestApiSettingTab } from './ui/settings-tab';
import { EndpointFactory } from './endpoints/endpoint';
import { LogEntryModal } from './ui/LogEntryModal';

export default class PersonalRestApiPlugin extends Plugin {
    private restApiService!: RestApiService;
    private loggingService!: LoggingService;
    private settingsService!: SettingsService;
    
    async onload() {
        console.log('Loading Personal REST API plugin');
        
        // Initialize services
        this.settingsService = new SettingsService(this);
        await this.settingsService.loadSettings();
        
        const settings = this.settingsService.getSettings();
        
        const dailyNoteService = new DailyNoteService(this.app);
        const cacheService = new CacheService(settings.cacheKey);
        
        this.loggingService = new LoggingService(
            this.app, 
            dailyNoteService, 
            cacheService,
            {
                format: settings.logEntryFormat,
                sectionSelection: settings.sectionSelection,
                sectionPosition: settings.sectionPosition,
                sectionHeadingLevel: settings.sectionHeadingLevel
            }
        );
        
        this.restApiService = new RestApiService(this.app);
        
        // Initialize REST API
        if (this.restApiService.initialize()) {
            // Register all endpoint handlers
            const endpoints = EndpointFactory.createEndpoints(this.loggingService);
            
            for (const endpoint of endpoints) {
                this.restApiService.registerRoute(
                    endpoint.getMethod(),
                    endpoint.getPath(),
                    endpoint.handleRequest.bind(endpoint)
                );
            }
        }
        
        // Add the log command with modal prompt
        this.addCommand({
            id: 'add-log-entry',
            name: 'Add log entry',
            callback: () => {
                new LogEntryModal(this.app, (logEntry) => {
                    this.loggingService.addLogEntry(logEntry);
                }).open();
            }
        });
        
        // Add settings tab
        this.addSettingTab(new PersonalRestApiSettingTab(
            this.app, 
            this, 
            this.settingsService, 
            this.loggingService
        ));
    }
    
    onunload() {
        console.log('Unloading Personal REST API plugin');
        this.restApiService.cleanup();
    }
}
