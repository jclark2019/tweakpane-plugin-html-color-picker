import {HtmlColorInputPlugin} from './plugin.js';

// The identifier of the plugin bundle.
export const id = 'html-color-picker';

// This plugin template injects a compiled CSS by @rollup/plugin-replace
// See rollup.config.js for details
export const css = '__css__';

// Export your plugin(s) as a constant `plugins`
export const plugins = [HtmlColorInputPlugin];


