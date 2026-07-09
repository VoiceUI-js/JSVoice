/**
 * Join class names, filtering falsy values.
 * @param {...(string|false|null|undefined|0)} parts
 * @returns {string}
 */
export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}

export default classNames;
