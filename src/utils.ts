import { App, TFile } from 'obsidian';

// ----------------------
// File Utilities
// ----------------------

// Properly renamed to reflect its purpose
export function findLineByHeader(lines: string[], level: string, position: 'first' | 'last' = 'first', offset: number = 0): number {
    let count = 0;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (!line.startsWith(`${level} `)) {
            continue;
        }
        
        if (count === offset) {
            if (position === 'first') {
                return i + 1;
            }
            
            for (let j = i + 1; j < lines.length; j++) {
                if (lines[j].startsWith('#')) {
                    return j;
                }
            }
            
            return lines.length - 1;
        }
        count++;
    }
    
    return lines.length - 1;
}

export async function getFileAsLines(app: App, file: TFile): Promise<string[]> {
    const content = await app.vault.read(file);
    return content.split("\n");
}

export async function setFileFromLines(app: App, file: TFile, lines: string[]): Promise<void> {
    await app.vault.modify(file, lines.join("\n"));
}

// ----------------------
// Plugin Access Utilities
// ----------------------

/**
 * Interface for the Local REST API plugin structure
 */
interface LocalRestApiPlugin {
    requestHandler?: {
        apiExtensionRouter?: any;
    };
}

/**
 * Safely access another plugin installed in Obsidian
 * 
 * @param app The Obsidian App instance
 * @param pluginId The ID of the plugin to access
 * @returns The plugin instance or null if not found
 */
export function getPlugin<T>(app: App, pluginId: string): T | null {
    try {
        // Access the plugins container using any cast to bypass TypeScript restrictions
        const plugins = (app as any).plugins.plugins;
        return plugins[pluginId] as T || null;
    } catch (error) {
        console.error(`Error accessing plugin '${pluginId}':`, error);
        return null;
    }
}

/**
 * Specifically get the Local REST API plugin
 * 
 * @param app The Obsidian App instance
 * @returns The Local REST API plugin or null if not found or not correctly initialized
 */
export function getLocalRestApiPlugin(app: App): { apiExtensionRouter: any } | null {
    const plugin = getPlugin<LocalRestApiPlugin>(app, 'obsidian-local-rest-api');
    
    if (!plugin || !plugin.requestHandler || !plugin.requestHandler.apiExtensionRouter) {
        console.error('Local REST API plugin not found or incorrectly initialized');
        return null;
    }
    
    return {
        apiExtensionRouter: plugin.requestHandler.apiExtensionRouter
    };
}
