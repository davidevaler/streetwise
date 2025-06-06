window.SERVER_URL = "http://localhost:5001";

function apiFetch(path, options) {
  return fetch(`${window.SERVER_URL}${path}`, options);
}
