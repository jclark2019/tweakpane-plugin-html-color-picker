module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/eslint-recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:prettier/recommended',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'simple-import-sort'],
	root: true,
	rules: {
		camelcase: 'off',
		'no-unused-vars': 'off',
		'sort-imports': 'off',
		'prettier/prettier': 'error',
		'simple-import-sort/imports': 'off',
		'@typescript-eslint/naming-convention': [
			'warn',
			{
				selector: 'variable',
				format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
				custom: {
					regex: '^opt_',
					match: false,
				},
			},
		],
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-unused-vars': [
			'error',
			{
				argsIgnorePattern: '^_',
			},
		],

		'@typescript-eslint/explicit-module-boundary-types': 'off',
	},
	overrides: [
		{
			files: ['rollup.config.js', 'scripts/**/*.js'],
			env: {
				node: true,
			},
			rules: {
				'@typescript-eslint/no-var-requires': 'off',
			},
		},
	],
};
