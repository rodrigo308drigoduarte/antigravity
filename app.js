/**
 * app.js
 * Gerenciador de estado com integração Supabase Cloud.
 */

// Configurações do Supabase
const SUPABASE_URL = 'https://weirnbpmganvijbiecir.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7cU0Bdx8lPDUd57AvgnMpg_DaV2f9Gj';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

class App {
    constructor() {
        this.appContent = document.getElementById('app-content');
        this.totalStorageGB = 120;
        this.usedStorageMB = 0;
        this.init();
    }

    async init() {
        console.log("Safe Picture App Conectado ao Supabase!");
        this.setupNavbarListeners();
        this.showLandingPage();
    }

    setupNavbarListeners() {
        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');
        if (btnLogin) btnLogin.onclick = () => this.showLogin();
        if (btnSignup) btnSignup.onclick = () => this.showLogin();
    }

    showLandingPage() {
        // A landing page já está no HTML, mas se precisarmos resetar o conteúdo:
        // this.appContent.innerHTML = ... (conteúdo original do index.html)
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

    async showDashboard() {
        this.appContent.innerHTML = `<div style="text-align:center; padding: 5rem;"><h3>Carregando seus álbuns da nuvem...</h3></div>`;
        
        // Buscar álbuns do Supabase
        const { data: albums, error } = await supabase
            .from('albums')
            .select('*, photos(url)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Erro ao buscar álbuns:", error);
            alert("Erro ao conectar com o banco de dados. Verifique se as tabelas foram criadas.");
            return;
        }

        // Calcular armazenamento (simulado com base no número de fotos ou real se quiser)
        const totalPhotos = albums.reduce((acc, album) => acc + album.photos.length, 0);
        this.usedStorageMB = totalPhotos * 5; // Simulação: 5MB por foto
        const usedGB = (this.usedStorageMB / 1024).toFixed(2);
        const percent = ((usedGB / this.totalStorageGB) * 100).toFixed(1);

        document.querySelector('.nav-links').innerHTML = `
            <span style="color: var(--color-text-secondary); margin-right: 1rem; align-self: center;">Plano 120GB Ativo</span>
            <button class="btn btn-ghost" onclick="location.reload()">Sair</button>
        `;

        this.appContent.innerHTML = `
            <div style="max-width: 1200px; margin: 2rem auto; padding: 0 2rem; animation: fadeIn 0.5s ease;">
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
                    <h2>Seus Álbuns na Nuvem</h2>
                    <button class="btn btn-primary" id="btn-new-album"><i data-lucide="plus"></i> Novo Álbum</button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;" id="albums-grid">
                    ${this.renderAlbumsHtml(albums)}
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
            </div>
        `).join('');
    }

    bindDashboardEvents() {
        document.getElementById('btn-new-album').onclick = () => this.createNewAlbum();
        document.getElementById('card-add-album').onclick = () => this.createNewAlbum();
    }

    async createNewAlbum() {
        const name = prompt("Nome do novo álbum profissional:");
        if (name) {
            const { data, error } = await supabase
                .from('albums')
                .insert([{ name: name }])
                .select();

            if (error) {
                alert("Erro ao criar álbum: " + error.message);
            } else {
                this.showDashboard();
            }
        }
    }

    async showAlbum(id) {
        this.appContent.innerHTML = `<div style="text-align:center; padding: 5rem;"><h3>Abrindo álbum...</h3></div>`;

        const { data: album, error: albumErr } = await supabase
            .from('albums')
            .select('*')
            .eq('id', id)
            .single();

        const { data: photos, error: photoErr } = await supabase
            .from('photos')
            .select('*')
            .eq('album_id', id);

        if (albumErr || photoErr) {
            alert("Erro ao carregar álbum.");
            this.showDashboard();
            return;
        }

        this.appContent.innerHTML = `
            <div style="max-width: 1200px; margin: 2rem auto; padding: 0 2rem; animation: fadeIn 0.5s ease;">
                <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 2rem;">
                    <button class="btn btn-ghost" onclick="window.app.showDashboard()"><i data-lucide="arrow-left"></i> Voltar</button>
                    <h1>${album.name}</h1>
                </div>

                <div id="upload-zone" style="background: var(--color-bg-secondary); padding: 3rem; border-radius: 16px; border: 2px dashed var(--color-border); text-align: center; cursor: pointer; transition: var(--transition-smooth);">
                    <i data-lucide="upload-cloud" style="width: 48px; height: 48px; color: var(--color-accent); margin-bottom: 1rem;"></i>
                    <h3>Upload para Nuvem (120GB Disponível)</h3>
                    <p style="color: var(--color-text-secondary); margin-bottom: 1.5rem;">Clique para selecionar suas fotos de alta resolução</p>
                    <input type="file" id="photo-upload" multiple accept="image/*" style="display: none;">
                    <button class="btn btn-primary" onclick="document.getElementById('photo-upload').click()">Selecionar Fotos</button>
                    <div id="upload-status" style="margin-top: 1rem; color: var(--color-text-secondary); font-size: 0.9rem;"></div>
                </div>

                <div class="photo-grid" style="margin-top: 3rem;">
                    ${photos.map(p => `
                        <div class="photo-item">
                            <img src="${p.url}">
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        lucide.createIcons();
        document.getElementById('photo-upload').onchange = (e) => this.handleUpload(e, id);
        
        // Efeito visual no dropzone
        const zone = document.getElementById('upload-zone');
        zone.onclick = () => document.getElementById('photo-upload').click();
    }

    async handleUpload(event, albumId) {
        const files = Array.from(event.target.files);
        const status = document.getElementById('upload-status');
        
        for (const file of files) {
            status.innerText = `Enviando ${file.name}...`;
            
            // 1. Gerar nome único para o arquivo
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${albumId}/${fileName}`;

            // 2. Upload para o Supabase Storage (Bucket 'photos')
            const { data: storageData, error: storageErr } = await supabase.storage
                .from('photos')
                .upload(filePath, file);

            if (storageErr) {
                console.error("Erro no Storage:", storageErr);
                continue;
            }

            // 3. Pegar a URL pública da foto
            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(filePath);

            // 4. Salvar a URL no Banco de Dados
            const { error: dbErr } = await supabase
                .from('photos')
                .insert([{ album_id: albumId, url: publicUrl }]);

            if (dbErr) console.error("Erro no DB:", dbErr);
        }

        status.innerText = "Upload concluído!";
        setTimeout(() => this.showAlbum(albumId), 1000);
    }
}

// Inicializa a aplicação
window.app = new App();

// Estilos dinâmicos (mantidos)
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .album-card { background: var(--color-bg-secondary); border-radius: 16px; border: 1px solid var(--color-border); overflow: hidden; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .album-card:hover { transform: translateY(-5px); border-color: var(--color-accent); }
    .album-card-add { background: var(--color-bg-secondary); border-radius: 16px; border: 2px dashed var(--color-border); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 280px; cursor: pointer; color: var(--color-text-secondary); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .album-card-add:hover { border-color: var(--color-accent); color: var(--color-accent); }
    #upload-zone:hover { border-color: var(--color-accent); background: #1a1a1a; }
`;
document.head.appendChild(style);
