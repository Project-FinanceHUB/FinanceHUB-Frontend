/** @type {import('next').NextConfig} */
const nextConfig = {
  // Evita panic do Turbopack no Windows (usa webpack no dev)
  turbopack: false,
};

export default nextConfig;
