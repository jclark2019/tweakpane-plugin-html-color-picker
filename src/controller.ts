import {Controller, Value, ViewProps} from '@tweakpane/core';

import {PluginView} from './view.js';

interface Config {
	value: Value<string>;
	viewProps: ViewProps;
}

export class PluginController implements Controller<PluginView> {
	public readonly value: Value<string>;
	public readonly view: PluginView;
	public readonly viewProps: ViewProps;

	constructor(doc: Document, config: Config) {
		this.onInputChange_ = this.onInputChange_.bind(this);

		this.value = config.value;
		this.viewProps = config.viewProps;
		this.viewProps.handleDispose(() => {
			this.view.inputElement.removeEventListener('input', this.onInputChange_);
		});

		this.view = new PluginView(doc, {
			value: this.value,
			viewProps: this.viewProps,
		});

		this.view.inputElement.addEventListener('input', this.onInputChange_);
	}

	private onInputChange_() {
		this.value.rawValue = this.view.inputElement.value;
	}
}
