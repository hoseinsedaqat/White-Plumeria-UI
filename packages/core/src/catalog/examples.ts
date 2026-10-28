import type { FrameworkExamples } from './types.ts';

export function examples(
  name: string,
  body: { react: string; vue: string; svelte: string; html: string },
): FrameworkExamples {
  return {
    html: body.html,
    react: `import { ${name} } from "@white-plumeria/react";\nimport "@white-plumeria/styles";\n\nexport function Example() {\n  return (\n    ${body.react}\n  );\n}`,
    vue: `<script setup lang="ts">\nimport { ${name} } from "@white-plumeria/vue";\nimport "@white-plumeria/styles";\n</script>\n\n<template>\n  ${body.vue}\n</template>\n`,
    svelte: `<script lang="ts">\n  import { ${name} } from "@white-plumeria/svelte";\n  import "@white-plumeria/styles";\n</script>\n\n${body.svelte}\n`,
  };
}
