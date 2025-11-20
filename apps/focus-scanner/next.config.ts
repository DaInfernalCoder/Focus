import type { NextConfig } from "next";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables from root .env.local
config({ path: resolve(__dirname, "../../.env.local") });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
