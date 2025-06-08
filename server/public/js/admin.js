let currentEditingUserId = null;
let allUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
  // Carica gli utenti
  await loadUsers();
  // Setup form submit
  document.getElementById('userForm').addEventListener('submit', handleUserSubmit);
});
    
async function loadUsers() {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
        
    if (!response.ok) {
      throw new Error('Errore nel caricamento utenti');
    }
        
        allUsers = await response.json();
        displayUsers(allUsers);
        updateStats();
        
      } catch (error) {
        console.error('Errore nel caricamento utenti:', error);
        document.getElementById('users-loading').innerHTML = 'Errore nel caricamento utenti';
      }
    }
    
    function displayUsers(users) {
      const tbody = document.getElementById('users-tbody');
      tbody.innerHTML = '';
      
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.email}</td>
          <td><span class="role-badge role-${user.role}">${user.role}</span></td>
          <td>${user._id}</td>
          <td>
            <button class="btn btn-warning" onclick="editUser('${user._id}')">✏️ Modifica</button>
            <button class="btn btn-danger" onclick="deleteUser('${user._id}', '${user.email}')">🗑️ Elimina</button>
          </td>
        `;
        tbody.appendChild(row);
      });
      
      document.getElementById('users-loading').style.display = 'none';
      document.getElementById('users-content').style.display = 'block';
    }
    
    function updateStats() {
      const totalUsers = allUsers.length;
      const totalAdmins = allUsers.filter(u => u.role === 'admin').length;
      const totalDelegati = allUsers.filter(u => u.role === 'delegato').length;
      
      document.getElementById('total-users').textContent = totalUsers;
      document.getElementById('total-admins').textContent = totalAdmins;
      document.getElementById('total-delegati').textContent = totalDelegati;
    }
    
    function openAddUserModal() {
      currentEditingUserId = null;
      document.getElementById('modal-title').textContent = 'Aggiungi Nuovo Utente';
      document.getElementById('modal-submit').textContent = 'Aggiungi';
      document.getElementById('userForm').reset();
      document.getElementById('modal-password').required = true;
      document.getElementById('userModal').style.display = 'block';
    }
    
    function editUser(userId) {
      const user = allUsers.find(u => u._id === userId);
      if (!user) return;
      
      currentEditingUserId = userId;
      document.getElementById('modal-title').textContent = 'Modifica Utente';
      document.getElementById('modal-submit').textContent = 'Salva Modifiche';
      document.getElementById('modal-email').value = user.email;
      document.getElementById('modal-password').value = '';
      document.getElementById('modal-password').required = false;
      document.getElementById('modal-role').value = user.role;
      document.getElementById('userModal').style.display = 'block';
    }
    
    function closeUserModal() {
      document.getElementById('userModal').style.display = 'none';
      currentEditingUserId = null;
    }
    
    async function handleUserSubmit(e) {
      e.preventDefault();
      
      const email = document.getElementById('modal-email').value;
      const password = document.getElementById('modal-password').value;
      const role = document.getElementById('modal-role').value;
      
      const token = localStorage.getItem('token');
      
      try {
        let response;
        const userData = { email, role };
        
        if (password) {
          userData.password = password;
        }
        
        if (currentEditingUserId) {
          // Modifica utente esistente
          response = await fetch(`/api/users/${currentEditingUserId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });
        } else {
          // Crea nuovo utente
          if (!password) {
            alert('La password è obbligatoria per i nuovi utenti');
            return;
          }
          response = await fetch(`/api/users`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
          });
        }
        
        const result = await response.json();
        
        if (!response.ok) {
          alert(result.message || 'Errore nell\'operazione');
          return;
        }
        
        alert(currentEditingUserId ? 'Utente modificato con successo!' : 'Utente creato con successo!');
        closeUserModal();
        await loadUsers();
        
      } catch (error) {
        console.error('Errore nell\'operazione:', error);
        alert('Errore di rete');
      }
    }
    
    async function deleteUser(userId, email) {
      if (!confirm(`Sei sicuro di voler eliminare l'utente ${email}?`)) {
        return;
      }
      
      const token = localStorage.getItem('token');
      
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          alert(result.message || 'Errore nell\'eliminazione');
          return;
        }
        
        alert('Utente eliminato con successo!');
        await loadUsers();
        
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error);
        alert('Errore di rete');
      }
    }
    
    // Chiudi modal cliccando fuori
    window.onclick = function(event) {
      const modal = document.getElementById('userModal');
      if (event.target === modal) {
        closeUserModal();
      }    
}
