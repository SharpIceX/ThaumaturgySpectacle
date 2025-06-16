import type { Preset } from 'unocss';
import designUI from './design/ui.json';

export default (): Preset => {
	return {
		name: 'arcanova_design',
		theme: {
			borderRadius: {
				arc: designUI.radius,
			},
		},
	};
};
