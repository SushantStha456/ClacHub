import { useEffect, useMemo, useState } from 'react';
import { fetchCalculatorBySlug } from '../../../core/services/calculator.service';
import { CalculatorConfig } from '../../../core/models/calculator.model';
import { FormBuilder } from '../../../shared/components/form-builder/FormBuilder';
import { evaluateFormula } from '../../../core/services/formula-engine.service';
import { ResultViewer } from '../../../shared/components/result-viewer/ResultViewer';

interface CalculatorDetailProps {
	slug: string;
}

export default function CalculatorDetail({ slug }: CalculatorDetailProps) {
	const [config, setConfig] = useState<CalculatorConfig | null>(null);
	const [loading, setLoading] = useState(true);
	const [values, setValues] = useState<Record<string, unknown>>({});
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [result, setResult] = useState<number | null>(null);

	useEffect(() => {
		setLoading(true);
		setResult(null);
		setErrors({});
		setValues({});
		fetchCalculatorBySlug(slug)
			.then((cfg) => setConfig(cfg))
			.finally(() => setLoading(false));
	}, [slug]);

	useEffect(() => {
		if (!config) return;
		const initial: Record<string, unknown> = {};
		for (const f of config.fields) initial[f.name] = '';
		setValues(initial);
	}, [config]);

	const onChange = (name: string, value: unknown) => {
		setValues((v) => ({ ...v, [name]: value }));
	};

	const handleSubmit = () => {
		if (!config) return;
		const nextErrors: Record<string, string> = {};
		for (const f of config.fields) {
			const val = values[f.name];
			if (f.required && (val === '' || val == null)) nextErrors[f.name] = 'Required';
			if (f.type === 'number' && val !== '' && val != null) {
				const num = Number(val);
				if ((f as any).min != null && num < (f as any).min) nextErrors[f.name] = `Min ${(f as any).min}`;
				if ((f as any).max != null && num > (f as any).max) nextErrors[f.name] = `Max ${(f as any).max}`;
			}
		}
		setErrors(nextErrors);
		if (Object.keys(nextErrors).length) return;

		const numericVars: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(values)) numericVars[k] = v === '' ? 0 : v;
		const value = evaluateFormula(config.formula, numericVars, { precision: config.result.precision });
		setResult(value);
	};

	const title = useMemo(() => config?.name || 'Calculator', [config]);

	if (loading) return <div className="p-6">Loading...</div>;
	if (!config) return <div className="p-6">Calculator not found.</div>;

	return (
		<div className="max-w-3xl mx-auto p-4 sm:p-6">
			<h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
			{config.description && <p className="text-gray-600 mb-4">{config.description}</p>}

			<FormBuilder fields={config.fields} values={values} onChange={onChange} onSubmit={handleSubmit} errors={errors} />

			<ResultViewer config={config.result} value={result} />
		</div>
	);
}


