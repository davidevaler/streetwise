function showToast(message, tipo = 'info', lifeSpan = 3000) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    console.error('Toast container not found!');
    return;
  }

  const toast = document.createElement('div');
  toast.className = `toast ${tipo}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '1';
  }, 100);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.addEventListener('transitionend', () => {
      toast.remove();
    }, { once: true });
  }, lifeSpan);
}

