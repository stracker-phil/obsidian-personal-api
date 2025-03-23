import { App } from 'obsidian';
import { getLocalRestApiPlugin } from './utils';

let API: any = null;
let activeRoutes: Map<string, Function> = new Map();
let hasMiddleware = false;
let logEntryCallback: ((log: string) => Promise<void>) | null = null;

export function initializeApiExtension(app: App, logCallback: (log: string) => Promise<void>) {
    // Store the callback function for handling log entries
    logEntryCallback = logCallback;
    
    try {
        // Get the Local REST API plugin using our utility function
        const localRestApi = getLocalRestApiPlugin(app);
        
        if (!localRestApi) {
            return; // Error already logged in the utility function
        }
        
        API = localRestApi.apiExtensionRouter;
        
        addMiddleware();
        addRoute('GET', '/log', onGetLog);
        
        console.log('Successfully initialized REST API extension');
    } catch (error) {
        console.error('Error initializing REST API extension:', error);
    }
}

export function removeApiExtension() {
    if (!API) return;

    removeRoute('GET', '/log');
    hasMiddleware = false;
    activeRoutes.clear();
    logEntryCallback = null;
}

function addMiddleware() {
    if (hasMiddleware || !API) return;

    API.use((req: any, res: any, next: Function) => {
        const pathWithoutQuery = req.path.split('?')[0];
        const normalizedPath = normalizePath(pathWithoutQuery);
        const key = `${req.method}:${normalizedPath}`;

        if (activeRoutes.has(key)) {
            const handler = activeRoutes.get(key);
            handler!(req, res, next);
        } else {
            next();
        }
    });

    hasMiddleware = true;
}

function addRoute(method: string, path: string, handler: Function) {
    const normalizedPath = normalizePath(path);
    const key = `${method.toUpperCase()}:${normalizedPath}`;
    activeRoutes.set(key, handler);
}

function removeRoute(method: string, path: string) {
    const normalizedPath = normalizePath(path);
    const key = `${method.toUpperCase()}:${normalizedPath}`;
    activeRoutes.delete(key);
}

function normalizePath(path: string): string {
    return path === '/' ? path : path.replace(/\/$/, '');
}

async function onGetLog(req: any, res: any, next: Function) {
    if (!req.query.log || !logEntryCallback) {
        res.send('No Log or Logger Unavailable');
        return;
    }

    try {
        await logEntryCallback(req.query.log);
        res.send('OK');
    } catch (error) {
        console.error('Error logging entry:', error);
        res.status(500).send('Error logging entry');
    }
}
