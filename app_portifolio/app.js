/**
 * app.js
 * Ponto de entrada e gerenciador de estado da aplicação.
 */

class App {
    constructor() {
        this.appContent = document.getElementById('app-content');
        this.totalStorageGB = 120;
        this.state = this.loadState();
        this.init();
    }

    loadState() {
        try {
            const saved = localStorage.getItem('safe_picture_state');
            if (saved) return JSON.parse(saved);
        } catch (e) {
            console.error("Erro no localStorage:", e);
        }
        return {
            usedStorageMB: 0,
            albums: [
                { id: 1, name: 'Ensaio Casamento', photoCount: 0, photos: [] }
            ]
        };
    }

    saveState() {
        localStorage.setItem('safe_picture_state', JSON.stringify(this.state));
    }

    init() {
        console.log("Safe Picture App Inicializado!");
        this.setupEventListeners();
    }

    setupEventListeners() {
        console.log("Configurando ouvintes de eventos...");
        
        // Seleciona os botões por ID ou classe para garantir que funcionem
        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');

        if (btnLogin) {
            btnLogin.onclick = () => {
                console.log("Botão Login clicado");
                this.showLogin();
            };
        }
        if (btnSignup) {
            btnSignup.onclick = () => {
                console.log("Botão Começar clicado");
                this.showLogin();
            };
        }
    }

    showLogin() {
        this.appContent.innerHTML = `
            <div style="max-width: 400px; margin: 4rem auto; padding: 2rem; background: var(--color-bg-secondary); border-radius: 16px; border: 1px solid var(--color-border); animation: fadeIn 0.5s ease;">
                <h2 style="margin-bottom: 1.5rem; text-align: center;">Acesse sua Nuvem</h2>
                <form id="login-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--color-text-secondary); font-size: 0.9rem;">Email</label>
                        <input type="email" value="fotografo@exemplo.com" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: white;" required>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--color-text-secondary); font-size: 0.9rem;">Senha</label>
                        <input type="password" value="123456" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: white;" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="justify-content: center; margin-top: 1rem;">Entrar no Painel</button>
                </form>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.showDashboard();
        });
    }

    showDashboard() {
        const usedGB = (this.state.usedStorageMB / 1024).toFixed(2);
        const percent = ((usedGB / this.totalStorageGB) * 100).toFixed(1);

        document.querySelector('.nav-links').innerHTML = `
            <span style="color: var(--color-text-secondary); margin-right: 1rem; align-self: center;">Plano 120GB Ativo</span>
            <button class="btn btn-ghost" onclick="location.reload()">Sair</button>
        `;

        this.appContent.innerHTML = `
            <div style="max-width: 1200px; margin: 2rem auto; padding: 0 2rem; animation: fadeIn 0.5s ease;">
                <!-- Medidor de Armazenamento -->
                <div class="storage-container">
                    <div class="storage-header">
                        <span><i data-lucide="cloud" style="width:16px; vertical-align: middle; margin-right:5px;"></i> Armazenamento em Nuvem</span>
                        <span>${usedGB} GB de ${this.totalStorageGB} GB usados (${percent}%)</span>
                    </div>
                    <div class="storage-bar-bg">
                        <div class="storage-bar-fill" style="width: ${percent}%"></div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Seus Álbuns Profissionais</h2>
                    <button class="btn btn-primary" id="btn-new-album"><i data-lucide="plus"></i> Novo Álbum</button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;" id="albums-grid">
                    ${this.renderAlbums()}
                    <!-- Card para novo -->
                    <div class="album-card-add" id="card-add-album">
                        <i data-lucide="folder-plus" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                        <p>Criar novo álbum</p>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        this.bindDashboardEvents();
    }

    renderAlbums() {
        return this.state.albums.map(album => `
            <div class="album-card" onclick="window.app.showAlbum(${album.id})">
                <div style="height: 200px; background: #2a2a2a; display: flex; align-items: center; justify-content: center;">
                    ${album.photos.length > 0 ? `<img src="${album.photos[0]}" style="width:100%; height:100%; object-fit:cover;">` : `<i data-lucide="image" style="color: var(--color-text-secondary); opacity: 0.5; width: 48px; height: 48px;"></i>`}
                </div>
                <div style="padding: 1.5rem;">
                    <h3 style="margin-bottom: 0.5rem;">${album.name}</h3>
                    <p style="color: var(--color-text-secondary); font-size: 0.9rem;">${album.photos.length} fotos • Cloud Sync OK</p>
                </div>
            </div>
        `).join('');
    }

    bindDashboardEvents() {
        document.getElementById('btn-new-album').addEventListener('click', () => this.createNewAlbum());
        document.getElementById('card-add-album').addEventListener('click', () => this.createNewAlbum());
    }

    createNewAlbum() {
        const name = prompt("Nome do novo álbum:");
        if (name) {
            const newAlbum = {
                id: Date.now(),
                name: name,
                photos: []
            };
            this.state.albums.push(newAlbum);
            this.saveState();
            this.showDashboard();
        }
    }

    showAlbum(id) {
        const album = this.state.albums.find(a => a.id === id);
        this.appContent.innerHTML = `
            <div style="max-width: 1200px; margin: 2rem auto; padding: 0 2rem; animation: fadeIn 0.5s ease;">
                <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem;">
                    <button class="btn btn-ghost" onclick="window.app.showDashboard()"><i data-lucide="arrow-left"></i> Voltar</button>
                    <h1>${album.name}</h1>
                </div>

                <div style="background: var(--color-bg-secondary); padding: 2rem; border-radius: 16px; border: 1px solid var(--color-border); text-align: center;">
                    <i data-lucide="upload-cloud" style="width: 48px; height: 48px; color: var(--color-accent); margin-bottom: 1rem;"></i>
                    <h3>Upload para Nuvem (120GB Disponível)</h3>
                    <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem;">Arraste suas fotos ou clique no botão abaixo</p>
                    <input type="file" id="photo-upload" multiple accept="image/*" style="display: none;">
                    <button class="btn btn-primary" onclick="document.getElementById('photo-upload').click()">Selecionar Fotos</button>
                </div>

                <div class="photo-grid">
                    ${album.photos.map(p => `<div class="photo-item"><img src="${p}"></div>`).join('')}
                </div>
            </div>
        `;

        lucide.createIcons();
        
        document.getElementById('photo-upload').addEventListener('change', (e) => this.handleUpload(e, id));
    }

    handleUpload(event, albumId) {
        const files = Array.from(event.target.files);
        const album = this.state.albums.find(a => a.id === albumId);

        files.forEach(file => {
            // Simular aumento de armazenamento (média de 5MB por foto de alta qualidade)
            const fileSizeMB = 5;
            this.state.usedStorageMB += fileSizeMB;

            // Simular leitura de arquivo para exibição
            const reader = new FileReader();
            reader.onload = (e) => {
                album.photos.push(e.target.result);
                this.saveState();
                this.showAlbum(albumId);
            };
            reader.readAsDataURL(file);
        });

        alert(`${files.length} fotos enviadas para sua nuvem com sucesso!`);
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Adiciona a keyframe de animação ao documento via JS
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .album-card {
        background: var(--color-bg-secondary);
        border-radius: 16px;
        border: 1px solid var(--color-border);
        overflow: hidden;
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .album-card:hover {
        transform: translateY(-5px);
        border-color: var(--color-accent);
    }
    .album-card-add {
        background: var(--color-bg-secondary);
        border-radius: 16px;
        border: 2px dashed var(--color-border);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 280px;
        cursor: pointer;
        color: var(--color-text-secondary);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .album-card-add:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
    }
`;
document.head.appendChild(style);
