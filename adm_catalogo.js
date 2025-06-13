// adm_catalogo.js
// Gerenciamento de múltiplos uploads de imagens e edição em lote, integração com Supabase

// Acesso via objeto global window.supabaseClient
const {
  supabase,
  fetchTattoos,
  fetchCategories,
  addTattoo,
  updateTattoo,
  deleteTattoo,
  addCategory,
  deleteCategory
} = window.supabaseClient;

let tattoos = [];
let categorias = [];

// Busca categorias do Supabase
async function loadCategorias() {
  try {
    const categoriesData = await fetchCategories();
    categorias = categoriesData.map(c => c.nome);
    renderCategorias();
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
  }
}

// Renderiza categorias nos selects e lista
function renderCategorias() {
  const select = document.getElementById('addTattooCategoria');
  const lista = document.getElementById('adm-categoria-list');
  if (select) {
    select.innerHTML = categorias.map(cat => `<option value="${cat}">${cat}</option>`).join('');
  }
  if (lista) {
    lista.innerHTML = categorias.map(cat => `
      <li class="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
        <span>${cat}</span>
        <span>
          <button class="btn btn-sm adm-btn-edit me-2" onclick="editCategoria('${cat}')"><i class="bi bi-pencil-square"></i></button>
          <button class="btn btn-sm adm-btn-delete" onclick="deleteCategoria('${cat}')"><i class="bi bi-trash"></i></button>
        </span>
      </li>
    `).join('');
  }
}

window.editCategoria = async function(cat) {
  const novoNome = prompt('Editar nome da categoria:', cat);
  if (!novoNome || novoNome === cat || categorias.includes(novoNome)) return;
  
  try {
    // Primeiro verificamos se essa categoria existe
    const { data: catData } = await supabase
      .from('categories')
      .select('id')
      .eq('nome', cat)
      .single();
      
    if (catData) {
      // Atualiza a categoria
      await supabase
        .from('categories')
        .update({ nome: novoNome })
        .eq('id', catData.id);
      
      await loadCategorias();
    }
  } catch (error) {
    console.error('Erro ao editar categoria:', error);
    alert('Erro ao editar categoria: ' + error.message);
  }
};

window.deleteCategoria = async function(cat) {
  if (confirm('Excluir categoria?')) {
    try {
      await supabase
        .from('categories')
        .delete()
        .eq('nome', cat);
        
      await loadCategorias();
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      alert('Erro ao excluir categoria');
    }
  }
};

// Renderiza tatuagens na tabela
function renderTattoos() {
  const tbody = document.getElementById('adm-tattoo-list');
  if (!tbody) return;
  tbody.innerHTML = tattoos.map((tat, idx) => `
    <tr>
      <td><img src="${tat.imagem}" alt="Tattoo"></td>
      <td>${tat.nome}</td>
      <td>${tat.categoria}</td>
      <td>${tat.preco}</td>
      <td>
        <button class="btn btn-sm adm-btn-edit" onclick="editTattoo(${tat.id})"><i class="bi bi-pencil-square"></i></button>
        <button class="btn btn-sm adm-btn-delete" onclick="deleteTattoo(${tat.id})"><i class="bi bi-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

// Busca// carrega as tatuagens
async function loadTattoos() {
  try {
    tattoos = await fetchTattoos();
    
    renderTattoos();
  } catch (error) {
    console.error('Erro ao carregar tatuagens:', error);
    alert('Erro ao carregar tatuagens do servidor');
  }
}

// Adiciona categoria
const formAddCategoria = document.getElementById('formAddCategoria');
if (formAddCategoria) {
  formAddCategoria.onsubmit = async function(e) {
    e.preventDefault();
    const nome = formAddCategoria.categoria.value.trim();
    if (nome && !categorias.includes(nome)) {
      try {
        await addCategory(nome);
        await loadCategorias();
        formAddCategoria.reset();
        bootstrap.Modal.getInstance(document.getElementById('modalAddCategoria')).hide();
      } catch (error) {
        console.error('Erro ao adicionar categoria:', error);
        alert('Erro ao adicionar categoria');
      }
    }
  };
}

// Múltiplos uploads de imagens
const modalAddTattoo = document.getElementById('modalAddTattoo');
if (modalAddTattoo) {
  modalAddTattoo.querySelector('.modal-body').innerHTML = `
    <form id="formAddTattooMulti">
      <label class="form-label">Imagens (máx. 30)</label>
      <input type="file" class="form-control mb-3" id="multiTattooInput" accept="image/*" multiple required>
      <div id="multiTattooPreview" class="row g-2 mb-3"></div>
      <div class="mt-4 text-end">
        <button type="submit" class="btn btn-warning fw-bold">Adicionar Todas</button>
      </div>
    </form>
  `;
}

let multiTattooData = [];

// Preview e edição em lote
function handleMultiTattooInput(e) {
  const files = Array.from(e.target.files).slice(0, 30);
  multiTattooData = files.map(file => ({
    file,
    imagem: '',
    nome: '',
    categoria: categorias[0] || '',
    preco: ''
  }));
  showMultiTattooPreview();
}

function showMultiTattooPreview() {
  const preview = document.getElementById('multiTattooPreview');
  if (!preview) return;
  preview.innerHTML = multiTattooData.map((tat, idx) => `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card bg-secondary bg-opacity-25 mb-2 p-2">
        <img src="${tat.imagem || ''}" class="img-fluid mb-2" id="preview-img-${idx}">
        <input type="text" class="form-control mb-1" placeholder="Nome" value="${tat.nome}" onchange="multiTattooData[${idx}].nome=this.value">
        <select class="form-select mb-1" onchange="multiTattooData[${idx}].categoria=this.value">
          ${categorias.map(cat => `<option value="${cat}" ${tat.categoria===cat?'selected':''}>${cat}</option>`).join('')}
        </select>
        <input type="text" class="form-control mb-1" placeholder="Preço" value="${tat.preco}" onchange="multiTattooData[${idx}].preco=this.value">
      </div>
    </div>
  `).join('');
  // Carregar previews
  multiTattooData.forEach((tat, idx) => {
    if (tat.file && !tat.imagem) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        tat.imagem = ev.target.result;
        const img = document.getElementById('preview-img-' + idx);
        if (img) img.src = tat.imagem;
      };
      reader.readAsDataURL(tat.file);
    }
  });
}

// Lida com envio em lote
const formAddTattooMulti = document.getElementById('formAddTattooMulti');
if (formAddTattooMulti) {
  formAddTattooMulti.onsubmit = async function(e) {
    e.preventDefault();
    const validTats = multiTattooData.filter(t => t.nome && t.categoria && t.preco && t.file);
    if (validTats.length === 0) return;
    
    try {
      // Exibir um indicador de progresso
      const totalImages = validTats.length;
      let completedUploads = 0;
      
      // Para cada tatuagem válida, faz o upload
      for (const tat of validTats) {
        await addTattoo(tat.nome, tat.categoria, tat.preco, tat.file);
        completedUploads++;
      }
      
      await loadTattoos();
      bootstrap.Modal.getInstance(document.getElementById('modalAddTattoo')).hide();
      multiTattooData = [];
    } catch (error) {
      console.error('Erro ao adicionar tatuagens:', error);
      alert('Erro ao adicionar algumas tatuagens. Verifique e tente novamente.');
    }
  };
}

// File input listener
const multiTattooInput = document.getElementById('multiTattooInput');
if (multiTattooInput) {
  multiTattooInput.addEventListener('change', handleMultiTattooInput);
}

// Edição e exclusão
window.editTattoo = async function(id) {
  const tat = tattoos.find(t => t.id == id);
  if (!tat) return;
  // Cria modal simples para edição
  const nome = prompt('Editar nome:', tat.nome);
  if (!nome) return;
  const categoria = prompt('Editar categoria:', tat.categoria);
  if (!categoria) return;
  const preco = prompt('Editar preço:', tat.preco);
  if (!preco) return;
  
  try {
    await updateTattoo(id, nome, categoria, preco);
    await loadTattoos();
  } catch (error) {
    console.error('Erro ao atualizar tatuagem:', error);
    alert('Erro ao atualizar tatuagem');
  }
};

window.deleteTattoo = async function(id) {
  if (confirm('Excluir tatuagem?')) {
    try {
      await deleteTattoo(id);
      await loadTattoos();
    } catch (error) {
      console.error('Erro ao excluir tatuagem:', error);
      alert('Erro ao excluir tatuagem');
    }
  }
};

// Inicialização
loadCategorias();
loadTattoos();
