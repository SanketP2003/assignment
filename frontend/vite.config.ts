import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/auth': 'http://localhost:3000',
			'/config': 'http://localhost:3000',
			'/send': 'http://localhost:3000',
			'/report': 'http://localhost:3000',
			'/dashboard': 'http://localhost:3000',
			'/user': 'http://localhost:3000',
			'/health': 'http://localhost:3000',
			'/parse-excel': 'http://localhost:3000'
		}
	}
});
