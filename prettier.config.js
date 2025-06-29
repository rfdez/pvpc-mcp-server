/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
	useTabs: true,
	tabWidth: 4,
	plugins: ["prettier-plugin-packagejson"],
	overrides: [
		{
			files: "*.{json,json5,webmanifest}",
			options: {
				tabWidth: 2,
			},
		},
		{
			files: "*.{yml,yaml}",
			options: {
				useTabs: false,
				tabWidth: 2,
			},
		},
		{
			files: "*.{md,mdx}",
			options: {
				useTabs: false,
			},
		},
	],
};

export default config;
