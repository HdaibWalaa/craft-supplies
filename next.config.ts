import type { NextConfig } from "next";

const mediaOrigin = new URL(
  process.env.NEXT_PUBLIC_MEDIA_URL ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://localhost:8000",
);

if (mediaOrigin.protocol !== "http:" && mediaOrigin.protocol !== "https:") {
  throw new Error("NEXT_PUBLIC_MEDIA_URL must use http or https.");
}

const isLocalMediaOrigin = ["localhost", "127.0.0.1", "::1"].includes(
  mediaOrigin.hostname,
);

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: isLocalMediaOrigin,
    remotePatterns: [
      {
        protocol: mediaOrigin.protocol.slice(0, -1) as "http" | "https",
        hostname: mediaOrigin.hostname,
        port: mediaOrigin.port,
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;
