/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the existing static HTML files in public/ to be served
  // Next.js pages take priority over public/ files at the same path
  trailingSlash: false,
};

module.exports = nextConfig;
