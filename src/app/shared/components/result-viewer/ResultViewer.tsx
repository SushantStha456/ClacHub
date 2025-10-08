import { ResultConfig } from '../../../core/models/calculator.model';

interface ResultViewerProps {
	config: ResultConfig;
	value: number | null;
}

export function ResultViewer({ config, value }: ResultViewerProps) {
	if (value == null || Number.isNaN(value)) {
		return null;
	}

	const formatted = (() => {
		const v = value;
		if (config.format === 'currency') return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(v);
		if (config.format === 'percentage') return `${v}%`;
		if (typeof config.precision === 'number') return v.toFixed(config.precision);
		return String(v);
	})();

	const status = config.ranges?.find((r) => vInRange(value, r.min, r.max));

	return (
		<div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
			<div className="text-sm text-gray-500">{config.label}</div>
			<div className="text-2xl font-semibold text-gray-900">
				{formatted} {config.unit ? <span className="text-gray-500 text-base">{config.unit}</span> : null}
			</div>
			{status && (
				<div className="mt-2 text-sm">
					<span className={status.color || 'text-gray-600'}>{status.status}</span>
					{status.description ? <span className="text-gray-500"> — {status.description}</span> : null}
				</div>
			)}
		</div>
	);
}

function vInRange(v: number, min: number | undefined, max: number | undefined) {
	if (min != null && v < min) return false;
	if (max != null && v >= max) return false;
	return true;
}


