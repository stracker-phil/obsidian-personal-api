# Personal REST API

An Obsidian plugin that extends the [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) plugin to expose additional endpoints for personal workflows. The plugin focuses on adding a custom endpoint for logging entries to your daily notes.

This plugin is tailored to specific personal needs rather than being a general-purpose community plugin.

## Features

- Adds a `/log` endpoint to the Local REST API
- Automatically adds log entries to your daily notes
- Caches log entries if no daily note exists yet
- Customizable log entry format and placement
- Provides an Obsidian command to manually add log entries

## Requirements

- [Obsidian](https://obsidian.md/) v0.12.0 or higher
- [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) plugin installed and enabled
- [Daily Notes](https://help.obsidian.md/Plugins/Daily+notes) plugin enabled

## Setup

1. Ensure the Local REST API plugin is installed and active
2. Ensure the Daily Notes plugin is active
3. Install the plugin and activate it
4. Reload Obsidian if necessary

## API Endpoints

### `GET /log`

URL params:
- `log` - The URL-encoded text that should be appended to the daily note. Can include newlines and markdown.

Example:
```
GET https://localhost:27124/log?log=Your+log+entry+here
```

Make sure to include your API key as specified in the Local REST API plugin settings.

## Usage with Keyboard Maestro

You can set up a Keyboard Maestro macro that uses a bash command to send data to the endpoint:

```sh
curl -H "Authorization: Bearer $KMVAR_Instance_Token" "https://127.0.0.1:27124/log/?log=$KMVAR_Instance_Entry"
```

![Keyboard Maestro Integration](usage-keyboard-maestro-action.png)

## Settings

The plugin provides several customization options:

- **Log Entry Format**: Format for log entries. Use `{entry}` as a placeholder for the actual content.
- **Header Level**: The level of header to insert logs after (e.g., `##`).
- **Insert Location**: Where to insert log entries in the daily note (after last heading, start of file, or end of file).

## Architecture

The plugin follows a modular, service-based architecture:

- **Services**: Core functional components with clear responsibilities
  - `RestApiService`: Manages API routes and request handling
  - `LoggingService`: Handles log entry creation and storage
  - `DailyNoteService`: Manages interactions with daily notes
  - `CacheService`: Provides persistent storage for logs
  - `SettingsService`: Manages plugin settings

- **Endpoints**: Modular API endpoint handlers
  - `LogEndpointHandler`: Handles the /log endpoint
  - `EndpointFactory`: Creates and manages all endpoint handlers

- **Utilities**: Helper functions organized by domain
  - `PluginUtils`: Utilities for accessing other plugins
  - `FileUtils`: Utilities for file operations
  - `MarkdownUtils`: Utilities for markdown-specific operations

- **Models**: Data structures and type definitions

- **UI**: User interface components for settings
