class CommunicationsCarousel {
  constructor() {
    this.comunicazioni = [];
    this.currentIndex = 0;
    this.itemsPerPage = 3;
    this.autoScrollInterval = null;
    this.autoScrollDelay = 5000; // 5 secondi
    this.isHovered = false;
    
    this.init();
  }

  async init() {
    try {
      await this.loadComunicazioni();
      this.createCarousel();
      this.bindEvents();
      this.startAutoScroll();
    } catch (error) {
      console.error('Errore nell\'inizializzazione del carosello:', error);
      this.showError();
    }
  }

  async loadComunicazioni() {
    try {
      const response = await fetch('/api/comunicazioni/recenti?limite=15');
      const result = await response.json();

      if (result.success && result.data) {
        this.comunicazioni = result.data;
      } else {
        throw new Error('Errore nel caricamento delle comunicazioni');
      }
    } catch (error) {
      console.error('Errore nel caricamento:', error);
      this.comunicazioni = [];
    }
  }

  createCarousel() {
    const divComm = document.getElementById('comm-div');
    if (!divComm) return;

    // Svuota il contenuto esistente
    divComm.innerHTML = '';

    if (this.comunicazioni.length === 0) {
      divComm.innerHTML = `
        <div class="carousel-container">
          <div class="carousel-header">
            <div class="big"></div><h3>Comunicazioni</h3>
          </div>
          <div class="no-communications">
            <p>Nessuna comunicazione disponibile al momento.</p>
          </div>
        </div>
      `;
      return;
    }

    const carouselHTML = `
      <div class="carousel-container">
        <div class="carousel-header">
          <div class="big"></div><h3>Comunicazioni</h3>
          <div class="carousel-indicators">
            <span class="indicator">${this.currentIndex + 1}</span> / 
            <span class="total">${Math.ceil(this.comunicazioni.length / this.itemsPerPage)}</span>
          </div>
        </div>
        
        <div class="carousel-wrapper">
          <button class="carousel-btn carousel-prev" id="carousel-prev">‹</button>
          
          <div class="carousel-content" id="carousel-content">
            <div class="carousel-track" id="carousel-track">
              ${this.generateCommunicationsHTML()}
            </div>
          </div>
          
          <button class="carousel-btn carousel-next" id="carousel-next">›</button>
        </div>
        
        <div class="carousel-dots" id="carousel-dots">
          ${this.generateDotsHTML()}
        </div>
      </div>
    `;

    divComm.innerHTML = carouselHTML;
    this.updateCarousel();
  }

  generateCommunicationsHTML() {
    const pages = this.getPages();
    return pages.map((page, pageIndex) => `
      <div class="carousel-page ${pageIndex === 0 ? 'active' : ''}">
        ${page.map(comunicazione => this.generateCommunicationCard(comunicazione)).join('')}
      </div>
    `).join('');
  }

  generateCommunicationCard(comunicazione) {
    const data = new Date(comunicazione.dataCreazione);
    const dataFormatted = data.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    // Tronca la descrizione a 3 righe (circa 150 caratteri)
    const maxLength = 150;
    let descrizioneBreve = comunicazione.descrizione;
    if (descrizioneBreve.length > maxLength) {
      descrizioneBreve = descrizioneBreve.substring(0, maxLength).trim();
      // Trova l'ultimo spazio per non tagliare una parola
      const lastSpace = descrizioneBreve.lastIndexOf(' ');
      if (lastSpace > 0) {
        descrizioneBreve = descrizioneBreve.substring(0, lastSpace);
      }
      descrizioneBreve += '...';
    }

    // Genera indicatore allegati se presenti
    let allegatiBadge = '';
    if (comunicazione.allegati && comunicazione.allegati.length > 0) {
      const immagini = comunicazione.allegati.filter(a => this.isImage(a.contentType)).length;
      const documenti = comunicazione.allegati.length - immagini;
      
      let badgeText = '';
      if (immagini > 0 && documenti > 0) {
        badgeText = `📎 ${immagini} img, ${documenti} doc`;
      } else if (immagini > 0) {
        badgeText = `🖼️ ${immagini} immagine${immagini > 1 ? 'i' : ''}`;
      } else if (documenti > 0) {
        badgeText = `📄 ${documenti} documento${documenti > 1 ? 'i' : ''}`;
      }
      
      allegatiBadge = `<div class="communication-attachments-badge">${badgeText}</div>`;
    }

    return `
      <div class="communication-card" data-id="${comunicazione._id}">
        <div class="communication-header">
          <h4 class="communication-title">${comunicazione.titolo}</h4>
          <span class="communication-date">${dataFormatted}</span>
        </div>
        <p class="communication-description">${descrizioneBreve}</p>
        ${allegatiBadge}
      </div>
    `;
  }

  generateDotsHTML() {
    const totalPages = Math.ceil(this.comunicazioni.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => 
      `<button class="carousel-dot ${i === 0 ? 'active' : ''}" data-page="${i}"></button>`
    ).join('');
  }

  getPages() {
    const pages = [];
    for (let i = 0; i < this.comunicazioni.length; i += this.itemsPerPage) {
      pages.push(this.comunicazioni.slice(i, i + this.itemsPerPage));
    }
    return pages;
  }

  bindEvents() {
    // Pulsanti navigazione
    const prevBtn = document.getElementById('carousel-prev');
    const nextBtn = document.getElementById('carousel-next');
    
    if (prevBtn) prevBtn.addEventListener('click', () => this.prevPage());
    if (nextBtn) nextBtn.addEventListener('click', () => this.nextPage());

    // Dots navigazione
    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach(dot => {
      dot.addEventListener('click', (e) => {
        const pageIndex = parseInt(e.target.dataset.page);
        this.goToPage(pageIndex);
      });
    });

    // Hover per fermare l'auto-scroll
    const carouselContainer = document.querySelector('.carousel-container');
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', () => {
        this.isHovered = true;
        this.stopAutoScroll();
      });
      
      carouselContainer.addEventListener('mouseleave', () => {
        this.isHovered = false;
        this.startAutoScroll();
      });
    }

    // Click sulle comunicazioni per espandere
    const communicationCards = document.querySelectorAll('.communication-card');
    communicationCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        this.expandCommunication(id);
      });
    });
  }

  prevPage() {
    const totalPages = Math.ceil(this.comunicazioni.length / this.itemsPerPage);
    this.currentIndex = this.currentIndex === 0 ? totalPages - 1 : this.currentIndex - 1;
    this.updateCarousel();
    this.resetAutoScroll();
  }

  nextPage() {
    const totalPages = Math.ceil(this.comunicazioni.length / this.itemsPerPage);
    this.currentIndex = (this.currentIndex + 1) % totalPages;
    this.updateCarousel();
    this.resetAutoScroll();
  }

  goToPage(pageIndex) {
    this.currentIndex = pageIndex;
    this.updateCarousel();
    this.resetAutoScroll();
  }

  updateCarousel() {
    const track = document.getElementById('carousel-track');
    const dots = document.querySelectorAll('.carousel-dot');
    const indicator = document.querySelector('.carousel-indicators .indicator');
    
    if (track) {
      const translateX = -this.currentIndex * 100;
      track.style.transform = `translateX(${translateX}%)`;
    }

    // Aggiorna dots
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === this.currentIndex);
    });

    // Aggiorna indicatore
    if (indicator) {
      indicator.textContent = this.currentIndex + 1;
    }
  }

  startAutoScroll() {
    if (this.comunicazioni.length <= this.itemsPerPage) return;
    
    this.stopAutoScroll();
    this.autoScrollInterval = setInterval(() => {
      if (!this.isHovered) {
        this.nextPage();
      }
    }, this.autoScrollDelay);
  }

  stopAutoScroll() {
    if (this.autoScrollInterval) {
      clearInterval(this.autoScrollInterval);
      this.autoScrollInterval = null;
    }
  }

  resetAutoScroll() {
    this.stopAutoScroll();
    setTimeout(() => {
      if (!this.isHovered) {
        this.startAutoScroll();
      }
    }, 1000);
  }

  isImage(contentType) {
    return contentType && contentType.startsWith('image/');
  }

  isDocument(contentType) {
    return contentType && !contentType.startsWith('image/');
  }

  getFileIcon(contentType, fileName) {
    if (this.isImage(contentType)) {
      return '🖼️';
    }
    
    if (contentType) {
      if (contentType.includes('pdf')) return '📄';
      if (contentType.includes('word') || contentType.includes('document')) return '📝';
      if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
      if (contentType.includes('powerpoint') || contentType.includes('presentation')) return '📈';
      if (contentType.includes('zip') || contentType.includes('rar')) return '🗜️';
      if (contentType.includes('text')) return '📃';
      if (contentType.includes('audio')) return '🎵';
      if (contentType.includes('video')) return '🎬';
    }
    
    // Fallback basato sull'estensione del file
    if (fileName) {
      const ext = fileName.split('.').pop().toLowerCase();
      switch (ext) {
        case 'pdf': return '📄';
        case 'doc':
        case 'docx': return '📝';
        case 'xls':
        case 'xlsx': return '📊';
        case 'ppt':
        case 'pptx': return '📈';
        case 'zip':
        case 'rar': return '🗜️';
        case 'txt': return '📃';
        case 'mp3':
        case 'wav': return '🎵';
        case 'mp4':
        case 'avi': return '🎬';
        default: return '📎';
      }
    }
    
    return '📎';
  }

  createDataUrl(allegato) {
    if (!allegato.dati || !allegato.dati.base64) {
      console.error('Dati base64 non trovati per l\'allegato:', allegato.nomeFile);
      return null;
    }
    
    return `data:${allegato.contentType};base64,${allegato.dati.base64}`;
  }

  downloadFile(allegato) {
    const dataUrl = this.createDataUrl(allegato);
    if (!dataUrl) return;
    
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = allegato.nomeFile;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  expandCommunication(id) {
    const comunicazione = this.comunicazioni.find(c => c._id === id);
    if (!comunicazione) return;

    // Genera HTML per gli allegati
    let allegatiHTML = '';
    if (comunicazione.allegati && comunicazione.allegati.length > 0) {
      const immagini = comunicazione.allegati.filter(a => this.isImage(a.contentType));
      const documenti = comunicazione.allegati.filter(a => this.isDocument(a.contentType));
      
      allegatiHTML = '<div class="modal-attachments">';
      
      // Sezione immagini
      if (immagini.length > 0) {
        allegatiHTML += '<div class="modal-images-section">';
        allegatiHTML += '<h4 class="attachments-title">📷 Immagini</h4>';
        allegatiHTML += '<div class="modal-images-grid">';
        
        immagini.forEach((img, index) => {
          const dataUrl = this.createDataUrl(img);
          if (dataUrl) {
            allegatiHTML += `
              <div class="modal-image-container">
                <img src="${dataUrl}" alt="${img.nomeFile}" class="modal-image" 
                     onclick="window.open('${dataUrl}', '_blank')" 
                     title="Clicca per aprire a schermo intero">
                <div class="modal-image-caption">${img.nomeFile}</div>
              </div>
            `;
          }
        });
        
        allegatiHTML += '</div></div>';
      }
      
      // Sezione documenti
      if (documenti.length > 0) {
        allegatiHTML += '<div class="modal-documents-section">';
        allegatiHTML += '<h4 class="attachments-title">📎 Documenti</h4>';
        allegatiHTML += '<div class="modal-documents-list">';
        
        documenti.forEach((doc, index) => {
          const icon = this.getFileIcon(doc.contentType, doc.nomeFile);
          allegatiHTML += `
            <div class="modal-document-item" onclick="window.carouselInstance.downloadFile(${JSON.stringify(doc).replace(/"/g, '&quot;')})">
              <span class="document-icon">${icon}</span>
              <span class="document-name">${doc.nomeFile}</span>
              <span class="document-download">⬇️</span>
            </div>
          `;
        });
        
        allegatiHTML += '</div></div>';
      }
      
      allegatiHTML += '</div>';
    }

    // Crea un modal per mostrare la comunicazione completa
    const modal = document.createElement('div');
    modal.className = 'communication-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${comunicazione.titolo}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p class="modal-date">
            ${new Date(comunicazione.dataCreazione).toLocaleDateString('it-IT', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <div class="modal-description">
            ${comunicazione.descrizione.replace(/\n/g, '<br>')}
          </div>
          ${allegatiHTML}
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    // Salva riferimento per il download dei documenti
    window.carouselInstance = this;

    // Eventi per chiudere il modal
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
      window.carouselInstance = null;
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        window.carouselInstance = null;
      }
    });
  }

  showError() {
    const divComm = document.querySelector('.bottom');
    if (divComm) {
      divComm.innerHTML = `
        <div class="carousel-container">
          <div class="carousel-header">
            <div class="big"></div><h3>Comunicazioni</h3>
          </div>
          <div class="carousel-error">
            <p>⚠️ Errore nel caricamento delle comunicazioni. Riprova più tardi.</p>
          </div>
        </div>
      `;
    }
  }
}

// Inizializza il carosello quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  new CommunicationsCarousel();
});