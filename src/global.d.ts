declare module "*.css" {
	const content: { [className: string]: string };
	export default content;
}

declare const __PKG_VERSION__: string;
