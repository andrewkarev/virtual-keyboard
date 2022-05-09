export function set(key, value) {
  localStorage.setItem(key, value);
}

export function get(key, defaultValue = 'ru') {
  return localStorage.getItem(key) || defaultValue;
}
