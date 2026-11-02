<script lang="ts">
  import { treeExpandAction } from '@white-plumeria/core';
  import Icon from './Icon.svelte';

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
    if (!node.children?.length) return;
    expanded = expanded.includes(node.id) ? expanded.filter((id) => id !== node.id) : [...expanded, node.id];
  }

  function onKey(event: KeyboardEvent, node: Node) {
    if (!node.children?.length) return;
    const action = treeExpandAction(
      event.key,
      event.currentTarget instanceof HTMLElement ? event.currentTarget : null,
      expanded.includes(node.id),
    );
    if (!action) return;
    event.preventDefault();
    if (action !== 'stay') toggle(node);
  }
</script>

{#snippet branch(items: Node[])}
  {#each items as node (node.id)}
    {@const open = expanded.includes(node.id)}
    {@const hasChildren = Boolean(node.children?.length)}
    <li class="wpl-tree-item" role="none">
      <button
        type="button"
        class="wpl-tree-row"
        role="treeitem"
        aria-expanded={hasChildren ? open : undefined}
        aria-selected={selected === node.id}
        onclick={() => toggle(node)}
        onkeydown={(event) => onKey(event, node)}
      >
        {#if hasChildren}
          <Icon name={open ? 'chevronDown' : 'chevronRight'} />
        {:else}
          <span class="wpl-tree-spacer" aria-hidden="true"></span>
        {/if}
        {node.label}
      </button>
      {#if hasChildren && open}
        <ul class="wpl-tree-children" role="group">
          {@render branch(node.children ?? [])}
        </ul>
      {/if}
    </li>
  {/each}
{/snippet}

<ul class="wpl-tree" role="tree" aria-label={label}>
  {@render branch(nodes)}
</ul>
