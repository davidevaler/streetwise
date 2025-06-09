let currentEditingCommunicationId = null;
let allCommunications = [];

// Carica le comunicazioni all'avvio della pagina
(async () => {
  try {
    await loadCommunications();
  } catch (err) {
    showToast("Errore nel caricamento delle comunicazioni", 'error');
    console.error(err);
  }
})();

document.getElementById('communicationForm')
.addEventListener('submit', handleCommunicationSubmit);

async function loadCommunications() {     
  try {
    const response = await fetch(`/api/comunicazioni/delegati/all`);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
          console.error("Autenticazione fallita, prova a ri-autenticarti");
          window.location.href = '/';
          return;
      }
      const errorData = await response.json();
      throw new Error(errorData.message || 'Errore nel caricamento comunicazioni');
    }

    allCommunications = await response.json();
    displayCommunications(allCommunications.data);
    updateCommunicationsStats();

  } catch (error) {
    console.error('Errore nel caricamento comunicazioni:', error);
    document.getElementById('communications-loading').innerHTML = 'Errore nel caricamento comunicazioni';
  }
}

function displayCommunications(communications) {
  const tbody = document.getElementById('communications-tbody');
  tbody.innerHTML = '';
      
  communications.forEach(comm => {
    const row = document.createElement('tr');
    const dataCreazione = new Date(comm.dataCreazione).toLocaleDateString('it-IT');
    const allegatiInfo = comm.allegati.length > 0 ? 
      `${comm.allegati.length} file` : 'Nessun allegato';
        
      row.innerHTML = `
      <td><strong>${comm.titolo}</strong><br><small style="color: #666;">${comm.descrizione.substring(0, 100)}${comm.descrizione.length > 100 ? '...' : ''}</small></td>
      <td>${comm.email}</td>
      <td>${dataCreazione}</td>
      <td>${allegatiInfo}</td>
      <td>
        <button class="btn btn-primary" onclick="viewCommunication('${comm._id}')">👁️ Vedi</button>
        <button class="btn btn-warning" onclick="editCommunication('${comm._id}')">✏️ Modifica</button>
        <button class="btn btn-danger" onclick="deleteCommunication('${comm._id}', '${comm.titolo}')">🗑️ Elimina</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById('communications-loading').style.display = 'none';
  document.getElementById('communications-content').style.display = 'block';
}

function updateCommunicationsStats() {
  document.getElementById('total-communications').textContent = allCommunications.data.length;
}

function openAddCommunicationModal() {
  currentEditingCommunicationId = null;
  document.getElementById('communication-modal-title').textContent = 'Aggiungi Nuova Comunicazione';
  document.getElementById('communication-modal-submit').textContent = 'Aggiungi';
  document.getElementById('communicationForm').reset();
  document.getElementById('existing-attachments').innerHTML = '';
  document.getElementById('keep-attachments-group').style.display = 'none';
  document.getElementById('communicationModal').style.display = 'block';
}

async function editCommunication(commId) {
  try {
    const response = await fetch(`/api/comunicazioni/${commId}`);
        
    if (!response.ok) {
      throw new Error('Errore nel caricamento comunicazione');
    }
        
    const result = await response.json();
    const comm = result.data;
       
    currentEditingCommunicationId = commId;
    document.getElementById('communication-modal-title').textContent = 'Modifica Comunicazione';
    document.getElementById('communication-modal-submit').textContent = 'Salva Modifiche';
    document.getElementById('communication-title').value = comm.titolo;
    document.getElementById('communication-email').value = comm.email;
    document.getElementById('communication-description').value = comm.descrizione;

    // Mostra allegati esistenti
    const existingDiv = document.getElementById('existing-attachments');
    if (comm.allegati && comm.allegati.length > 0) {
      existingDiv.innerHTML = '<strong>Allegati esistenti:</strong><br>' + 
        comm.allegati.map((att, index) => 
        `<a href="/api/comunicazioni/delegati/${commId}/allegato/${index}" target="_blank" style="margin-right: 10px;">${att.nomeFile}</a>`
        ).join('<br>');
      document.getElementById('keep-attachments-group').style.display = 'block';
    } else {
      existingDiv.innerHTML = '';
      document.getElementById('keep-attachments-group').style.display = 'none';
    }
        
    document.getElementById('communicationModal').style.display = 'block';
        
  } catch (error) {
    console.error('Errore nel caricamento comunicazione:', error);
    alert('Errore nel caricamento della comunicazione');
  }
}

function closeCommunicationModal() {
  document.getElementById('communicationModal').style.display = 'none';
  currentEditingCommunicationId = null;
}

async function handleCommunicationSubmit(e) {
  e.preventDefault();
      
  const title = document.getElementById('communication-title').value;
  const email = document.getElementById('communication-email').value;
  const description = document.getElementById('communication-description').value;
  const files = document.getElementById('communication-files').files;
  const keepAttachments = document.getElementById('keep-attachments').checked;
      
  const formData = new FormData();
      
  formData.append('titolo', title);
  formData.append('email', email);
  formData.append('descrizione', description);
      
  if (currentEditingCommunicationId && keepAttachments) {
    formData.append('mantieni_allegati', 'true');
  }
      
  for (let i = 0; i < files.length; i++) {
    formData.append('allegati', files[i]);
  }
      
  try {
    let response;
    const url = currentEditingCommunicationId 
      ? `/api/comunicazioni/delegati/${currentEditingCommunicationId}`
      : `/api/comunicazioni/delegati`;
        
    response = await fetch(url, {
      method: currentEditingCommunicationId ? 'PUT' : 'POST',
      body: formData
    });
        
    const result = await response.json();
        
    if (!response.ok) {
      alert(result.message || 'Errore nell\'operazione');
      return;
    }
        
    alert(currentEditingCommunicationId ? 'Comunicazione modificata con successo!' : 'Comunicazione creata con successo!');
    closeCommunicationModal();
    await loadCommunications();        
  } catch (error) {
    console.error('Errore nell\'operazione:', error);
    alert('Errore di rete');
  }
}

async function deleteCommunication(commId, title) {
  if (!confirm(`Sei sicuro di voler eliminare la comunicazione "${title}"?`)) {
    return;
  }
      
  try {
    const response = await fetch(`/api/comunicazioni/delegati/${commId}`, {
      method: 'DELETE'
    });
        
    const result = await response.json();
        
    if (!response.ok) {
      alert(result.message || 'Errore nell\'eliminazione');
      return;
    }
        
    alert('Comunicazione eliminata con successo!');
    await loadCommunications();
       
  } catch (error) {
    console.error('Errore nell\'eliminazione:', error);
    alert('Errore di rete');
  }
}

async function viewCommunication(commId) {     
  try {
    const response = await fetch(`/api/comunicazioni/${commId}`);
        
    if (!response.ok) {
      throw new Error('Errore nel caricamento comunicazione');
    }
        
    const result = await response.json();
    const comm = result.data;
       
    let allegatiHtml = '';
    if (comm.allegati && comm.allegati.length > 0) {
      allegatiHtml = '<br><strong>Allegati:</strong><br>' + 
      comm.allegati.map((att, index) => 
        `<a href="/api/comunicazioni/delegati/${commId}/allegato/${index}" target="_blank" style="margin-right: 10px; color: #667eea;">${att.nomeFile}</a>`
      ).join('<br>');
    }
        
    const dataCreazione = new Date(comm.dataCreazione).toLocaleString('it-IT');
        
    alert(`COMUNICAZIONE DETTAGLI\n\nTitolo: ${comm.titolo}\nEmail: ${comm.email}\nData: ${dataCreazione}\n\nDescrizione:\n${comm.descrizione}${comm.allegati.length > 0 ? '\n\nAllegati: ' + comm.allegati.map(a => a.nomeFile).join(', ') : ''}`);
        
  } catch (error) {
    console.error('Errore nel caricamento comunicazione:', error);
    alert('Errore nel caricamento della comunicazione');
  }
}

// Chiudi modal comunicazioni cliccando fuori
window.onclick = function(event) {
  const commModal = document.getElementById('communicationModal');
  if (event.target === commModal) {
    closeCommunicationModal();
  }
}