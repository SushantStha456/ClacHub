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

export interface ResultRange {
	min: number;
	max: number;
	status: string;
	color?: string;
	description?: string;
}

export type ResultFormat = 'number' | 'currency' | 'percentage';

export interface ResultConfig {
	label: string;
	unit?: string;
	format?: ResultFormat;
	precision?: number;
	ranges?: ResultRange[];
}

export interface CalculatorConfig {
	id: string; // uuid or slug id
	name: string;
	description?: string;
	category: string;
	slug: string;
	icon?: string;
	fields: FieldConfig[];
	formula: string;
	result: ResultConfig;
	is_active: boolean;
	created_at?: string;
	updated_at?: string;
}

export interface CalculatorHistoryRecord {
	id: string;
	user_id?: string | null;
	calculator_id: string;
	inputs: Record<string, unknown>;
	result: number | null;
	created_at: string;
}


