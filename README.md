# Personal REST API

An Obsidian plugin that extends the [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) plugin to expose additional endpoints for personal workflows. The plugin focuses on adding a custom endpoint for logging entries to your daily notes.

This plugin is tailored to specific personal needs rather than being a general-purpose community plugin.

## Features

- Adds a `/log` endpoint to the Local REST API
- Automatically adds log entries to your daily notes
- Caches log entries if no daily note exists yet
- Customizable log entry format and placement
- Different formats for API-based and manual log entries
- Smart placeholder variables for timestamps
- Provides an Obsidian command with a user-friendly modal for adding log entries manually
- Respects the structure of Markdown documents, preserving blank lines after headers

## Requirements

- [Obsidian](https://obsidian.md/) v0.12.0 or higher
- [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) plugin installed and enabled
- [Daily Notes](https://help.obsidian.md/Plugins/Daily+notes) plugin enabled

## Setup

1. Ensure the Local REST API plugin is installed and active
2. Ensure the Daily Notes plugin is active
3. Install the plugin and activate it
4. Configure your log entry formats and placement preferences in Settings
5. Reload Obsidian if necessary

## API Endpoints

### `GET /log`

URL params:
- `log` - The URL-encoded text that should be appended to the daily note. Can include newlines and markdown.

Example:
```
GET https://localhost:27124/log?log=Your+log+entry+here
```

Make sure to include your API key as specified in the Local REST API plugin settings.

## Manual Entry

The plugin provides an Obsidian command for manual entry:

1. Open the command palette (Ctrl/Cmd + P)
2. Search for "Add log entry"
3. Enter your log entry text in the modal
4. Press Enter or click "Add Entry"

Manual entries use a separate format specified in settings, making it easy to distinguish between API and manual entries.

## Usage with Keyboard Maestro

You can set up a Keyboard Maestro macro that uses a bash command to send data to the endpoint:

```sh
curl -H "Authorization: Bearer $KMVAR_Instance_Token" "https://127.0.0.1:27124/log/?log=$KMVAR_Instance_Entry"
```

![Keyboard Maestro Integration](usage-keyboard-maestro-action.png)

## Settings

The plugin provides several customization options:

### Log Entry Formats

- **API Entry Format**: Format for log entries coming from the REST API
- **Manual Entry Format**: Format for log entries added manually via Obsidian

Both formats support the following variables:
- `{entry}` - The actual log entry text (required)
- `{currentTime}` - Current time in 24-hour format (HH:MM)
- `{lastEntryTime}` - Time of the last log entry in 24-hour format (HH:MM)

Example formats:
- `- [x] {currentTime} {entry}`
- `- [x] 📝 {currentTime} {entry} (last entry: {lastEntryTime})`

### Log Entry Placement

- **Section Selection**: Which section to insert entries into (first heading, last heading, or whole file)
- **Heading Level**: Which heading level to use (e.g., `##`, `###`)
- **Position within Section**: Where to insert entries (start or end of section)

## Architecture

The plugin follows a modular, service-based architecture:

- **Services**: Core functional components with clear responsibilities
  - `RestApiService`: Manages API routes and request handling
  - `LoggingService`: Handles log entry creation and storage
  - `DailyNoteService`: Manages interactions with daily notes
  - `CacheService`: Provides persistent storage for logs and time tracking
  - `SettingsService`: Manages plugin settings

- **Endpoints**: Modular API endpoint handlers
  - `LogEndpointHandler`: Handles the /log endpoint
  - `EndpointFactory`: Creates and manages all endpoint handlers

- **Utilities**: Helper functions organized by domain
  - `PluginUtils`: Utilities for accessing other plugins
  - `FileUtils`: Utilities for file operations
  - `MarkdownUtils`: Utilities for markdown-specific operations
  - `TimeUtils`: Utilities for time formatting and timestamp management

- **Models**: Data structures and type definitions

- **UI**: User interface components
  - `LogEntryModal`: Modal dialog for entering log entries manually
  - `PersonalRestApiSettingTab`: Settings tab for plugin configuration
