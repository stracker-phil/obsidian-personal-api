import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, PluginSettings } from '../models/settings.model';

/**
 * Service for managing plugin settings
 */
export class SettingsService {
    private plugin: Plugin;
    private settings: PluginSettings;
    
    /**
     * Create a new SettingsService
     * @param plugin The plugin instance
     */
    constructor(plugin: Plugin) {
        this.plugin = plugin;
        this.settings = DEFAULT_SETTINGS;
    }
    
    /**
     * Load settings from storage
     */
    async loadSettings(): Promise<void> {
        const loadedSettings = await this.plugin.loadData();
        this.settings = {
            ...DEFAULT_SETTINGS,
            ...loadedSettings
        };
    }
    
    /**
     * Save settings to storage
     */
    async saveSettings(): Promise<void> {
        await this.plugin.saveData(this.settings);
    }
    
    /**
     * Get the current settings
     * @returns The current settings
     */
    getSettings(): PluginSettings {
        return this.settings;
    }
    
    /**
     * Update settings
     * @param settings New settings to apply
     */
    async updateSettings(settings: Partial<PluginSettings>): Promise<void> {
        this.settings = {
            ...this.settings,
            ...settings
        };
        await this.saveSettings();
    }
}
