import { catalog } from '@white-plumeria/core';
import { knownClassNames } from './markup.ts';
import type { FrameworkId, ValidationResult } from './types.ts';

const forbidden = [
  { pattern: /\beval\s*\(/, message: 'eval() is not allowed in generated examples.' },
  { pattern: /\bnew\s+Function\s*\(/, message: 'Function constructor is not allowed.' },
  { pattern: /innerHTML\s*=/, message: 'innerHTML assignment is not allowed.' },
  { pattern: /document\.write\s*\(/, message: 'document.write is not allowed.' },
  { pattern: /javascript:/i, message: 'javascript: URLs are not allowed.' },
  { pattern: /<script\b/i, message: 'Script tags are not allowed in generated markup.' },
];

const missingPackage =
  /@white-plumeria\/(next|nuxt|sveltekit|solidstart|analog|qwikcity|astro|stimulus|aurelia|ripple|stencil|vanjs|lwc)\b/;

export function validateGeneratedCode(code: string, framework: FrameworkId): ValidationResult {
  const errors: string[] = [];
  for (const rule of forbidden) {
    if (rule.pattern.test(code)) errors.push(rule.message);
  }
  const host = missingPackage.exec(code);
  if (host?.[1]) errors.push(`@white-plumeria/${host[1]} is not a package.`);
  const known = new Set(catalog.map((component) => component.name));
  const markoTags = [
    ...code.matchAll(
      /import\s+([A-Z][A-Za-z0-9]*)\s+from\s*["']@white-plumeria\/marko\/tags\/(wpl-[a-z0-9-]+)\.marko["']/g,
    ),
  ];
  if (framework !== 'html') {
    const imported = code.match(/import\s*\{([^}]+)\}\s*from\s*["'](@white-plumeria\/[^"']+)["']/);
    if (!imported && markoTags.length === 0) {
      errors.push('Generated code must import from an @white-plumeria package.');
    } else if (imported && framework === 'angular' && imported[2] !== '@white-plumeria/angular') {
      errors.push('Angular examples must import @white-plumeria/angular.');
    } else if (framework === 'solid' && imported?.[2] !== '@white-plumeria/solid') {
      errors.push('Solid examples must import @white-plumeria/solid.');
    } else if (framework === 'preact' && imported?.[2] !== '@white-plumeria/preact') {
      errors.push('Preact examples must import @white-plumeria/preact.');
    } else if (framework === 'qwik' && imported?.[2] !== '@white-plumeria/qwik') {
      errors.push('Qwik examples must import @white-plumeria/qwik.');
    } else if (framework === 'lit' && imported?.[2] !== '@white-plumeria/lit') {
      errors.push('Lit examples must import @white-plumeria/lit.');
    } else if (framework === 'alpine' && imported?.[2] !== '@white-plumeria/alpine') {
      errors.push('Alpine examples must import @white-plumeria/alpine.');
    } else if (framework === 'marko' && imported && imported[2] !== '@white-plumeria/marko') {
      errors.push('Marko examples must import @white-plumeria/marko.');
    } else if (framework === 'ember' && imported && imported[2] !== '@white-plumeria/ember') {
      errors.push('Ember examples must import @white-plumeria/ember.');
    } else if (imported && !imported[2]?.startsWith('@white-plumeria/')) {
      errors.push('Import source is outside the White Plumeria scope.');
    }
    const importedNames =
      imported?.[1]
        ?.split(',')
        .map((name) => name.trim())
        .filter(Boolean) ?? [];
    for (const name of importedNames) {
      if (framework === 'lit' && name === 'defineWhitePlumeria') continue;
      if (framework === 'alpine' && (name === 'whitePlumeria' || name === 'pushToast')) continue;
      if (framework === 'marko' && name === 'pushToast') continue;
      if (framework === 'ember' && (name === 'pushToast' || name === 'WhitePlumeriaProvider')) continue;
      if (!known.has(name)) errors.push(`Imported name ${name} is not in the component catalog.`);
    }
    for (const match of markoTags) {
      const name = match[1];
      if (name && !known.has(name))
        errors.push(`Imported name ${name} is not in the component catalog.`);
    }
    if (framework === 'angular') {
      if (!/\bwpl[A-Z]|\bwpl-/.test(code)) errors.push('Angular examples must use a wpl selector.');
    } else {
      for (const match of code.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
        const name = match[1];
        if (framework === 'ember' && name === 'WhitePlumeriaProvider') continue;
        if (name && !known.has(name)) errors.push(`JSX component ${name} is not in the catalog.`);
      }
    }
  } else {
    const classes = [...code.matchAll(/class=(["'])([^"']*)\1/g)];
    if (classes.length === 0) errors.push('HTML examples must use wpl- classes.');
    for (const match of classes) {
      for (const token of (match[2] ?? '').split(/\s+/).filter(Boolean)) {
        if (!knownClassNames().has(token)) errors.push(`Unknown class ${token}.`);
      }
    }
  }
  return { ok: errors.length === 0, errors };
}
