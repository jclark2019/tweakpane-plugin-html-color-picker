import {ClassName, Value, View, ViewProps} from '@tweakpane/core';

interface Config {
	value: Value<string>;
	viewProps: ViewProps;
}

const className = ClassName('htmlcolor');

export class PluginView implements View {
	public readonly element: HTMLElement;
	public readonly inputElement: HTMLInputElement;
	private readonly textElement: HTMLSpanElement;
	private readonly textFieldElement: HTMLInputElement;
	private readonly hashSpanElement: HTMLSpanElement;
	private value_: Value<string>;

	/**
	 * Constructs a new PluginView instance.
	 *
	 * @param doc - The Document instance used to create and manipulate DOM elements.
	 * @param config - The configuration object containing the value and view properties.
	 *
	 * Initializes the view by creating the main container element and configuring
	 * it with class modifiers. Sets up the input and display elements for color
	 * selection and text display. Binds event listeners to handle interactions
	 * such as text click, text field blur, and text field input. The view is
	 * refreshed to reflect the current value. Also sets up disposal handling
	 * using the provided view properties.
	 */

	constructor(doc: Document, config: Config) {
		// View container
		this.element = doc.createElement('div');
		this.element.classList.add(className());
		config.viewProps.bindClassModifiers(this.element);

		this.value_ = config.value;
		this.value_.emitter.on('change', this.onValueChange_.bind(this));

		// HTML color input
		this.inputElement = doc.createElement('input');
		this.inputElement.type = 'color';
		this.inputElement.classList.add(className('input'));
		this.element.appendChild(this.inputElement);

		// Text color string div
		const textContainer = doc.createElement('div');
		textContainer.classList.add(className('text-container'));
		this.element.appendChild(textContainer);

		// # character
		this.hashSpanElement = doc.createElement('span');
		this.hashSpanElement.textContent = '#';
		this.hashSpanElement.classList.add(className('hash'));
		textContainer.appendChild(this.hashSpanElement);

		// Color value as text
		this.textElement = doc.createElement('span');
		this.textElement.classList.add(className('text'));
		this.textElement.addEventListener('click', this.onTextClick_.bind(this));
		textContainer.appendChild(this.textElement);

		// Text input for color value
		this.textFieldElement = doc.createElement('input');
		this.textFieldElement.type = 'text';
		this.textFieldElement.maxLength = 6;
		this.textFieldElement.classList.add(className('text-field'));
		textContainer.appendChild(this.textFieldElement);

		// Add listeners to textField
		this.textFieldElement.addEventListener(
			'blur',
			this.onTextFieldBlur_.bind(this),
		);
		this.textFieldElement.addEventListener(
			'input',
			this.onTextFieldInput_.bind(this),
		);
		this.textFieldElement.addEventListener(
			'keydown',
			this.onTextFieldKeyDown_.bind(this),
		);

		this.refresh_();

		config.viewProps.handleDispose(() => {
			// Called when the view is disposing
		});
	}

	/**
	 * Refreshes the view elements with the current value.
	 *
	 * Updates the color input element with the current raw value,
	 * and updates the text element and text field element with
	 * the current value without the '#' prefix and in uppercase.
	 */
	private refresh_(): void {
		const rawValue = this.value_.rawValue;
		this.inputElement.value = rawValue;
		this.textElement.textContent = rawValue.substring(1).toLowerCase(); // Remove # and make lowercase
		this.textFieldElement.value = rawValue.substring(1).toLowerCase();
	}

	/**
	 * Called when the value of the bound property changes.
	 *
	 * Refreshes the view elements with the new value.
	 */
	private onValueChange_() {
		this.refresh_();
	}

	/**
	 * Called when the user clicks on the text element.
	 *
	 * Hides the text element and displays the text field element,
	 * and focuses the text field element.
	 */
	private onTextClick_() {
		this.textElement.style.width = '0';
		this.textElement.style.height = '0';
		this.textElement.style.overflow = 'hidden';
		this.textFieldElement.style.width = '6ch';
		this.textFieldElement.style.height = 'auto';
		this.textFieldElement.style.overflow = 'visible';
		this.textFieldElement.focus();
	}

	/**
	 * Validates and formats a hex color string.
	 *
	 * Handles 3-digit and 6-digit hex codes, converting them to a
	 * standard 6-digit format (e.g., '#rrggbb').
	 *
	 * @param text - The input string to validate and format.
	 * @returns The formatted color string, or null if the input is invalid.
	 */
	private validateAndFormatHex_(text: string): string | null {
		const cleanText = text.toLowerCase();
		// Handle 6-digit hex
		if (/^[0-9a-f]{6}$/.test(cleanText)) {
			return `#${cleanText}`;
		}
		// Handle 3-digit hex
		if (/^[0-9a-f]{3}$/.test(cleanText)) {
			return `#${cleanText
				.split('')
				.map((c) => c + c)
				.join('')}`;
		}
		return null;
	}

	/**
	 * Handles the blur event for the text field input.
	 *
	 * This method hides the text field and displays the text element
	 * when the input field loses focus. It checks if the input value is
	 * a valid 3-digit hex shorthand, expanding it to a 6-digit hex color
	 * code if so. If the input is not a valid color code, it reverts the
	 * displayed value to the current valid color.
	 */
	private onTextFieldBlur_() {
		this.textElement.style.width = '6ch';
		this.textElement.style.height = 'auto';
		this.textElement.style.overflow = 'visible';
		this.textFieldElement.style.width = '0';
		this.textFieldElement.style.height = '0';
		this.textFieldElement.style.overflow = 'hidden';

		const textValue = this.textFieldElement.value;
		const newColor = this.validateAndFormatHex_(textValue);

		if (newColor) {
			this.value_.rawValue = newColor;
		} else {
			// Revert to current valid value if input is invalid
			this.refresh_();
		}
	}

	/**
	 * Calls textFieldElement.blur to validate and input a color string when Enter key is pressed
	 * @param ev : KeyboardEvent
	 */
	private onTextFieldKeyDown_(ev: KeyboardEvent) {
		if (ev.key === 'Enter') {
			this.textFieldElement.blur();
		}
	}

	/**
	 * Handles the keydown event for the text field input.
	 *
	 * If the user presses the Enter key, it triggers a blur on the
	 * it updates the value with the new color.
	 * This method is called on every input event,
	 * so it will be called rapidly while the user is typing.
	 */
	private onTextFieldInput_() {
		this.updateValueFromTextField_();
	}

	/**
	 * Updates the color value from the text field input.
	 *
	 * The method checks if the input is a valid 6-digit hex color code.
	 * If so, it updates the value with the new color.
	 * Returns true if the value was updated, false otherwise.
	 */
	private updateValueFromTextField_(): boolean {
		const textValue = this.textFieldElement.value;
		if (/^[0-9a-f]{6}$/i.test(textValue)) {
			this.value_.rawValue = '#' + textValue;
			return true;
		}
		return false;
	}
}
