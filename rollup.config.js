
import postcss from 'rollup-plugin-postcss';
import image from '@rollup/plugin-image';
import {nodeResolve} from '@rollup/plugin-node-resolve';

export default [
	{
		input: './src/index.js',
		output: {
			file: './dist/harmony-browser-utils.js',
			format: 'esm'
		},
		plugins: [
			postcss({
			}),
			image(),
			nodeResolve(),
		],
	},
];
