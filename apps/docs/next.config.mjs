import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Point to monorepo root for proper file tracing in Vercel
  outputFileTracingRoot: path.join(__dirname, '../../'),
  transpilePackages: [
    '@misque/core',
    '@misque/quran',
    '@misque/prayer-times',
    '@misque/hijri',
    '@misque/qibla',
  ],
};

export default withMDX(config);
