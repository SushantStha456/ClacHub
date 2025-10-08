import { FieldConfig } from '../../../core/models/field.model';
import { FieldRenderer } from '../form-field/FieldRenderer';

interface FormBuilderProps {
	fields: FieldConfig[];
	values: Record<string, unknown>;
	onChange: (name: string, value: unknown) => void;
	onSubmit: () => void;
	errors?: Record<string, string>;
}

export function FormBuilder({ fields, values, onChange, onSubmit, errors }: FormBuilderProps) {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit();
			}}
			className="space-y-4"
		>
			{fields.map((field) => (
				<div key={field.name} className="bg-white p-4 rounded-lg border border-gray-200">
					<FieldRenderer field={field} value={values[field.name]} onChange={onChange} errors={errors} />
				</div>
			))}
			<div className="pt-2">
				<button type="submit" className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium">
					Calculate
				</button>
			</div>
		</form>
	);
}


