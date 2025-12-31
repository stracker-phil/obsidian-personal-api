import { App } from 'obsidian';

export interface PluginInstance<T> {
	instance: T | null;
	enabled?: boolean;
	error?: string;
}

/**
 * Utilities for accessing other Obsidian plugins.
 */
export class PluginUtils {
	static getPlugin<T>(app: App, pluginId: string): PluginInstance<T> {
		try {
			const internalPlugin = (app as any).internalPlugins?.plugins[pluginId];
			const customPlugin = (app as any).plugins.plugins[pluginId];

			if (internalPlugin) {
				return {
					instance: internalPlugin.instance as T,
					enabled: internalPlugin.enabled,
				};
			}

			if (customPlugin) {
				return {
					instance: customPlugin as T,
					enabled: true,
				};
			}

			return {
				instance: null,
				error: `Plugin '${pluginId}' not found`,
			};
		} catch (error) {
			return {
				instance: null,
				error: `Error accessing plugin '${pluginId}': ${error}`,
			};
		}
	}

	static isPluginActive(app: App, pluginId: string): boolean {
		const plugin = PluginUtils.getPlugin<any>(app, pluginId);

		if (plugin.instance) {
			return plugin.enabled ?? false;
		}

		return false;
	}
}
