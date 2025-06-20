// adm_catalogo.js
// Gerenciamento de múltiplos uploads de imagens e edição em lote, integração com backend PHP

let tattoos = [];
let categorias = [];

// Busca categorias do backend
async function fetchCategorias() {
  const res = await fetch('api/categories.php');
  categorias = (await res.json()).map(c => c.nome);
  renderCategorias();
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
  await fetch('api/categories.php', {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({old: cat, novo: novoNome})
  });
  await fetchCategorias();
};

window.deleteCategoria = async function(cat) {
  if (confirm('Excluir categoria?')) {
    await fetch('api/categories.php', {
      method: 'DELETE',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({nome: cat})
    });
    await fetchCategorias();
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

// Busca tatuagens do backend
async function fetchTattoos() {
  const res = await fetch('api/tattoos.php');
  tattoos = await res.json();
  renderTattoos();
}

// Adiciona categoria
const formAddCategoria = document.getElementById('formAddCategoria');
if (formAddCategoria) {
  formAddCategoria.onsubmit = async function(e) {
    e.preventDefault();
    const nome = formAddCategoria.categoria.value.trim();
    if (nome && !categorias.includes(nome)) {
      await fetch('api/categories.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({nome})
      });
      await fetchCategorias();
      formAddCategoria.reset();
      bootstrap.Modal.getInstance(document.getElementById('modalAddCategoria')).hide();
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
    const formData = new FormData();
    validTats.forEach((t, i) => {
      formData.append('imagens[]', t.file);
      formData.append('nomes[]', t.nome);
      formData.append('categorias[]', t.categoria);
      formData.append('precos[]', t.preco);
    });
    await fetch('api/tattoos.php', {
      method: 'POST',
      body: formData
    });
    await fetchTattoos();
    bootstrap.Modal.getInstance(document.getElementById('modalAddTattoo')).hide();
    multiTattooData = [];
  };
}

// File input listener
const multiTattooInput = document.getElementById('multiTattooInput');
if (multiTattooInput) {
  multiTattooInput.addEventListener('change', handleMultiTattooInput);
}

// Edição e exclusão (simples, em memória)
window.editTattoo = function(id) {
  const tat = tattoos.find(t => t.id == id);
  if (!tat) return;
  // Cria modal simples para edição
  const nome = prompt('Editar nome:', tat.nome);
  if (!nome) return;
  const categoria = prompt('Editar categoria:', tat.categoria);
  if (!categoria) return;
  const preco = prompt('Editar preço:', tat.preco);
  if (!preco) return;
  const imagem = prompt('Editar URL da imagem:', tat.imagem);
  if (!imagem) return;
  fetch('api/tattoos.php', {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({id, nome, categoria, preco, imagem})
  }).then(fetchTattoos);
};
window.deleteTattoo = async function(id) {
  if (confirm('Tem certeza que deseja excluir esta tatuagem?')) {
    await fetch('api/tattoos.php', {
      method: 'DELETE',
      body: 'id='+encodeURIComponent(id),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    });
    await fetchTattoos();
  }
};

// Inicialização
fetchCategorias();
fetchTattoos();
