// catalogo-cezimbra.js
// Front-end para exibição do catálogo Cezimbra para clientes

import { fetchCatalogoCategorias, fetchCatalogoItens } from './catalogo-client.js';

let catalogoItens = [];
let catalogoCategorias = [];
let categoriaAtual = null;

// Carrega categorias e popula a barra de filtros
async function loadCategorias() {
  try {
    catalogoCategorias = await fetchCatalogoCategorias();
    renderCategorias();
    return catalogoCategorias;
  } catch (error) {
    console.error('Erro ao carregar categorias do catálogo:', error);
    return [];
  }
}

// Renderiza as categorias na barra de filtros
function renderCategorias() {
  const categoriasBar = document.getElementById('catalogo-cezimbra-categorias');
  if (!categoriasBar) return;
  
  let html = `
    <button class="btn btn-sm ${!categoriaAtual ? 'btn-warning' : 'btn-outline-warning'}" 
      onclick="window.filtrarCategoriaCezimbra(null)">
      Todos
    </button>
  `;
  
  catalogoCategorias.forEach(cat => {
    html += `
      <button class="btn btn-sm ${categoriaAtual === cat.id ? 'btn-warning' : 'btn-outline-warning'}" 
        onclick="window.filtrarCategoriaCezimbra(${cat.id})">
        ${cat.nome}
      </button>
    `;
  });
  
  categoriasBar.innerHTML = html;
}

// Carrega itens do catálogo
async function loadItensCatalogo(categoriaId = null) {
  try {
    catalogoItens = await fetchCatalogoItens(categoriaId);
    renderItensCatalogo();
    return catalogoItens;
  } catch (error) {
    console.error('Erro ao carregar itens do catálogo:', error);
    return [];
  }
}

// Renderiza os itens do catálogo
function renderItensCatalogo() {
  const catalogo = document.getElementById('catalogo-cezimbra-items');
  if (!catalogo) return;
  
  if (catalogoItens.length === 0) {
    catalogo.innerHTML = `
      <div class="col-12 text-center py-5">
        <h3 class="text-secondary">Nenhum item encontrado</h3>
        <p>Não há itens disponíveis nesta categoria.</p>
      </div>
    `;
    return;
  }
  
  // Agrupa itens por categoria para exibição
  const itensPorCategoria = {};
  
  catalogoItens.forEach(item => {
    if (item.disponivel === false) return; // Pula itens indisponíveis
    
    const categoriaId = item.categoria_id;
    const categoriaNome = item.catalogo_categorias?.nome || 'Sem categoria';
    
    if (!itensPorCategoria[categoriaId]) {
      itensPorCategoria[categoriaId] = {
        nome: categoriaNome,
        itens: []
      };
    }
    
    itensPorCategoria[categoriaId].itens.push(item);
  });
  
  // Gera o HTML para cada categoria e seus itens
  let html = '';
  
  Object.keys(itensPorCategoria).forEach(catId => {
    const categoria = itensPorCategoria[catId];
    
    // Se estiver filtrando por uma categoria, não mostra o título da categoria
    if (categoriaAtual === null) {
      html += `
        <div class="col-12 mt-4 mb-3">
          <h3 class="border-bottom border-warning pb-2">${categoria.nome}</h3>
        </div>
      `;
    }
    
    // Exibe os itens dessa categoria
    categoria.itens.forEach(item => {
      html += `
        <div class="col-md-6 col-lg-4 mb-4">
          <div class="card h-100 bg-dark shadow">
            ${item.imagem ? 
              `<img src="${item.imagem}" class="card-img-top p-2" alt="${item.nome}"
                style="height: 200px; object-fit: cover; border-radius: 16px;">` : 
              `<div class="bg-secondary bg-opacity-25 text-center p-5" style="height: 200px;">
                <i class="bi bi-image fs-1"></i>
                <p>Imagem indisponível</p>
              </div>`
            }
            <div class="card-body">
              <h5 class="card-title">${item.nome}</h5>
              ${item.descricao ? `<p class="card-text small">${item.descricao}</p>` : ''}
              
              <div class="d-flex justify-content-between align-items-center mt-3">
                <div>
                  ${item.preco_promocional ? 
                    `<p class="mb-0">
                      <span class="text-decoration-line-through text-secondary">${formatarPreco(item.preco)}</span>
                      <br><span class="fs-5 text-warning">${formatarPreco(item.preco_promocional)}</span>
                    </p>` : 
                    `<p class="mb-0 fs-5">${formatarPreco(item.preco)}</p>`
                  }
                </div>
                <a href="#contato" class="btn btn-outline-warning">Solicitar</a>
              </div>
            </div>
          </div>
        </div>
      `;
    });
  });
  
  catalogo.innerHTML = html;
}

// Formata valor monetário
function formatarPreco(valor) {
  if (!valor) return 'R$ 0,00';
  
  // Se for uma string, tenta converter para número
  if (typeof valor === 'string') {
    valor = parseFloat(valor.replace('R$', '').replace('.', '').replace(',', '.'));
  }
  
  return valor.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
}

// Filtrar por categoria
window.filtrarCategoriaCezimbra = function(categoriaId) {
  categoriaAtual = categoriaId;
  renderCategorias(); // Atualiza botões de categoria
  loadItensCatalogo(categoriaId);
};

// Inicialização
document.addEventListener('DOMContentLoaded', async function() {
  await loadCategorias();
  await loadItensCatalogo();
});
