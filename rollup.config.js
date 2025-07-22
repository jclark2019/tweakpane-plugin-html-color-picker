/* eslint-env node */

import Fs from 'fs';
import Path from 'path';
import {fileURLToPath} from 'url';

import Alias from '@rollup/plugin-alias';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import Replace from '@rollup/plugin-replace';
import Terser from '@rollup/plugin-terser';
import Typescript from '@rollup/plugin-typescript';
import Autoprefixer from 'autoprefixer';
import Postcss from 'postcss';
import Cleanup from 'rollup-plugin-cleanup';
import * as Sass from 'sass';

const __dirname = Path.dirname(fileURLToPath(import.meta.url));
const Package = JSON.parse(
	Fs.readFileSync(new URL('./package.json', import.meta.url)),
);

async function compileCss() {
	const sassResult = Sass.compile('src/sass/plugin.scss', {
		style: 'compressed',
		loadPaths: ['node_modules'],
		quietDeps: true,
	});

	const postcssResult = await Postcss([Autoprefixer]).process(sassResult.css, {
		from: undefined,
	});
	return postcssResult.css.replace(/'/g, "\\'").trim();
}

function getPlugins(css, shouldMinify) {
	const plugins = [
		Alias({
			entries: [
				{
					find: '@tweakpane/core',
					replacement: Path.resolve(
						__dirname,
						'node_modules/@tweakpane/core/dist/index.js',
					),
				},
			],
		}),
		Typescript({
			tsconfig: 'src/tsconfig.json',
		}),
		nodeResolve(),
		Replace({
			preventAssignment: true,
			values: {
				__css__: css,
			},
		}),
	];
	if (shouldMinify) {
		plugins.push(Terser());
	}
	return [
		...plugins,
		// https://github.com/microsoft/tslib/issues/47
		Cleanup({
			comments: 'none',
		}),
	];
}

function getDistName(packageName) {
	// `@tweakpane/plugin-foobar` -> `tweakpane-plugin-foobar`
	// `tweakpane-plugin-foobar`  -> `tweakpane-plugin-foobar`
	return packageName
		.split(/[@/-]/)
		.reduce((comps, comp) => (comp !== '' ? [...comps, comp] : comps), [])
		.join('-');
}

export default async () => {
	const production = process.env.BUILD === 'production';
	const postfix = production ? '.min' : '';

	const distName = getDistName(Package.name);
	const css = await compileCss();
	return {
		input: 'src/index.ts',
		output: [
			{
				file: `dist/${distName}${postfix}.js`,
				format: 'esm',
				globals: {
					'@tweakpane/core': 'Tweakpane',
				},
			},
			{
				file: `dist/${distName}${postfix}.cjs`,
				format: 'cjs',
				name: 'HtmlColorPickerPlugin',
				globals: {
					'@tweakpane/core': 'Tweakpane',
				},
				exports: 'named',
			},
			{
				file: `dist/${distName}.umd${postfix}.js`,
				format: 'umd',
				name: 'HtmlColorPickerPlugin',
				globals: {
					'@tweakpane/core': 'Tweakpane',
				},
				exports: 'named',
			},
		],
		plugins: getPlugins(css, production),

		// Suppress `Circular dependency` warning
		onwarn(warning, rollupWarn) {
			if (warning.code === 'CIRCULAR_DEPENDENCY') {
				return;
			}
			rollupWarn(warning);
		},
	};
};
