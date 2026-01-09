import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: [
    '@misque/core',
    '@misque/quran',
    '@misque/prayer-times',
    '@misque/hijri',
    '@misque/qibla',
  ],
};

export default withMDX(config);
