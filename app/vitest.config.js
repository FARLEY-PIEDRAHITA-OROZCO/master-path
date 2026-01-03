import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Usar happy-dom como entorno (simula navegador)
    environment: 'happy-dom',
    
    // Archivos de test a buscar
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    
    // Archivos a excluir
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    
    // Mostrar cuánto código está cubierto por tests
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['assets/js/**/*.js'],
      exclude: ['**/*.test.js', '**/*.spec.js']
    },
    
    // Configuración de UI
    ui: true,
    
    // Configuración global
    globals: true,
    
    // Timeout para tests
    testTimeout: 10000
  }
});
