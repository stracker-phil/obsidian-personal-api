import { App } from 'obsidian';

export interface PluginInstance<T> {
	instance: T | null;
	error?: string;
}

export interface PluginStatus {
	isActive: boolean;
	name: string;
	inst?: any;
	error?: string;
}

/**
 * Utilities for accessing Obsidian plugins
 */
export class PluginUtils {
	/**
	 * Safely access another plugin installed in Obsidian
	 * @param app The Obsidian App instance
	 * @param pluginId The ID of the plugin to access
	 * @returns Object containing either the plugin instance or an error
	 */
	static getPlugin<T>(app: App, pluginId: string): PluginInstance<T> {
		try {
			const plugins = (app as any).plugins.plugins;
			const instance = plugins[pluginId] as T;

			if (!instance) {
				return {
					instance: null,
					error: `Plugin '${pluginId}' not found`,
				};
			}

			return { instance };
		} catch (error) {
			return {
				instance: null,
				error: `Error accessing plugin '${pluginId}': ${error}`,
			};
		}
	}

	/**
	 * Check if a plugin is active
	 * @param app The Obsidian App instance
	 * @param pluginId The ID of the plugin to check
	 * @returns Status of the plugin including if it's active
	 */
	static isPluginActive(app: App, pluginId: string): PluginStatus {
		try {
			// Check if it's an internal plugin
			if ((app as any).internalPlugins?.plugins[pluginId]?.enabled) {
				return {
					isActive: true,
					inst: (app as any).internalPlugins?.plugins[pluginId],
					name: pluginId,
				};
			}

			// Check if it's a community plugin
			const plugins = (app as any).plugins?.plugins;
			if (plugins && plugins[pluginId]) {
				return {
					isActive: true,
					inst: plugins[pluginId],
					name: plugins[pluginId].manifest?.name || pluginId,
				};
			}

			return {
				isActive: false,
				name: pluginId,
				error: 'Plugin not found or not enabled',
			};
		} catch (error) {
			return {
				isActive: false,
				name: pluginId,
				error: `Error checking plugin status: ${error}`,
			};
		}
	}
}
