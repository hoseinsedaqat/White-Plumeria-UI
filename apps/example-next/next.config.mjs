function deskBase() {
  const site = process.env.WPL_BASE ?? '/';
  const prefix = site.endsWith('/') ? site.slice(0, -1) : site;
  return `${prefix}/desks/next`;
}

const embedded = process.env.WPL_DESK === '1';
const basePath = embedded ? deskBase() : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@white-plumeria/react', '@white-plumeria/core', '@white-plumeria/tokens'],
};

export default nextConfig;
