document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.querySelector(".login-btn");
  const loginDropdown = document.getElementById("login-dropdown");
  const loginForm = document.getElementById("loginForm");

  // Mostra/nasconde la tendina login
  loginBtn.addEventListener("click", () => {
    loginDropdown.classList.toggle("hidden");
  });

  // Login JWT
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
      const res = await fetch(`${SERVER_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login fallito");
        return;
      }

      // Salva token e dati utente
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      alert("Login effettuato con successo!");
      loginDropdown.classList.add("hidden");

      // Controlla il ruolo e reindirizza
      if (data.user.role === "admin") {
        window.location.href = "/admin";
      } else {
        // Per i delegati rimane sulla stessa pagina
        location.reload();
      }

    } catch (err) {
      alert("Errore di rete");
      console.error(err);
    }
  });
});