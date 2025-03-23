# Personal REST API

An Obsidian plugin that uses the [Local REST API](https://github.com/coddingtonbear/obsidian-local-rest-api) plugin to expose additional endpoints for my personal workflow.

This plugin is not suitable for distribution as an Obsidian community plugin because it's tailored to my personal needs without offering any options to make it useful for someone else.

## Features

New endpoints provided:

- `GET /log` will add a time-recording log to the current daily note.

## Set up

1. Ensure the Local REST API plugin is installed and active.
2. Install the plugin and activate it. Reload Obsidian.

## API endpoints

### `GET /log`

URL params:
- `log` .. The URL-encoded text that should be appended to the daily note. Can include newlines and markdown.

## Usage

Via a Keyboard Maestro macro that uses a bash-command to send data to the endpoint:

```sh
curl -H "Authorization: Bearer $KMVAR_Instance_Token" "https://127.0.0.1:27124/log/?log=$KMVAR_Instance_Entry"
```

![](usage-keyboard-maestro-action.png)
