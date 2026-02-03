import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			'/api': {
				// Backend: dotnet run → 5206; Docker (docker-compose) → 8080
				target: process.env.API_PROXY_TARGET ?? 'http://localhost:5206',
				changeOrigin: true,
			},
		},
	},
});
