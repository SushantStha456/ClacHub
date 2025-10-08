import { supabase } from './supabase.service';
import { CalculatorConfig } from '../models/calculator.model';

const TABLE = 'calculators';

export async function fetchActiveCalculators(): Promise<CalculatorConfig[]> {
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('is_active', true)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data as unknown as CalculatorConfig[]) || [];
}

export async function fetchCalculatorBySlug(slug: string): Promise<CalculatorConfig | null> {
	const { data, error } = await supabase
		.from(TABLE)
		.select('*')
		.eq('slug', slug)
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	return (data as unknown as CalculatorConfig) || null;
}

export async function createCalculator(config: CalculatorConfig): Promise<CalculatorConfig> {
	const { data, error } = await supabase.from(TABLE).insert(config).select('*').single();
	if (error) throw error;
	return data as unknown as CalculatorConfig;
}

export async function updateCalculator(id: string, updates: Partial<CalculatorConfig>): Promise<CalculatorConfig> {
	const { data, error } = await supabase
		.from(TABLE)
		.update(updates)
		.eq('id', id)
		.select('*')
		.single();
	if (error) throw error;
	return data as unknown as CalculatorConfig;
}

export async function deleteCalculator(id: string): Promise<void> {
	const { error } = await supabase.from(TABLE).delete().eq('id', id);
	if (error) throw error;
}


