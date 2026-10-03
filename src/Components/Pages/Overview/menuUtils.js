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

/** The translated name of a menu node (`menu.<Name>`), or the label the menu came with. */
export const menuLabel = (t, node) => {
  const key = `menu.${node.name}`;
  const text = t(key);
  return text === key ? node.label : text;
};

const MONTHS = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  id: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
};

/** "2 Nov 2026" in both languages (a fixed month table, so the two never differ in shape). */
export const formatDay = (value, lang) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getDate()} ${(MONTHS[lang] ?? MONTHS.en)[date.getMonth()]} ${date.getFullYear()}`;
};
