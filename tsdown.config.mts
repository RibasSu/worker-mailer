import { defineConfig } from 'tsdown'

export default defineConfig({
  format: ['cjs', 'esm'],
  entry: ['./src/index.ts', './src/queue.ts'],
  dts: true,
  shims: true,
  minify: true,
  outExtensions: ({ format }) => ({
    js: format === 'cjs' ? '.js' : '.mjs',
    dts: format === 'cjs' ? '.d.ts' : '.d.mts',
  }),
  deps: {
    skipNodeModulesBundle: true,
    neverBundle: ['cloudflare:sockets'],
  },
  clean: true,
})
