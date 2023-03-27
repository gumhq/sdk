import { defineConfig } from 'tsup';

export default defineConfig({
  entryPoints: ['src/index.ts'],
  format: ['cjs'],
  outDir: 'lib',
  dts: true,
});
