/**
 * Baut aus dem Vite-Output eine einzelne HTML-Datei (dist-preview/lernbruecke.html),
 * die sich ohne Server direkt im Browser öffnen lässt. Der normale dist/-Build
 * bleibt unverändert und ist die Variante für echtes Hosting (inkl. PWA).
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
const out = 'dist-preview';
let html = readFileSync(join(dist, 'index.html'), 'utf8');

for (const file of readdirSync(join(dist, 'assets'))) {
  const content = readFileSync(join(dist, 'assets', file), 'utf8');
  if (file.endsWith('.js')) {
    html = html.replace(
      new RegExp(`<script[^>]*src="[^"]*${file}"[^>]*></script>`),
      `<script type="module">\n${content}\n</script>`,
    );
  } else if (file.endsWith('.css')) {
    html = html.replace(new RegExp(`<link[^>]*href="[^"]*${file}"[^>]*>`), `<style>\n${content}\n</style>`);
  }
}

// Im Einzeldatei-Modus gibt es keine Nebendateien (Manifest/Icons).
html = html.replace(/<link rel="manifest"[^>]*>/, '').replace(/<link rel="apple-touch-icon"[^>]*>/, '');

mkdirSync(out, { recursive: true });
writeFileSync(join(out, 'lernbruecke.html'), html);
console.log(`inline build -> ${join(out, 'lernbruecke.html')}`);
