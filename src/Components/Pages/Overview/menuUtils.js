// Helpers over the menu tree the Overview builds from the login menu:
// `{ name, label, path, children }` nodes.

/** The nodes along `names` (a path of menu names), or null when any step is missing. */
export const findPath = (nodes, names) => {
  const node = nodes.find((candidate) => candidate.name === names[0]);
  if (!node) return null;
  if (names.length === 1) return [node];
  const rest = findPath(node.children, names.slice(1));
  return rest ? [node, ...rest] : null;
};

/** The node at the end of `names`, or null. */
export const findNode = (nodes, names) => {
  const path = findPath(nodes, names);
  return path ? path[path.length - 1] : null;
};

/** The path of the first page under a node: where clicking the node goes. */
export const firstLeaf = (node) => (node.children.length ? firstLeaf(node.children[0]) : node.path);
