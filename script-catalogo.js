// Importa o cliente Supabase e funções de utilidade
// Removido import ES6 para compatibilidade com scripts globais

// Variáveis globais para armazenar dados do backend
let allTattoos = [];
let allCategories = [];

// Função para renderizar as tatuagens no grid
function renderTattoos(tatuagens) {
    const lista = document.getElementById('catalogo-lista');
    if (!lista) return;
    lista.innerHTML = tatuagens.map((tattoo, idx) => `
        <div class="tattoo-card animate__animated animate__fadeInUp" data-idx="${idx}">
            <img src="${tattoo.imagem_base64 ? tattoo.imagem_base64 : (tattoo.imagem || '')}" alt="${tattoo.nome || ''}" class="tattoo-img">
            <div class="tattoo-info">
                <div class="tattoo-nome">${tattoo.nome || ''}</div>
                <div class="tattoo-meta">${tattoo.categoria?.nome || ''}</div>
                <div class="tattoo-preco">R$ ${tattoo.preco || ''}</div>
            </div>
        </div>
    `).join('');
    // Adiciona evento para abrir modal
    document.querySelectorAll('.tattoo-card').forEach(card => {
        card.addEventListener('click', function(e) {
            const idx = this.getAttribute('data-idx');
            abrirModalTattoo(tatuagens[idx]);
        });
    });
    // Animação na rolagem (Intersection Observer)
    const cards = document.querySelectorAll('.tattoo-card');
    const observer = new window.IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = 1;
          entry.target.classList.add('animate__fadeInUp');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    cards.forEach(card => {
      card.style.opacity = 0;
      observer.observe(card);
    });
}

// Filtro de busca por categoria
async function renderCategorias() {
    try {
        // Busca categorias do backend
        const categoriasFull = await fetchCategorias();
        allCategories = categoriasFull;
        const catFilters = document.getElementById('category-filters');
        if (!catFilters) return;
        catFilters.innerHTML = `
            <div class="category-filter active" data-cat="todas">Todas</div>
            ${allCategories.map(cat => `<div class="category-filter" data-cat="${cat.id}">${cat.nome}</div>`).join('')}
        `;
        // Ativa os handlers de filtro
        const filters = document.querySelectorAll('.category-filter');
        filters.forEach(filter => {
            filter.addEventListener('click', function() {
                filters.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                const catId = this.getAttribute('data-cat');
                if (catId === 'todas') {
                    renderTattoos(allTattoos);
                } else {
                    const filtered = allTattoos.filter(t => t.categoria_id == catId);
                    renderTattoos(filtered);
                }
            });
        });
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// Importar funções do cliente Supabase
let fetchCategories, fetchTattoos;

// Função para buscar categorias do Supabase
async function fetchCategorias() {
  try {
    const { data, error } = await supabase
      .from('catalogo_categorias')
      .select('*')
      .order('nome');
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}

// Função para buscar tatuagens do Supabase usando o client global
async function fetchTatuagens() {
  try {
    if (!window.catalogoClient || !window.catalogoClient.buscarItens) {
      throw new Error('catalogoClient.buscarItens não disponível');
    }
    // Busca todos os itens cadastrados no admin (tabela catalogo_itens)
    const data = await window.catalogoClient.buscarItens();
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar tatuagens:', error);
    return [];
  }
}

// Busca categorias do Supabase
async function loadCategories() {
    fetchCategorias().then(categorias => {
        allCategories = categorias;
        renderCategorias();
    });
}

// Busca tatuagens do Supabase usando o client global
function loadTattoos() {
    fetchTatuagens().then(tatuagens => {
        allTattoos = tatuagens;
        renderTattoos(tatuagens);
    });
}


// Função para preencher e abrir o modal de detalhes
function abrirModalTattoo(tattoo) {
  // Corrige exibição da imagem (base64 ou URL)
  const imgEl = document.getElementById('modalTattooImg');
  if (tattoo.imagem_base64) {
    imgEl.src = tattoo.imagem_base64;
    imgEl.alt = tattoo.nome || 'Tattoo';
    imgEl.style.display = '';
  } else if (tattoo.imagem) {
    imgEl.src = tattoo.imagem.replace(/\\/g, '/');
    imgEl.alt = tattoo.nome || 'Tattoo';
    imgEl.style.display = '';
  } else {
    imgEl.src = '';
    imgEl.alt = 'Sem imagem disponível';
    imgEl.style.display = 'none';
  }
  document.getElementById('modalTattooNome').textContent = tattoo.nome || '';
  document.getElementById('modalTattooPreco').textContent = tattoo.preco ? `R$ ${tattoo.preco}` : '';
  document.getElementById('modalTattooLocal').textContent = tattoo.local || '';
  document.getElementById('modalTattooTamanho').textContent = tattoo.tamanho || '';
  document.getElementById('modalTattooDescricao').textContent = tattoo.descricao || '';
  document.getElementById('formReservaTattoo').classList.add('d-none');
  document.getElementById('btnReservarTattoo').style.display = '';
  const modal = new bootstrap.Modal(document.getElementById('modalTattooDetalhe'));
  modal.show();

  document.getElementById('btnReservarTattoo').onclick = function() {
    document.getElementById('formReservaTattoo').classList.remove('d-none');
    this.style.display = 'none';
  };

  document.getElementById('formReservaTattoo').onsubmit = function(ev) {
    ev.preventDefault();
    const nome = document.getElementById('reservaNome').value.trim();
    const data = document.getElementById('reservaData').value;
    const hora = document.getElementById('reservaHora').value;
    if (!nome || !data || !hora) return;
    const fone = '5566992156546';
    const dataFormatada = data.split('-').reverse().join('/');
    const mensagem = `Boa tarde, eu quero agendar para fazer essa tatuagem no dia ${dataFormatada} às ${hora}. Esse horário está disponível??\nNome: ${nome}\nTattoo: ${tattoo.nome}`;
    const url = `https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
    bootstrap.Modal.getInstance(document.getElementById('modalTattooDetalhe')).hide();
    setTimeout(() => {
      document.getElementById('formReservaTattoo').reset();
      document.getElementById('formReservaTattoo').classList.add('d-none');
      document.getElementById('btnReservarTattoo').style.display = '';
    }, 500);
  };
}


function filtrarCatalogo(e) {
  e.preventDefault();
  const nome = document.getElementById('filtro-nome').value.toLowerCase();
  const local = document.getElementById('filtro-local').value;
  const tamanho = document.getElementById('filtro-tamanho').value;
  const preco = document.getElementById('filtro-preco').value;

  let filtrado = allTattoos.filter(t => {
    let cond = true;
    if (nome && !(t.nome || '').toLowerCase().includes(nome)) cond = false;
    if (local && t.local !== local) cond = false;
    if (tamanho && t.tamanho !== tamanho) cond = false;
    if (preco) {
      const precoNum = parseFloat(t.preco);
      if (preco === '<200' && precoNum >= 200) cond = false;
      if (preco === '200-400' && (precoNum < 200 || precoNum > 400)) cond = false;
      if (preco === '>400' && precoNum <= 400) cond = false;
    }
    return cond;
  });
  renderTattoos(filtrado);
}



// --- Função para filtrar tattoos por categoria ---
function tattoosPorCategoria(slug) {
  return tattoos.filter(t => (t.categoria || '').toLowerCase() === slug);
}



// --- Mostrar apenas uma categoria no grid vertical ---
function mostrarCategoria(slug, nome) {
  document.getElementById('catalogo-lista').classList.remove('d-none');
  document.getElementById('btn-voltar-catalogo').classList.remove('d-none');
  // Destaca categoria
  document.querySelectorAll('.categoria-btn').forEach(btn => {
    btn.classList.toggle('active', btn.textContent === nome);
  });
  // Renderiza grid filtrado
  renderCatalogo(tattoosPorCategoria(slug));
}

// --- Voltar para o catálogo geral ---
document.getElementById('btn-voltar-catalogo').onclick = function() {
  document.getElementById('catalogo-lista').classList.remove('d-none');
  document.getElementById('btn-voltar-catalogo').classList.add('d-none');
  document.querySelectorAll('.categoria-btn').forEach(btn => btn.classList.remove('active'));
  renderTattoos(allTattoos);
};

// --- Inicialização ---
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadTattoos();

    // Carrossel de vídeos hero
    const heroVideos = document.querySelectorAll('.catalogo-hero-video');
    let heroIdx = 0;
    setInterval(() => {
      heroVideos[heroIdx].classList.add('d-none');
      heroVideos[heroIdx].style.opacity = 0.7;
      heroIdx = (heroIdx + 1) % heroVideos.length;
      heroVideos[heroIdx].classList.remove('d-none');
      heroVideos[heroIdx].style.opacity = 1;
    }, 6000);

    // Busca por nome ao digitar
    document.getElementById('filtro-nome').addEventListener('input', function() {
      if (document.getElementById('catalogo-lista').classList.contains('d-none')) return;
      const nome = this.value.toLowerCase();
      renderTattoos(allTattoos.filter(t => (t.nome || '').toLowerCase().includes(nome)));
    });

    // Mostrar/esconder filtros avançados
    document.getElementById('btn-toggle-filtros').addEventListener('click', function(e) {
      e.preventDefault();
      const filtros = document.getElementById('filtros-avancados');
      filtros.style.display = filtros.style.display === 'none' ? 'block' : 'none';
    });

    // Filtros avançados só aplicam ao clicar em "Aplicar" (apenas na visão grid)
    document.getElementById('form-filtro').addEventListener('submit', function(e) {
      if (document.getElementById('catalogo-lista').classList.contains('d-none')) {
        e.preventDefault();
        return;
      }
      filtrarCatalogo(e);
    });

    // Modal IA
    document.getElementById('btn-criar-ia').addEventListener('click', function() {
      var modalIA = new bootstrap.Modal(document.getElementById('modalIA'));
      modalIA.show();
    });
});
