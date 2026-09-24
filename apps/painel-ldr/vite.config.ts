import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import netlify from "@netlify/vite-plugin-tanstack-start";
import { nitro } from "nitro/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const supabaseUrl = env["VITE_SUPABASE_URL"] || env["SUPABASE_URL"] || "";
  const supabasePublishableKey =
    env["VITE_SUPABASE_PUBLISHABLE_KEY"] || env["SUPABASE_PUBLISHABLE_KEY"] || "";

  const isCloudflare = process.env["CLOUDFLARE"] === "true";
  const isRender = process.env["RENDER"] === "true";
  const deploymentAdapter = isRender
    ? nitro({ preset: "node-server" })
    : process.env["VERCEL"]
      ? nitro()
      : netlify();

  return {
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(supabaseUrl),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(supabasePublishableKey),
    },
    plugins: [
      tsconfigPaths(),
      tailwindcss(),
      ...(isCloudflare ? [cloudflare({ viteEnvironment: { name: "ssr" } })] : []),
      tanstackStart(),
      ...(isCloudflare ? [] : [deploymentAdapter]),
      viteReact(),
    ],
  };
});
