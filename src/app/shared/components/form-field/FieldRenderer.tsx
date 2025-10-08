import { FieldConfig } from '../../../core/models/field.model';
import { cn } from '../../utils/cn';

interface FieldRendererProps {
	field: FieldConfig;
	value: unknown;
	onChange: (name: string, value: unknown) => void;
	errors?: Record<string, string>;
}

export function FieldRenderer({ field, value, onChange, errors }: FieldRendererProps) {
	const error = errors?.[field.name];
	const common = {
		id: field.name,
		name: field.name,
		required: field.required,
		className: cn(
			'block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500',
			error ? 'border-red-300' : 'border-gray-300'
		),
	};

	return (
		<div className="space-y-1">
			<label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
				{field.label} {('unit' in field && field.unit) ? <span className="text-gray-500">({(field as any).unit})</span> : null}
			</label>
			{field.type === 'number' && (
				<input
					{...common}
					type="number"
					min={(field as any).min}
					max={(field as any).max}
					step={(field as any).step}
					value={typeof value === 'number' || typeof value === 'string' ? value : ''}
					onChange={(e) => onChange(field.name, e.target.value === '' ? '' : Number(e.target.value))}
				/>
			)}
			{field.type === 'text' && (
				<input
					{...common}
					type="text"
					maxLength={(field as any).maxLength}
					value={typeof value === 'string' ? value : ''}
					onChange={(e) => onChange(field.name, e.target.value)}
				/>
			)}
			{field.type === 'select' && (
				<select
					{...common}
					value={(value as any) ?? ''}
					onChange={(e) => onChange(field.name, e.target.value)}
				>
					<option value="">Select...</option>
					{(field as any).options?.map((opt: any) => (
						<option key={String(opt.value)} value={String(opt.value)}>
							{opt.label}
						</option>
					))}
				</select>
			)}
			{field.type === 'radio' && (
				<div className="space-y-1">
					{(field as any).options?.map((opt: any) => (
						<label key={String(opt.value)} className="flex items-center gap-2 text-sm text-gray-700">
							<input
								type="radio"
								name={field.name}
								checked={String(value) === String(opt.value)}
								onChange={() => onChange(field.name, opt.value)}
							/>
							{opt.label}
						</label>
					))}
				</div>
			)}
			{field.type === 'checkbox' && (
				<label className="flex items-center gap-2 text-sm text-gray-700">
					<input
						type="checkbox"
						checked={Boolean(value)}
						onChange={(e) => onChange(field.name, e.target.checked)}
					/>
					{field.label}
				</label>
			)}
			{error && <p className="text-xs text-red-600">{error}</p>}
			{field.helpText && <p className="text-xs text-gray-500">{field.helpText}</p>}
		</div>
	);
}


