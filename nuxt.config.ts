// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    "@nuxt/eslint",
    "@nuxt/content",
    "@nuxt/image",
    "@nuxt/ui",
    "@nuxtjs/i18n",
  ],
  css: ["~/assets/css/main.css"],
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  app: {
    head: {
      titleTemplate: "%s · Camellab",
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
        { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      ],
    },
  },
  // Light only; fonts are self-hosted from @fontsource.
  ui: { colorMode: false, fonts: false },
  // Singapore; keep in the same region as the Supabase project (ap-southeast-1).
  nitro: {
    vercel: { functions: { regions: ["sin1"] } },
  },
  content: {
    experimental: { sqliteConnector: "native" },
  },
  // The admin preview parses Markdown in the browser. Under pnpm, MDC's own
  // `extend`/`debug` entries don't resolve, so dev serves those CJS packages raw.
  vite: {
    optimizeDeps: {
      include: [
        "@nuxtjs/mdc > unified > extend",
        "@nuxtjs/mdc > remark-parse > mdast-util-from-markdown > micromark > debug",
      ],
    },
    server: {
      allowedHosts: ["dev.arpthef.my.id"],
    },
  },
  i18n: {
    locales: [
      { code: "en", language: "en-US", name: "English", file: "en.json" },
      {
        code: "id",
        language: "id-ID",
        name: "Bahasa Indonesia",
        file: "id.json",
      },
    ],
    defaultLocale: "en",
    strategy: "no_prefix",
    // server/utils/auth.ts reads this cookie to pick the email language.
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_locale",
      fallbackLocale: "en",
    },
  },
  hooks: {
    // Nuxt Content prerenders each collection's full dump as a public file. Posts can be
    // role-restricted, so those two are served only through server/api/posts (server/utils/content.ts).
    "nitro:config"(config) {
      for (const name of ["news", "articles"]) {
        (config.routeRules ||= {})[`/__nuxt_content/${name}/sql_dump.txt`] = { prerender: false };
      }
    },
    "content:file:afterParse"({ file, content, collection }) {
      if (collection.name === "news" || collection.name === "articles") {
        content.minutes = Math.max(
          1,
          Math.round(file.body.split(/\s+/).length / 200),
        );
      }
    },
  },
});
