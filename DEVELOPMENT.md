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

### `npm test`

Runs the test suite once using Jest.

All tests are located next to their corresponding source files with the `.test.ts` extension.

### `npm run test:watch`

Runs the test suite in watch mode. Tests automatically re-run when files change.

Useful during development to get instant feedback on code changes.

### `npm run test:coverage`

Runs the test suite and generates a coverage report.

Coverage reports are generated in the `coverage/` directory and show:
- Statement coverage
- Branch coverage
- Function coverage
- Line coverage

The coverage report includes:
- Text summary in the terminal
- HTML report in `coverage/index.html` (open in browser for detailed view)
- LCOV report for integration with coverage tools

## Testing

The plugin uses Jest for unit testing. Tests are colocated with source files.

### Test Structure

```
src/
├── utils/
│   ├── markdown.utils.ts
│   ├── markdown.utils.test.ts      ← Tests for markdown.utils
│   ├── time.utils.ts
│   └── time.utils.test.ts          ← Tests for time.utils
```

### Writing Tests

Tests use Jest's standard API:

```typescript
import { MarkdownUtils } from './markdown.utils';

describe('MarkdownUtils', () => {
  describe('normalizeHeadingText', () => {
    it('should trim whitespace and convert to lowercase', () => {
      expect(MarkdownUtils.normalizeHeadingText('  Log Items  '))
        .toBe('log items');
    });
  });
});
```

### Running Tests During Development

1. **One-time run**: `npm test` - Quick check before commits
2. **Watch mode**: `npm run test:watch` - Continuous testing during development
3. **Coverage check**: `npm run test:coverage` - Verify test coverage

### Test Coverage Goals

- **Utils**: Aim for >90% coverage (pure functions, easy to test)
- **Services**: Lower priority (heavy Obsidian dependencies)
- **UI**: Not currently tested (requires Obsidian environment)

## Create a New Release

1. Commit all changes
2. Bump version in `package.json`
3. Run `npm run version`
4. Run `npm run build`
5. Add a version tag in git (`git tag vX.Y.Z`)
6. Push to GitHub (`git push --tags`)

The GitHub workflow will automatically create a new release in the git repo.
