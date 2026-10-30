import { catalog } from '@white-plumeria/core';
import type { FrameworkId, ValidationResult } from './types.ts';

const forbidden = [
  { pattern: /\beval\s*\(/, message: 'eval() is not allowed in generated examples.' },
  { pattern: /\bnew\s+Function\s*\(/, message: 'Function constructor is not allowed.' },
  { pattern: /innerHTML\s*=/, message: 'innerHTML assignment is not allowed.' },
  { pattern: /document\.write\s*\(/, message: 'document.write is not allowed.' },
  { pattern: /javascript:/i, message: 'javascript: URLs are not allowed.' },
  { pattern: /<script\b/i, message: 'Script tags are not allowed in generated markup.' },
];

export function validateGeneratedCode(code: string, framework: FrameworkId): ValidationResult {
  const errors: string[] = [];
  for (const rule of forbidden) {
    if (rule.pattern.test(code)) errors.push(rule.message);
  }
  const known = new Set(catalog.map((component) => component.name));
  if (framework !== 'html') {
    const imported = code.match(/import\s*\{([^}]+)\}\s*from\s*["'](@white-plumeria\/[^"']+)["']/);
    if (!imported) {
      errors.push('Generated code must import from an @white-plumeria package.');
    } else if (framework === 'angular' && imported[2] !== '@white-plumeria/angular') {
      errors.push('Angular examples must import @white-plumeria/angular.');
    } else if (framework === 'solid' && imported[2] !== '@white-plumeria/solid') {
      errors.push('Solid examples must import @white-plumeria/solid.');
    } else if (framework === 'preact' && imported[2] !== '@white-plumeria/preact') {
      errors.push('Preact examples must import @white-plumeria/preact.');
    } else if (!imported[2]?.startsWith('@white-plumeria/')) {
      errors.push('Import source is outside the White Plumeria scope.');
    }
    const importedNames = imported?.[1]?.split(',').map((name) => name.trim()).filter(Boolean) ?? [];
    for (const name of importedNames) {
      if (!known.has(name)) errors.push(`Imported name ${name} is not in the component catalog.`);
    }
    if (framework === 'angular') {
      if (!/\bwpl[A-Z]|\bwpl-/.test(code)) errors.push('Angular examples must use a wpl selector.');
    } else {
      for (const match of code.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
        const name = match[1];
        if (name && !known.has(name)) errors.push(`JSX component ${name} is not in the catalog.`);
      }
    }
  } else if (!/wpl-/.test(code)) {
    errors.push('HTML examples must use wpl- classes.');
  }
  return { ok: errors.length === 0, errors };
}
