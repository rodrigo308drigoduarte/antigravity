/**
 * app.js
 * Gerenciador de estado com integração Supabase Cloud.
 */

const SUPABASE_URL = 'https://weirnbpmganvijbiecir.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7cU0Bdx8lPDUd57AvgnMpg_DaV2f9Gj';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

class App {
    constructor() {
        this.appContent = document.getElementById('app-content');
        this.totalStorageGB = 120;
        this.usedStorageMB = 0;
        this.editMode = false;
        this.dragSrcIndex = null;
        this.init();
    }

    async init() {
        console.log("Safe Picture App Conectado ao Supabase!");
        this.setupNavbarListeners();
    }

    setupNavbarListeners() {
        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');
        if (btnLogin) btnLogin.onclick = (e) => { e.preventDefault(); this.showLogin(); };
        if (btnSignup) btnSignup.onclick = (e) => { e.preventDefault(); this.showLogin(); };
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
        const form = document.getElementById('login-form');
        if (form) form.addEventListener('submit', (e) => { e.preventDefault(); this.showDashboard(); });
    }

    async showDashboard() {
        this.appContent.innerHTML = `<div style="text-align:center; padding: 5rem;"><h3>Carregando seus álbuns da nuvem...</h3></div>`;
        const { data: albums, error } = await supabaseClient
            .from('albums').select('*, photos(url)').order('created_at', { ascending: false });

        if (error) { alert("Erro ao conectar com o banco de dados. Verifique se você criou as tabelas no SQL Editor do Supabase."); return; }

        const totalPhotos = albums.reduce((acc, a) => acc + (a.photos ? a.photos.length : 0), 0);
        this.usedStorageMB = totalPhotos * 5;
        const usedGB = (this.usedStorageMB / 1024).toFixed(2);
        const percent = ((usedGB / this.totalStorageGB) * 100).toFixed(1);

        const navLinks = document.querySelector('.nav-links');
        if (navLinks) navLinks.innerHTML = `<span style="color: var(--color-text-secondary); margin-right: 1rem; align-self: center;">Plano 120GB Ativo</span><button class="btn btn-ghost" onclick="location.reload()">Sair</button>`;

        this.appContent.innerHTML = `
            <div style="max-width: 1200px; margin: 2rem auto; padding: 0 2rem; animation: fadeIn 0.5s ease;">
                <div class="storage-container">
                    <div class="storage-header">
                        <span><i data-lucide="cloud" style="width:16px; vertical-align: middle; margin-right:5px;"></i> Armazenamento em Nuvem</span>
                        <span>${usedGB} GB de ${this.totalStorageGB} GB usados (${percent}%)</span>
                    </div>
                    <div class="storage-bar-bg"><div class="storage-bar-fill" style="width: ${percent}%"></div></div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Seus Álbuns na Nuvem</h2>
                    <button class="btn btn-primary" id="btn-new-album"><i data-lucide="plus"></i> Novo Álbum</button>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;" id="albums-grid">
                    ${this.renderAlbumsHtml(albums)}
                    <div class="album-card-add" id="card-add-album"><i data-lucide="folder-plus" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i><p>Criar novo álbum</p></div>
                </div>
            </div>`;
        lucide.createIcons();
        this.bindDashboardEvents();
    }

    renderAlbumsHtml(albums) {
        if (!albums || albums.length === 0) return '';
        return albums.map(album => `
            <div class="album-card" onclick="window.app.showAlbum(${album.id})">
                <div style="height: 200px; background: #2a2a2a; display: flex; align-items: center; justify-content: center;">
                    ${album.photos && album.photos.length > 0
                        ? `<img src="${album.photos[0].url}" style="width:100%; height:100%; object-fit:cover;">`
                        : `<i data-lucide="image" style="color: var(--color-text-secondary); opacity: 0.5; width: 48px; height: 48px;"></i>`}
                </div>
                <div style="padding: 1.5rem;">
                    <h3 style="margin-bottom: 0.5rem;">${album.name}</h3>
                    <p style="color: var(--color-text-secondary); font-size: 0.9rem;">${album.photos ? album.photos.length : 0} fotos • Cloud Sync OK</p>
                </div>
            </div>`).join('');
    }

    bindDashboardEvents() {
        const btn = document.getElementById('btn-new-album');
        const card = document.getElementById('card-add-album');
        if (btn) btn.onclick = () => this.createNewAlbum();
        if (card) card.onclick = () => this.createNewAlbum();
    }

    async createNewAlbum() {
        const name = prompt("Nome do novo álbum profissional:");
        if (name) {
            const { error } = await supabaseClient.from('albums').insert([{ name }]).select();
            if (error) alert("Erro ao criar álbum: " + error.message);
            else this.showDashboard();
        }
    }

    // ===================== ALBUM VIEW COM ORGANIZAÇÃO =====================

    async showAlbum(id) {
        this.editMode = false;
        this.appContent.innerHTML = `<div style="text-align:center; padding: 5rem;"><h3>Abrindo álbum...</h3></div>`;

        const { data: album, error: albumErr } = await supabaseClient.from('albums').select('*').eq('id', id).single();
        const { data: photos, error: photoErr } = await supabaseClient.from('photos').select('*').eq('album_id', id).order('sort_order', { ascending: true });

        if (albumErr || photoErr) { alert("Erro ao carregar álbum."); this.showDashboard(); return; }

        this.currentAlbumId = id;
        this.currentPhotos = photos || [];

        this.renderAlbumView(album);
    }

    renderAlbumView(album) {
        const photos = this.currentPhotos;
        const id = this.currentAlbumId;

        this.appContent.innerHTML = `
            <div style="max-width: 1200px; margin: 2rem auto; padding: 0 2rem; animation: fadeIn 0.5s ease;">
                <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap;">
                    <button class="btn btn-ghost" onclick="window.app.showDashboard()"><i data-lucide="arrow-left"></i> Voltar</button>
                    <h1 style="flex: 1;">${album.name}</h1>
                    <button class="btn ${this.editMode ? 'btn-primary' : 'btn-ghost'}" id="btn-toggle-edit">
                        <i data-lucide="${this.editMode ? 'check' : 'settings-2'}"></i> ${this.editMode ? 'Concluir' : 'Organizar'}
                    </button>
                </div>

                ${this.editMode ? `
                <div class="toolbar" style="background: var(--color-bg-secondary); padding: 1rem 1.5rem; border-radius: 12px; border: 1px solid var(--color-border); margin-bottom: 1.5rem; display: flex; gap: 0.8rem; flex-wrap: wrap; align-items: center;">
                    <span style="color: var(--color-text-secondary); font-size: 0.85rem; margin-right: 0.5rem;">Ordenar:</span>
                    <button class="btn btn-ghost btn-sm" id="btn-sort-az"><i data-lucide="arrow-down-a-z"></i> A → Z</button>
                    <button class="btn btn-ghost btn-sm" id="btn-sort-za"><i data-lucide="arrow-up-z-a"></i> Z → A</button>
                    <span style="color: var(--color-border);">|</span>
                    <button class="btn btn-ghost btn-sm" id="btn-rename-batch"><i data-lucide="pen-line"></i> Renomear em Lote</button>
                    <span style="color: var(--color-text-secondary); font-size: 0.8rem; margin-left: auto;">Arraste as fotos para reordenar</span>
                </div>` : ''}

                <div id="upload-zone" style="background: var(--color-bg-secondary); padding: 2rem; border-radius: 16px; border: 2px dashed var(--color-border); text-align: center; cursor: pointer;">
                    <i data-lucide="upload-cloud" style="width: 36px; height: 36px; color: var(--color-accent); margin-bottom: 0.5rem;"></i>
                    <h3>Upload para Nuvem</h3>
                    <p style="color: var(--color-text-secondary); margin-bottom: 1rem; font-size: 0.9rem;">Clique para selecionar suas fotos</p>
                    <input type="file" id="photo-upload" multiple accept="image/*" style="display: none;">
                    <button class="btn btn-primary" onclick="event.stopPropagation(); document.getElementById('photo-upload').click()">Selecionar Fotos</button>
                    <div id="upload-status" style="margin-top: 0.8rem; color: var(--color-text-secondary); font-size: 0.85rem;"></div>
                </div>

                <div class="photo-grid ${this.editMode ? 'edit-mode' : ''}" id="photo-grid" style="margin-top: 2rem;">
                    ${photos.map((p, i) => this.renderPhotoCard(p, i)).join('')}
                </div>
            </div>`;

        lucide.createIcons();
        this.bindAlbumEvents(id, album);
    }

    renderPhotoCard(photo, index) {
        const name = photo.display_name || this.extractFileName(photo.url);
        if (this.editMode) {
            return `
                <div class="photo-item photo-editable" draggable="true" data-index="${index}" data-id="${photo.id}">
                    <div class="photo-drag-handle"><i data-lucide="grip-vertical"></i></div>
                    <div class="photo-order-badge">${index + 1}</div>
                    <img src="${photo.url}" alt="${name}">
                    <div class="photo-name-bar">
                        <input type="text" class="photo-name-input" value="${name}" data-id="${photo.id}" placeholder="Nome da foto">
                    </div>
                </div>`;
        }
        return `
            <div class="photo-item">
                <img src="${photo.url}" alt="${name}">
                <div class="photo-name-label">${name}</div>
            </div>`;
    }

    extractFileName(url) {
        try {
            const parts = url.split('/');
            const file = parts[parts.length - 1];
            return decodeURIComponent(file.split('.').slice(0, -1).join('.'));
        } catch { return 'Sem nome'; }
    }

    bindAlbumEvents(albumId, album) {
        const uploadInput = document.getElementById('photo-upload');
        if (uploadInput) uploadInput.onchange = (e) => this.handleUpload(e, albumId);

        const zone = document.getElementById('upload-zone');
        if (zone) zone.onclick = () => uploadInput.click();

        const btnEdit = document.getElementById('btn-toggle-edit');
        if (btnEdit) btnEdit.onclick = async () => {
            if (this.editMode) {
                await this.saveAllNames();
                await this.saveOrder();
            }
            this.editMode = !this.editMode;
            this.renderAlbumView(album);
        };

        if (this.editMode) {
            this.bindSortButtons(album);
            this.bindDragDrop(album);
            this.bindNameInputs();
        }
    }

    bindSortButtons(album) {
        const btnAZ = document.getElementById('btn-sort-az');
        const btnZA = document.getElementById('btn-sort-za');
        const btnBatch = document.getElementById('btn-rename-batch');

        if (btnAZ) btnAZ.onclick = () => {
            this.currentPhotos.sort((a, b) => {
                const na = a.display_name || this.extractFileName(a.url);
                const nb = b.display_name || this.extractFileName(b.url);
                return na.localeCompare(nb, 'pt-BR', { numeric: true });
            });
            this.updateSortOrders();
            this.renderAlbumView(album);
        };

        if (btnZA) btnZA.onclick = () => {
            this.currentPhotos.sort((a, b) => {
                const na = a.display_name || this.extractFileName(a.url);
                const nb = b.display_name || this.extractFileName(b.url);
                return nb.localeCompare(na, 'pt-BR', { numeric: true });
            });
            this.updateSortOrders();
            this.renderAlbumView(album);
        };

        if (btnBatch) btnBatch.onclick = () => this.batchRename(album);
    }

    async batchRename(album) {
        const prefix = prompt("Digite o prefixo para renomear todas as fotos.\nExemplo: 'Casamento_Ana' gerará: Casamento_Ana_01, Casamento_Ana_02, ...");
        if (!prefix) return;

        this.currentPhotos.forEach((p, i) => {
            const num = String(i + 1).padStart(2, '0');
            p.display_name = `${prefix}_${num}`;
        });
        this.renderAlbumView(album);
    }

    bindNameInputs() {
        document.querySelectorAll('.photo-name-input').forEach(input => {
            input.onclick = (e) => e.stopPropagation();
            input.onchange = (e) => {
                const id = parseInt(e.target.dataset.id);
                const photo = this.currentPhotos.find(p => p.id === id);
                if (photo) photo.display_name = e.target.value;
            };
        });
    }

    // ===================== DRAG & DROP =====================

    bindDragDrop(album) {
        const grid = document.getElementById('photo-grid');
        if (!grid) return;

        const items = grid.querySelectorAll('.photo-editable');
        items.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                this.dragSrcIndex = parseInt(item.dataset.index);
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            item.addEventListener('dragend', () => { item.classList.remove('dragging'); });
            item.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; item.classList.add('drag-over'); });
            item.addEventListener('dragleave', () => { item.classList.remove('drag-over'); });
            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                const targetIndex = parseInt(item.dataset.index);
                if (this.dragSrcIndex !== null && this.dragSrcIndex !== targetIndex) {
                    const moved = this.currentPhotos.splice(this.dragSrcIndex, 1)[0];
                    this.currentPhotos.splice(targetIndex, 0, moved);
                    this.updateSortOrders();
                    this.renderAlbumView(album);
                }
                this.dragSrcIndex = null;
            });
        });
    }

    updateSortOrders() {
        this.currentPhotos.forEach((p, i) => { p.sort_order = i; });
    }

    async saveAllNames() {
        const inputs = document.querySelectorAll('.photo-name-input');
        for (const input of inputs) {
            const id = parseInt(input.dataset.id);
            const photo = this.currentPhotos.find(p => p.id === id);
            if (photo) photo.display_name = input.value;
        }
        for (const p of this.currentPhotos) {
            await supabaseClient.from('photos').update({ display_name: p.display_name }).eq('id', p.id);
        }
    }

    async saveOrder() {
        for (const p of this.currentPhotos) {
            await supabaseClient.from('photos').update({ sort_order: p.sort_order }).eq('id', p.id);
        }
    }

    // ===================== UPLOAD =====================

    async handleUpload(event, albumId) {
        const files = Array.from(event.target.files);
        const status = document.getElementById('upload-status');
        const maxOrder = this.currentPhotos.length > 0 ? Math.max(...this.currentPhotos.map(p => p.sort_order)) + 1 : 0;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (status) status.innerText = `Enviando ${i + 1} de ${files.length}: ${file.name}...`;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 5)}.${fileExt}`;
            const filePath = `${albumId}/${fileName}`;
            const displayName = file.name.split('.').slice(0, -1).join('.');

            const { error: storageErr } = await supabaseClient.storage.from('photos').upload(filePath, file);
            if (storageErr) { console.error("Erro no Storage:", storageErr); continue; }

            const { data: { publicUrl } } = supabaseClient.storage.from('photos').getPublicUrl(filePath);
            const { error: dbErr } = await supabaseClient.from('photos')
                .insert([{ album_id: albumId, url: publicUrl, display_name: displayName, sort_order: maxOrder + i }]);
            if (dbErr) console.error("Erro no DB:", dbErr);
        }

        if (status) status.innerText = "Upload concluído!";
        setTimeout(() => this.showAlbum(albumId), 1000);
    }
}

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => { window.app = new App(); });

// Estilos dinâmicos
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .album-card { background: var(--color-bg-secondary); border-radius: 16px; border: 1px solid var(--color-border); overflow: hidden; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .album-card:hover { transform: translateY(-5px); border-color: var(--color-accent); }
    .album-card-add { background: var(--color-bg-secondary); border-radius: 16px; border: 2px dashed var(--color-border); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; cursor: pointer; color: var(--color-text-secondary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .album-card-add:hover { border-color: var(--color-accent); color: var(--color-accent); }
    #upload-zone:hover { border-color: var(--color-accent); background: #1a1a1a; }
    .btn-sm { padding: 0.4rem 0.8rem; font-size: 0.85rem; }

    /* Foto com nome visível */
    .photo-item { position: relative; }
    .photo-name-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.5rem; background: linear-gradient(transparent, rgba(0,0,0,0.85)); color: white; font-size: 0.8rem; text-align: center; opacity: 0; transition: opacity 0.3s; }
    .photo-item:hover .photo-name-label { opacity: 1; }

    /* Modo de edição */
    .photo-editable { cursor: grab; border: 2px solid transparent; transition: all 0.2s; position: relative; }
    .photo-editable:hover { border-color: var(--color-accent); }
    .photo-editable.dragging { opacity: 0.4; transform: scale(0.95); }
    .photo-editable.drag-over { border-color: #00ff88; box-shadow: 0 0 15px rgba(0,255,136,0.3); }

    .photo-drag-handle { position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); padding: 4px; border-radius: 6px; z-index: 2; cursor: grab; color: white; display: flex; }
    .photo-drag-handle i { width: 16px; height: 16px; }
    .photo-order-badge { position: absolute; top: 8px; right: 8px; background: var(--color-accent); color: #0a0a0a; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; z-index: 2; }
    .photo-name-bar { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.5rem; background: rgba(0,0,0,0.8); }
    .photo-name-input { width: 100%; background: transparent; border: 1px solid var(--color-border); color: white; padding: 0.3rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-family: var(--font-body); }
    .photo-name-input:focus { outline: none; border-color: var(--color-accent); }

    .edit-mode { gap: 1.5rem !important; }
`;
document.head.appendChild(styleSheet);
