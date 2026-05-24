import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const allowedOrigins = ["localhost", "127.0.0.1", "10.242.218.114"];

if (isDev) {
  const customSubnet = process.env.NEXT_PUBLIC_DEV_SUBNET || "192.168.1.0/24";
  if (customSubnet && customSubnet.includes("/24")) {
    const baseIp = customSubnet.split("/")[0].split(".").slice(0, 3).join(".");
    for (let i = 1; i <= 254; i++) {
      allowedOrigins.push(`${baseIp}.${i}`);
    }
  } else {
    // Fallback: default subnet expansion
    for (let i = 1; i <= 254; i++) {
      allowedOrigins.push(`192.168.1.${i}`);
    }
  }
}

const nextConfig: NextConfig = {
  allowedDevOrigins: allowedOrigins,
};

export default nextConfig;
