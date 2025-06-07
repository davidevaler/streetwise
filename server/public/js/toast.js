function showToast(message="", tipo = 'invisible', lifeSpan = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) {
    console.error('Toast container not found!');
    return;
  }

  toast.className = `toast toast-${tipo}`;
  toast.textContent = message;

  setTimeout(() => {
    toast.style.opacity = '1';
  }, 100);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.addEventListener('transitionend', () => {
      toast.className = 'toast-invisible';
      toast.textContent = "";
      toast.style.opacity = 0;
    }, { once: true });
  }, lifeSpan);
}



