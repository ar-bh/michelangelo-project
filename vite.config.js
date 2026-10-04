import { defineConfig } from "vite";

const publish = process.env.PAGES === "1";

function singleFile() {
  return {
    name: "single-file",
    apply: "build",
    enforce: "post",
    generateBundle(_, bundle) {
      const htmlName = Object.keys(bundle).find((name) => name.endsWith(".html"));
      if (!htmlName) return;
      const htmlAsset = bundle[htmlName];
      let html = htmlAsset.source.toString();

      for (const match of html.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)) {
        const asset = bundle[match[1].replace(/^\.\//, "")];
        if (!asset) continue;
        const css = asset.source.toString().replace(/<\/style/gi, "<\\/style");
        html = html.replace(match[0], () => `<style>${css}</style>`);
        delete bundle[asset.fileName];
      }

      for (const match of html.matchAll(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/g)) {
        const asset = bundle[match[1].replace(/^\.\//, "")];
        if (!asset) continue;
        const code = (asset.code ?? asset.source.toString()).replace(/<\/script/gi, "<\\/script");
        html = html.replace(match[0], "");
        const closing = html.lastIndexOf("</body>");
        html = `${html.slice(0, closing)}<script>${code}</script>${html.slice(closing)}`;
        delete bundle[asset.fileName];
      }

      htmlAsset.source = html;
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: publish ? [] : [singleFile()],
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    assetsInlineLimit: publish ? 100 * 1024 : 100 * 1024 * 1024,
    cssCodeSplit: false,
    modulePreload: false,
  },
});
