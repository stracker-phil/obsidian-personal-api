# Personal REST API

An Obsidian plugin that extends the [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) plugin to expose additional endpoints for personal workflows. The plugin focuses on adding a custom endpoint for logging entries to your daily notes.

This plugin is tailored to specific personal needs rather than being a general-purpose community plugin.

## Features

- Adds a `/log` endpoint to the Local REST API
- Automatically adds log entries to your daily notes
- Caches log entries if no daily note exists yet
- Flexible placement options:
  - Find and insert entries under a specific heading by text (e.g., "Activity Log")
  - Automatically create missing headings at configurable positions
  - Support for first/last heading of level or whole file modes
- Customizable log entry format and placement
- Different formats for API-based and manual log entries
- Smart placeholder variables for timestamps
- Provides an Obsidian command with a user-friendly modal for adding log entries manually
- Respects the structure of Markdown documents, preserving blank lines after headers
- Case-insensitive heading matching with automatic punctuation trimming

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

The plugin offers flexible options for controlling where log entries are inserted in your daily notes:

#### Heading by Text (Recommended)

This mode finds a specific heading by its text and inserts entries at the end of that section. If the heading doesn't exist, it will be created automatically.

- **Section Selection**: Choose "Specific heading by text"
- **Heading Level**: The heading level to search for/create (e.g., `##`, `###`)
- **Heading Text**: The text of the heading to find (case-insensitive, punctuation is automatically trimmed)
  - Example: `Log Items`, `Activity Log`, `Done Today`
- **Create Missing Heading After**: Where to create the heading if it doesn't exist
  - First/Last heading of level
  - File boundary (start or end)
- **Fallback Position**: Whether to insert before or after the reference point when creating the heading

**Example**: Set "Heading Text" to `Activity Log` with level `##`, and the plugin will:
1. Search for a heading like `## Activity Log` (or `## Activity Log:`, case doesn't matter)
2. Insert log entries at the end of that section
3. If the heading doesn't exist, create it at your specified fallback position

#### Other Modes

- **First heading of level**: Insert at the first occurrence of a specific heading level
- **Last heading of level**: Insert at the last occurrence of a specific heading level
- **Whole file**: Insert at the start or end of the entire file

**Note**: When using "heading by text" mode, entries are always inserted at the end of the found section to maintain chronological order.
