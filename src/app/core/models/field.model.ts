export type FieldType = 'number' | 'text' | 'select' | 'radio' | 'checkbox';

export interface BaseFieldConfig {
	name: string;
	label: string;
	type: FieldType;
	required?: boolean;
	helpText?: string;
}

export interface NumberFieldConfig extends BaseFieldConfig {
	type: 'number';
	unit?: string;
	min?: number;
	max?: number;
	step?: number;
}

export interface TextFieldConfig extends BaseFieldConfig {
	type: 'text';
	maxLength?: number;
}

export interface SelectOption {
	value: string | number;
	label: string;
}

export interface SelectFieldConfig extends BaseFieldConfig {
	type: 'select';
	options: SelectOption[];
}

export interface RadioFieldConfig extends BaseFieldConfig {
	type: 'radio';
	options: SelectOption[];
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
	type: 'checkbox';
}

export type FieldConfig =
	| NumberFieldConfig
	| TextFieldConfig
	| SelectFieldConfig
	| RadioFieldConfig
	| CheckboxFieldConfig;


