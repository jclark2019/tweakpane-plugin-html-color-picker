import {
	BaseInputParams,
	BindingTarget,
	createPlugin,
	parseRecord,
	InputBindingPlugin,
	Value,
} from '@tweakpane/core';

import {PluginController} from './controller.js';

export interface PluginInputParams extends BaseInputParams {
	view: 'html-color-picker';
}

export const HtmlColorInputPlugin: InputBindingPlugin<
	string,
	string,
	PluginInputParams
> = createPlugin({
	id: 'html-color-picker',
	type: 'input',

	accept(exValue: unknown, params: Record<string, unknown>) {
		if (typeof exValue !== 'string') {
			return null;
		}

		const result = parseRecord<PluginInputParams>(params, (p) => ({
			view: p.required.constant('html-color-picker'),
		}));
		if (!result) {
			return null;
		}

		return {
			initialValue: exValue,
			params: result,
		};
	},

	binding: {
		reader(_args) {
			return (exValue: unknown): string => {
				return typeof exValue === 'string' ? exValue : '#000000';
			};
		},

		writer(_args) {
			return (target: BindingTarget, inValue) => {
				target.write(inValue);
			};
		},
	},

	controller(args) {
		return new PluginController(args.document, {
			value: args.value as Value<string>,
			viewProps: args.viewProps,
		});
	},
});
