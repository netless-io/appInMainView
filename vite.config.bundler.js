import path from 'path';
import { defineConfig } from 'vite';
import pkg from './package.json';
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';
  const external = Object.keys({
    ...pkg.peerDependencies,
    ...pkg.dependencies,
  });
  return {
    define: {
      __NAME__: JSON.stringify(pkg.name),
      __VERSION__: JSON.stringify(pkg.version),
    },
    css: {
      // modules:{
      //   generateScopedName:'[name]__[local]__[hash:base64:5]',
      //   hashPrefix:'prefix',
      // },
      preprocessorOptions:{
        less:{},
      },
    },
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        formats: ['es', 'cjs'],
      },
      outdir: 'dist',
      sourcemap: true,
      rollupOptions: {
        external,
      },
      minify: isProd,
    },
  };
});
