/**
 * app.js
 * Ponto de entrada e gerenciador de estado da aplicação.
 */

class App {
    constructor() {
        this.appContent = document.getElementById('app-content');
        this.init();
    }

    init() {
        console.log("Lumina App Inicializado!");
        this.setupEventListeners();
    }

    setupEventListeners() {
        const btnLogin = document.getElementById('btn-login');
        const btnSignup = document.getElementById('btn-signup');

        if(btnLogin) {
            btnLogin.addEventListener('click', () => this.showLogin());
        }
        if(btnSignup) {
            btnSignup.addEventListener('click', () => this.showLogin());
        }
    }

    // Função para renderizar a tela de login (Simulação)
    showLogin() {
        this.appContent.innerHTML = `
            <div style="max-width: 400px; margin: 4rem auto; padding: 2rem; background: var(--color-bg-secondary); border-radius: 16px; border: 1px solid var(--color-border); animation: fadeIn 0.5s ease;">
                <h2 style="margin-bottom: 1.5rem; text-align: center;">Bem-vindo de volta</h2>
                <form id="login-form" style="display: flex; flex-direction: column; gap: 1rem;">
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--color-text-secondary); font-size: 0.9rem;">Email</label>
                        <input type="email" placeholder="seu@email.com" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: white;" required>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                        <label style="color: var(--color-text-secondary); font-size: 0.9rem;">Senha</label>
                        <input type="password" placeholder="••••••••" style="padding: 0.8rem; border-radius: 8px; border: 1px solid var(--color-border); background: var(--color-bg-primary); color: white;" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="justify-content: center; margin-top: 1rem;">Entrar</button>
                </form>
                <p style="text-align: center; margin-top: 1.5rem; color: var(--color-text-secondary); font-size: 0.9rem;">
                    Ainda não tem conta? <a href="#" style="color: white; font-weight: 500;">Crie agora</a>
                </p>
            </div>
        `;
        
        // Simular o evento de submissão do formulário para mostrar o dashboard
        const form = document.getElementById('login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showDashboard();
        });
    }

    // Função para renderizar o Dashboard (Painel do Fotógrafo)
    showDashboard() {
        // Atualiza a navbar para o estado logado
        document.querySelector('.nav-links').innerHTML = `
            <span style="color: var(--color-text-secondary); margin-right: 1rem; align-self: center;">Olá, Fotógrafo</span>
            <button class="btn btn-ghost" onclick="location.reload()">Sair</button>
        `;

        this.appContent.innerHTML = `
            <div style="max-width: 1200px; margin: 2rem auto; padding: 0 2rem; animation: fadeIn 0.5s ease;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                    <h2>Meus Álbuns</h2>
                    <button class="btn btn-primary"><i data-lucide="plus"></i> Novo Álbum</button>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
                    <!-- Card de Exemplo de Álbum -->
                    <div style="background: var(--color-bg-secondary); border-radius: 12px; overflow: hidden; border: 1px solid var(--color-border); cursor: pointer; transition: var(--transition-smooth);" class="album-card">
                        <div style="height: 200px; background: #2a2a2a; display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="image" style="color: var(--color-text-secondary); opacity: 0.5; width: 48px; height: 48px;"></i>
                        </div>
                        <div style="padding: 1.5rem;">
                            <h3 style="margin-bottom: 0.5rem;">Ensaio Casamento</h3>
                            <p style="color: var(--color-text-secondary); font-size: 0.9rem;">24 fotos • Atualizado ontem</p>
                        </div>
                    </div>
                    
                    <!-- Card Vazio para Adicionar -->
                    <div style="background: transparent; border-radius: 12px; border: 2px dashed var(--color-border); display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; min-height: 280px; cursor: pointer; color: var(--color-text-secondary); transition: var(--transition-smooth);" class="album-card-add">
                        <i data-lucide="folder-plus" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                        <p>Criar novo álbum</p>
                    </div>
                </div>
            </div>
        `;
        
        // Adiciona efeito hover via JS para os cards simulados e recarrega os ícones
        lucide.createIcons();
    }
}

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Adiciona a keyframe de animação ao documento via JS
const style = document.createElement('style');
style.textContent = \`
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .album-card:hover {
        transform: translateY(-5px);
        border-color: var(--color-accent);
    }
    .album-card-add:hover {
        border-color: var(--color-accent);
        color: var(--color-accent);
    }
\`;
document.head.appendChild(style);
