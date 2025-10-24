import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Ignorar errores de ESLint durante el build
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Eliminar console.* en producción
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  devIndicators: false,

  // Configuración de Webpack
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false;
    }
    return config;
  },

  // Opciones experimentales
  experimental: {
    optimizePackageImports: ['axios'],
  },
};

export default nextConfig;