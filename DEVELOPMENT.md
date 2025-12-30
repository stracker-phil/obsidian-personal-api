# Development

## Quick start

1. `npm install`
2. `npm run dev`

### Symlink to Sandbox

Create a symlink from the dist folder to the Sandbox vault:

```
cd ~/path/to/Sandbox/.obsidian/plugins
ln -s ~/code/this-plugin/dist this-plugin
```

## NPM Scripts

### `npm run dev`

Starts a development server and watches for changes.

Output of the dev plugin is in `dist/` folder.

**Testing the changes**

- Open the Sandbox vault in Obsidian (make sure the symlink is set up - see above)
- After every change, disable and re-enable the plugin in Obsidian settings to apply changes

### `npm run version`

Important: Before calling this script, update the `version` attribute in the `package.json` file.

Bumps the plugin version. Must run before an official plugin release can happen.

Expected updates:
- `manifest.json`
- `versions.json`

### `npm run build`

Packages the plugin for release.

Output of the full plugin is in `dist/` folder.

## Create a New Release

1. Commit all changes
2. Bump version in `package.json`
3. Run `npm run version`
4. Run `npm run build`
5. Add a version tag in git (`git tag vX.Y.Z`)
6. Push to GitHub (`git push --tags`)

The GitHub workflow will automatically create a new release in the git repo.
