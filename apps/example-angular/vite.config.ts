import angular from '@analogjs/vite-plugin-angular';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    mainFields: ['module'],
  },
  plugins: [angular()],
  server: { host: '0.0.0.0', port: 5177, allowedHosts: true },
  preview: { host: '0.0.0.0', port: 4177, allowedHosts: true },
});
