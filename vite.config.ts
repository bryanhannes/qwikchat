import {defineConfig} from 'vite';
import * as dotenv from 'dotenv';
import {qwikVite} from '@builder.io/qwik/optimizer';
import {qwikCity} from '@builder.io/qwik-city/vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const envDir = process?.cwd();
const envFile = ".env";

dotenv.config({ path: `${envDir}/${envFile}` });

export default defineConfig(() => {
  return {
    plugins: [qwikCity(), qwikVite(), tsconfigPaths()],
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});
