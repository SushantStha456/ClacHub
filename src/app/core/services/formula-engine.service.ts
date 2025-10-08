import { create, all } from 'mathjs';

const math = create(all, { matrix: 'Array' });

export interface EvaluateOptions {
	precision?: number;
}

export function evaluateFormula(formula: string, variables: Record<string, unknown>, options?: EvaluateOptions): number {
	const compiled = math.parse(formula).compile();
	const result = compiled.evaluate(variables);
	const numeric = typeof result === 'number' ? result : Number(result);
	if (!isFinite(numeric)) return NaN;
	if (options?.precision != null) {
		const factor = Math.pow(10, options.precision);
		return Math.round(numeric * factor) / factor;
	}
	return numeric;
}


