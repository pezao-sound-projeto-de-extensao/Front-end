export function env(key) {
  return window._env_?.[key] ?? import.meta.env[key];
}
