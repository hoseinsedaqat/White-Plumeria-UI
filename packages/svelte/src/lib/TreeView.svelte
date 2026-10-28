<script lang="ts">
  interface Node {
    id: string;
    label: string;
    children?: Node[];
  }
  let { label, nodes, onselect }: { label: string; nodes: Node[]; onselect?: (id: string) => void } = $props();
  let expanded = $state<string[]>([]);
  let selected = $state<string | null>(null);

  function toggle(node: Node) {
    selected = node.id;
    onselect?.(node.id);
    if (!node.children) return;
    expanded = expanded.includes(node.id) ? expanded.filter((id) => id !== node.id) : [...expanded, node.id];
  }
</script>

{#snippet branch(items: Node[])}
  <ul role="group">
    {#each items as node (node.id)}
      <li role="treeitem" aria-expanded={node.children ? expanded.includes(node.id) : undefined} aria-selected={selected === node.id}>
        <button type="button" class="wpl-tree-item" onclick={() => toggle(node)}>{node.label}</button>
        {#if node.children && expanded.includes(node.id)}
          {@render branch(node.children)}
        {/if}
      </li>
    {/each}
  </ul>
{/snippet}

<ul class="wpl-tree" role="tree" aria-label={label}>
  {@render branch(nodes)}
</ul>
