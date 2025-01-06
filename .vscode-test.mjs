import { defineConfig } from '@vscode/test-cli';
import path from 'path';

export default defineConfig({
	files: 'out/test/**/*.test.js',
	launchArgs: ['--disable-extensions', import.meta.dirname]
});
