import { readFileSync, writeFileSync } from 'node:fs';

type TokenManifest = {
  themes: Record<string, Record<string, string>>;
  primitives: Record<string, Record<string, string> | string>;
  typography: Record<string, string>;
  spacing: Record<string, number>;
  radius: Record<string, number>;
  motion: Record<string, number | string>;
};

const manifest = JSON.parse(readFileSync('design/buytivaDesignTokens.json', 'utf8')) as TokenManifest;
const css = buildCssTokens(manifest);
const dart = buildDartTokens(manifest);
writeFileSync('apps/web/src/lib/styles/design-tokens.generated.css', css);
writeFileSync('apps/mobile/lib/core/design_system/design_tokens.g.dart', dart);

function buildCssTokens(tokens: TokenManifest): string {
  const blocks = Object.entries(tokens.themes).map(([theme, values]) => {
    const selector = theme === 'light' ? ':root, [data-theme="light"]' : '[data-theme="dark"]';
    ensureUnique(Object.keys(values).map(toCssTokenName), `CSS ${theme}`);
    const declarations = Object.entries(values).map(([key, value]) => `--${toCssTokenName(key)}:${value};`);
    return `${selector}{${declarations.join('')}}`;
  });
  const primitiveValues = Object.entries(tokens.primitives).flatMap(([family, values]) => {
    if (typeof values === 'string') return [[`--primitive-${family}`, values]];
    return Object.entries(values).map(([shade, value]) => [`--primitive-${family}-${shade}`, value]);
  });
  const primitives = primitiveValues.map(([name, value]) => `${name}:${value};`).join('');
  const spacing = Object.entries(tokens.spacing).map(([key, value]) => `--space-${key}:${value}px;`).join('');
  const radius = Object.entries(tokens.radius).map(([key, value]) => `--radius-${key}:${value}px;`).join('');
  const motion = Object.entries(tokens.motion).filter(([key]) => key !== 'reducedMotion').map(([key, value]) => {
    const name = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replace(/-ms$/, '');
    return `--motion-${name}:${typeof value === 'number' ? `${value}ms` : value};`;
  }).join('');
  const fonts = `--font-display:'${tokens.typography.displayFamily}';--font-body:'${tokens.typography.bodyFamily}';`;
  return `${blocks.join('')}\n:root{${primitives}${spacing}${radius}${motion}${fonts}}\n`;
}

function toCssTokenName(tokenName: string): string {
  return tokenName.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`).replaceAll('.', '-');
}

function buildDartTokens(tokens: TokenManifest): string {
  const colors = Object.entries(tokens.themes).flatMap(([theme, values]) =>
    Object.entries(values).map(([key, value]) => `  static const ${toDartName(theme + '.' + key)} = Color(${toDartColor(value)});`)
  );
  ensureUnique(colors.map((line) => line.match(/static const (\w+)/)?.[1] ?? line), 'Dart');
  const motion = Object.entries(tokens.motion).filter(([key, value]) => key.endsWith('Ms') && typeof value === 'number').map(([key, value]) => `  static const ${key.replace(/Ms$/, '')}Ms = ${value};`);
  return `import 'package:flutter/material.dart';\n\nclass BuytivaDesignTokens {\n${colors.join('\n')}\n${motion.join('\n')}\n}\n`;
}

function ensureUnique(names: string[], target: string): void {
  const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
  if (duplicates.length) throw new Error(`${target} token names collide: ${[...new Set(duplicates)].join(', ')}`);
}

function toDartColor(value: string): string {
  const hex = value.slice(1);
  return hex.length === 8 ? `0x${hex.slice(6)}${hex.slice(0, 6)}` : `0xFF${hex}`;
}

function toDartName(value: string): string {
  const [theme, ...tokens] = value.split('.');
  return theme + tokens.map((token) => token.split(/[^a-zA-Z0-9]/).map((part) => part[0].toUpperCase() + part.slice(1)).join('')).join('');
}
