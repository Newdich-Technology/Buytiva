export type LordiconName =
	| 'cart'
	| 'check'
	| 'directions'
	| 'home'
	| 'location'
	| 'search'
	| 'spinner'
	| 'theme'
	| 'vertical'
	| 'warning';

export type LordiconDefinition = {
	src: string;
	state: string;
	sourcePage: string;
	license: 'free';
};

const CDN = 'https://cdn.lordicon.com/';

export const LORDICON_REGISTRY: Record<LordiconName, LordiconDefinition> = {
	cart: {
		src: `${CDN}system-solid-146-cart.json`,
		state: 'hover-pinch',
		sourcePage: 'https://lordicon.com/icons/system/solid/146-cart',
		license: 'free'
	},
	check: {
		src: `${CDN}system-outline-37-check.json`,
		state: 'in-reveal',
		sourcePage: 'https://lordicon.com/icons/system/outline/37-check',
		license: 'free'
	},
	directions: {
		src: `${CDN}system-solid-220-arrows-right-left.json`,
		state: 'hover-slide',
		sourcePage: 'https://lordicon.com/icons/system/solid/220-arrows-right-left',
		license: 'free'
	},
	home: {
		src: `${CDN}system-solid-63-home.json`,
		state: 'hover-pinch',
		sourcePage: 'https://lordicon.com/icons/system/solid/63-home',
		license: 'free'
	},
	location: {
		src: `${CDN}system-solid-18-location-pin.json`,
		state: 'hover-pinch',
		sourcePage: 'https://lordicon.com/icons/system/solid/18-location-pin',
		license: 'free'
	},
	search: {
		src: `${CDN}system-solid-19-magnifier.json`,
		state: 'hover-pinch',
		sourcePage: 'https://lordicon.com/icons/system/solid/19-magnifier',
		license: 'free'
	},
	spinner: {
		src: `${CDN}laducuyh.json`,
		state: 'loop-cycle',
		sourcePage: 'https://lordicon.com/icons/system/outline/4029-spinner-dashes',
		license: 'free'
	},
	theme: {
		src: `${CDN}system-solid-237-star.json`,
		state: 'hover-pinch',
		sourcePage: 'https://lordicon.com/icons/system/solid/237-star',
		license: 'free'
	},
	vertical: {
		src: `${CDN}system-solid-219-arrows-up-down.json`,
		state: 'hover-slide',
		sourcePage: 'https://lordicon.com/icons/system/solid/219-arrows-up-down',
		license: 'free'
	},
	warning: {
		src: `${CDN}system-outline-260-warning-circle.json`,
		state: 'hover-pinch',
		sourcePage: 'https://lordicon.com/icons/system/outline/260-warning-circle',
		license: 'free'
	}
};
