export const STORAGE_THEME = "pf.theme";
export const STORAGE_ACCENT = "pf.accent";
export const LEGACY_DARK_KEY = "isDarkMode";

/**
 * Runs before hydration (inlined in <head>) so the first paint already has the
 * right theme class and accent colour. Keep in sync with PreferencesProvider.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage,r=document.documentElement;var t=s.getItem("${STORAGE_THEME}");if(!t){t=s.getItem("${LEGACY_DARK_KEY}")==="true"?"dark":"system"}var d=t==="dark"||(t==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);r.classList.toggle("dark",d);var a=s.getItem("${STORAGE_ACCENT}");if(a&&/^#[0-9a-f]{6}$/i.test(a)){r.style.setProperty("--accent",a)}}catch(e){}})();`;
