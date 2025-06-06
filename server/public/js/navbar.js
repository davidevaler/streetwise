document.addEventListener('DOMContentLoaded', function() {
  const loginToggleBtn = document.getElementById('loginToggleBtn');
  const loginDropdown = document.getElementById('login-dropdown');

  if (loginToggleBtn && loginDropdown) {
    loginToggleBtn.addEventListener('click', function() {
      loginDropdown.classList.toggle('hidden');
    });

    // Chiudi il dropdown se si clicca fuori
    document.addEventListener('click', function(event) {
      if (!loginDropdown.contains(event.target) && !loginToggleBtn.contains(event.target)) {
        loginDropdown.classList.add('hidden');
      }
    });
  }
});
