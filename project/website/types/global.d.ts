import type { OverlayScrollbars as OSInstance } from 'overlayscrollbars';

declare global {
	interface Window {
		/**
		 * 这个属性用于存储 OverlayScrollbars 实例。
		 */
		osInstance: OSInstance | undefined;
	}
}
