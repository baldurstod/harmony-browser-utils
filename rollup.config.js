
import {nodeResolve} from '@rollup/plugin-node-resolve';

export default [
	{
		input: './src/index.js',
		output: {
			file: './dist/harmony-browser-utils.js',
			format: 'esm'
		},
		plugins: [
			nodeResolve(),
		],
	},
];
