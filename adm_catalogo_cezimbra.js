// adm_catalogo_cezimbra.js - Interface administrativa para gerenciamento do catálogo

console.log('=== INICIALIZAÇÃO ADM_CATALOGO_CEZIMBRA.JS ===');

// Variáveis globais
let categorias = [];
let itens = [];
let categoriaAtual = null;
let itemEmEdicao = null;
let modalCategoria = null;
let modalItem = null;

// Função para verificar se as dependências estão carregadas
function checkDependencies() {
  if (typeof window.supabase === 'undefined') {
    console.warn('Aguardando carregamento do Supabase...');
    return false;
  }
  
  if (typeof window.catalogoClient === 'undefined') {
    console.warn('Aguardando carregamento do catálogo...');
    return false;
  }
  
  return true;
}

// Referências globais
let catalogoClient = window.catalogoClient;

// Referências locais para as funções do catálogo (serão atribuídas durante a inicialização)
let fetchCatalogoCategorias;
let addCatalogoCategoria;
let updateCatalogoCategoria;
let deleteCatalogoCategoria;
let fetchCatalogoItens;
let addCatalogoItem;
let updateCatalogoItem;
let deleteCatalogoItem;
let uploadCatalogoImage;

// Variáveis globais
let catalogoCategorias = [];
let catalogoItens = [];
let editingCatalogoCategoriaId = null;
let editingCatalogoItemId = null;

// Torna as funções disponíveis globalmente para acesso via HTML
window.editCatalogoCategoria = editCatalogoCategoria;
window.deleteCatalogoCategoria = deleteCatalogoCategoria;
window.editCatalogoItem = editCatalogoItem;
window.deleteCatalogoItem = deleteCatalogoItem;

// Funções de inicialização
function initCatalogo() {
  console.log('Inicializando catálogo...');
  
  // Adiciona evento no formulário de nova categoria
  const formAddCatalogoCategoria = document.getElementById('formAddCatalogoCategoria');
  if (formAddCatalogoCategoria) {
    formAddCatalogoCategoria.onsubmit = handleAddCatalogoCategoria;
  }

  // Adiciona evento no formulário de novo item
  const formAddCatalogoItem = document.getElementById('formAddCatalogoItem');
  if (formAddCatalogoItem) {
    formAddCatalogoItem.onsubmit = handleAddCatalogoItem;
  }

  // Adiciona evento no formulário de edição
  const formEditCatalogoItem = document.getElementById('formEditCatalogoItem');
  if (formEditCatalogoItem) {
    formEditCatalogoItem.onsubmit = handleEditCatalogoItem;
  }

  // Filtra itens por categoria
  const filtroCategoriaSelect = document.getElementById('filtroCategoriaSelect');
  if (filtroCategoriaSelect) {
    filtroCategoriaSelect.onchange = function() {
      const categoriaId = this.value || null;
      loadCatalogoItens(categoriaId);
    };
  }

  // Configura preview de imagens
  setupImagePreview('addCatalogoItemImagem', 'addCatalogoItemImagePreview');
  setupImagePreview('editCatalogoItemImagem', 'editCatalogoItemImagePreview');
  
  configurarEventos();
}

// Configura os eventos da interface
function configurarEventos() {
  // Adiciona os eventos dos formulários
  const formCategoria = document.getElementById('formCategoria');
  if (formCategoria) {
    formCategoria.addEventListener('submit', handleSubmitCategoria);
  }
  
  const formItem = document.getElementById('formItem');
  if (formItem) {
    formItem.addEventListener('submit', handleSubmitItem);
    
    // Configura o preview da imagem
    const inputImagem = formItem.querySelector('input[type="file"]');
    if (inputImagem) {
      inputImagem.addEventListener('change', function() {
        previewImagem(this);
      });
    }
  }
  
  // Botão para adicionar nova categoria
  const btnNovaCategoria = document.getElementById('btnNovaCategoria');
  if (btnNovaCategoria) {
    btnNovaCategoria.addEventListener('click', () => abrirModalCategoria());
  }
  
  // Botão para adicionar novo item
  const btnNovoItem = document.getElementById('btnNovoItem');
  if (btnNovoItem) {
    btnNovoItem.addEventListener('click', () => abrirModalItem());
  }
}

// Abre o modal de categoria para adicionar ou editar
function abrirModalCategoria(categoriaId = null) {
  const form = document.getElementById('formCategoria');
  const tituloModal = document.getElementById('modalCategoriaLabel');
  
  // Limpa o formulário
  form.reset();
  
  if (categoriaId) {
    // Modo edição
    const categoria = categorias.find(c => c.id === categoriaId);
    if (!categoria) return;
    
    tituloModal.textContent = 'Editar Categoria';
    form.elements['id'].value = categoria.id;
    form.elements['nome'].value = categoria.nome || '';
    form.elements['descricao'].value = categoria.descricao || '';
  } else {
    // Modo adição
    tituloModal.textContent = 'Nova Categoria';
    form.elements['id'].value = '';
  }
  
  modalCategoria.show();
}

// Abre o modal de item para adicionar ou editar
async function abrirModalItem(itemId = null) {
  const form = document.getElementById('formItem');
  const tituloModal = document.getElementById('modalItemLabel');
  const previewImagem = document.getElementById('previewImagem');
  
  // Limpa o formulário e o preview
  form.reset();
  previewImagem.innerHTML = '';
  
  // Atualiza o seletor de categorias
  atualizarSeletorCategorias();
  
  if (itemId) {
    // Modo edição
    const item = itens.find(i => i.id === itemId);
    if (!item) return;
    
    tituloModal.textContent = 'Editar Item';
    form.elements['id'].value = item.id;
    form.elements['nome'].value = item.nome || '';
    form.elements['descricao'].value = item.descricao || '';
    form.elements['preco'].value = item.preco || '0';
    form.elements['precoPromocional'].value = item.preco_promocional || '';
    form.elements['disponivel'].checked = item.disponivel !== false;
    form.elements['categoria'].value = item.categoria_id || '';
    
    // Exibe a imagem atual se existir
    if (item.imagem) {
      previewImagem.innerHTML = `
        <img src="${item.imagem}" class="img-fluid rounded" alt="Preview">
        <div class="form-text">Imagem atual. Selecione outra para alterar.</div>
      `;
    }
  } else {
    // Modo adição
    tituloModal.textContent = 'Novo Item';
    form.elements['id'].value = '';
    
    // Seleciona a categoria atual se houver uma
    if (categoriaAtual) {
      form.elements['categoria'].value = categoriaAtual.id;
    }
  }
  
  modalItem.show();
}

// Atualiza o seletor de categorias no formulário de itens
function atualizarSeletorCategorias() {
  const selectCategoria = document.getElementById('categoriaItem');
  if (!selectCategoria) return;
  
  selectCategoria.innerHTML = `
    <option value="" disabled ${!categoriaAtual ? 'selected' : ''}>Selecione uma categoria</option>
    ${categorias.map(categoria => `
      <option value="${categoria.id}" ${categoriaAtual?.id === categoria.id ? 'selected' : ''}>
        ${categoria.nome}
      </option>
    `).join('')}
  `;
}

// Manipula o envio do formulário de categoria
async function handleSubmitCategoria(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const categoriaId = formData.get('id');
  
  const dados = {
    nome: formData.get('nome').trim(),
    descricao: formData.get('descricao').trim() || null
  };
  
  // Validação
  if (!dados.nome) {
    mostrarErro('O nome da categoria é obrigatório.');
    return;
  }
  
  try {
    let categoria;
    
    if (categoriaId) {
      // Atualiza a categoria existente
      categoria = await window.catalogoClient.atualizarCategoria(parseInt(categoriaId), dados);
      
      // Atualiza a categoria na lista
      const index = categorias.findIndex(c => c.id === parseInt(categoriaId));
      if (index !== -1) {
        categorias[index] = { ...categorias[index], ...categoria };
      }
      
      mostrarSucesso('Categoria atualizada com sucesso!');
    } else {
      // Cria uma nova categoria
      categoria = await window.catalogoClient.adicionarCategoria(dados);
      categorias.push(categoria);
      mostrarSucesso('Categoria adicionada com sucesso!');
    }
    
    // Atualiza a interface
    renderizarCategorias();
    atualizarSeletorCategorias();
    
    // Fecha o modal
    modalCategoria.hide();
    
  } catch (error) {
    console.error('Erro ao salvar categoria:', error);
    mostrarErro(error.message || 'Erro ao salvar a categoria. Por favor, tente novamente.');
  }
}

// Manipula o envio do formulário de item
async function handleSubmitItem(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const itemId = formData.get('id');
  const arquivoImagem = formData.get('imagem');
  
  const dados = {
    nome: formData.get('nome').trim(),
    descricao: formData.get('descricao').trim() || null,
    preco: parseFloat(formData.get('preco')) || 0,
    preco_promocional: formData.get('precoPromocional') ? 
      parseFloat(formData.get('precoPromocional')) : null,
    categoria_id: parseInt(formData.get('categoria')),
    disponivel: formData.get('disponivel') === 'on',
    imagem: null // Será preenchido após o upload da imagem
  };
  
  // Validação
  if (!dados.nome) {
    mostrarErro('O nome do item é obrigatório.');
    return;
  }
  
  if (!dados.categoria_id) {
    mostrarErro('Selecione uma categoria para o item.');
    return;
  }
  
  try {
    // Faz o upload da imagem se fornecida
    if (arquivoImagem && arquivoImagem.size > 0) {
      try {
        dados.imagem = await window.catalogoClient.fazerUploadImagem(arquivoImagem);
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        mostrarErro('Erro ao fazer upload da imagem. Por favor, tente novamente.');
        return;
      }
    } else if (itemId) {
      // Mantém a imagem existente se não for fornecida uma nova
      const itemExistente = itens.find(i => i.id === parseInt(itemId));
      if (itemExistente) {
        dados.imagem = itemExistente.imagem;
      }
    }
    
    let itemAtualizado;
    
    if (itemId) {
      // Atualiza o item existente
      itemAtualizado = await window.catalogoClient.atualizarItem(parseInt(itemId), dados);
      
      // Atualiza o item na lista
      const index = itens.findIndex(i => i.id === parseInt(itemId));
      if (index !== -1) {
        itens[index] = { ...itens[index], ...itemAtualizado };
      }
      
      mostrarSucesso('Item atualizado com sucesso!');
    } else {
      // Cria um novo item
      itemAtualizado = await window.catalogoClient.adicionarItem(dados);
      itens.push(itemAtualizado);
      mostrarSucesso('Item adicionado com sucesso!');
    }
    
    // Atualiza a interface
    renderizarItens();
    
    // Fecha o modal
    modalItem.hide();
    
  } catch (error) {
    console.error('Erro ao salvar item:', error);
    mostrarErro(error.message || 'Erro ao salvar o item. Por favor, tente novamente.');
  }
}

// Exibe um preview da imagem selecionada
function previewImagem(input) {
  const preview = document.getElementById('previewImagem');
  if (!preview) return;
  
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
      preview.innerHTML = `
        <img src="${e.target.result}" class="img-fluid rounded" alt="Preview">
        <div class="form-text">Pré-visualização da imagem</div>
      `;
    };
    
    reader.readAsDataURL(input.files[0]);
  } else {
    preview.innerHTML = '';
  }
}

// Manipulador de envio do formulário de nova categoria
async function handleAddCatalogoCategoria(e) {
  e.preventDefault();
  
  const form = e.target;
  const nome = form.nome.value.trim();
  const descricao = form.descricao.value.trim();
  
  if (!nome) {
    alert('Por favor, informe o nome da categoria');
    return;
  }
  
  try {
    const novaCategoria = { nome, descricao };
    await addCatalogoCategoria(novaCategoria);
    
    // Recarrega as categorias e itens
    await loadCatalogoCategorias();
    
    // Fecha o modal e limpa o formulário
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAddCatalogoCategoria'));
    modal.hide();
    form.reset();
    
    // Exibe mensagem de sucesso
    alert('Categoria adicionada com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
    alert('Erro ao adicionar categoria. Por favor, tente novamente.');
  }
}

// Manipulador de envio do formulário de novo item
async function handleAddCatalogoItem(e) {
  e.preventDefault();
  
  const form = e.target;
  const nome = form.nome.value.trim();
  const categoriaId = form.categoria_id.value;
  const preco = parseFloat(form.preco.value.replace(/[^0-9,]/g, '').replace(',', '.'));
  const descricao = form.descricao.value.trim();
  const imagem = form.imagem.files[0];
  
  if (!nome || !categoriaId || isNaN(preco) || preco <= 0) {
    alert('Por favor, preencha todos os campos obrigatórios corretamente');
    return;
  }
  
  try {
    // Cria o objeto do item
    const novoItem = {
      nome,
      categoria_id: categoriaId,
      preco: preco * 100, // Converte para centavos
      descricao,
      em_promocao: form.em_promocao.checked,
      preco_promocional: form.preco_promocional ? parseFloat(form.preco_promocional.value.replace(/[^0-9,]/g, '').replace(',', '.')) * 100 : null
    };
    
    // Se houver imagem, faz o upload
    if (imagem) {
      const { data: uploadData, error: uploadError } = await uploadCatalogoImage(imagem);
      if (uploadError) throw uploadError;
      novoItem.imagem_url = uploadData.path;
    }
    
    // Adiciona o item
    await addCatalogoItem(novoItem);
    
    // Recarrega os itens
    await loadCatalogoItens();
    
    // Fecha o modal e limpa o formulário
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalAddCatalogoItem'));
    modal.hide();
    form.reset();
    
    // Exibe mensagem de sucesso
    alert('Item adicionado com sucesso!');
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    alert('Erro ao adicionar item. Por favor, tente novamente.');
  }
}

// Manipulador de envio do formulário de edição de item
async function handleEditCatalogoItem(e) {
  e.preventDefault();
  
  if (!editingCatalogoItemId) return;
  
  const form = e.target;
  const nome = form.nome.value.trim();
  const categoriaId = form.categoria_id.value;
  const preco = parseFloat(form.preco.value.replace(/[^0-9,]/g, '').replace(',', '.'));
  const descricao = form.descricao.value.trim();
  const imagem = form.imagem.files[0];
  
  if (!nome || !categoriaId || isNaN(preco) || preco <= 0) {
    alert('Por favor, preencha todos os campos obrigatórios corretamente');
    return;
  }
  
  try {
    // Cria o objeto de atualização
    const dadosAtualizados = {
      nome,
      categoria_id: categoriaId,
      preco: preco * 100, // Converte para centavos
      descricao,
      em_promocao: form.em_promocao.checked,
      preco_promocional: form.preco_promocional ? parseFloat(form.preco_promocional.value.replace(/[^0-9,]/g, '').replace(',', '.')) * 100 : null
    };
    
    // Se houver nova imagem, faz o upload
    if (imagem) {
      const { data: uploadData, error: uploadError } = await uploadCatalogoImage(imagem);
      if (uploadError) throw uploadError;
      dadosAtualizados.imagem_url = uploadData.path;
    }
    
    // Atualiza o item
    await updateCatalogoItem(editingCatalogoItemId, dadosAtualizados);
    
    // Recarrega os itens
    await loadCatalogoItens();
    
    // Fecha o modal e limpa o estado de edição
    const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditCatalogoItem'));
    modal.hide();
    editingCatalogoItemId = null;
    
    // Exibe mensagem de sucesso
    alert('Item atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    alert('Erro ao atualizar item. Por favor, tente novamente.');
  }
}

// Carrega categorias do catálogo do Supabase
async function loadCatalogoCategorias() {
  console.log('Iniciando loadCatalogoCategorias');
  try {
    console.log('Chamando fetchCatalogoCategorias...');
    const data = await fetchCatalogoCategorias();
    console.log('Categorias recebidas:', data);
    catalogoCategorias = data || [];
    console.log('Renderizando categorias...');
    renderCatalogoCategorias();
    console.log('Categorias carregadas com sucesso');
    return catalogoCategorias;
  } catch (error) {
    console.error('Erro em loadCatalogoCategorias:', error);
    throw error; // Propaga o erro para quem chamou
  }
}

// Renderiza categorias nos selects e lista
function renderCatalogoCategorias() {
  const select = document.getElementById('addCatalogoItemCategoria');
  const lista = document.getElementById('adm-catalogo-categoria-list');
  
  if (select) {
    select.innerHTML = catalogoCategorias.map(cat => 
      `<option value="${cat.id}">${cat.nome}</option>`
    ).join('');
  }
  
  if (lista) {
    lista.innerHTML = catalogoCategorias.map(cat => `
      <li class="list-group-item bg-dark text-light d-flex justify-content-between align-items-center">
        <span>${cat.nome}</span>
        <div>
          <span class="badge bg-secondary">${cat.descricao || ''}</span>
          <span>
            <button class="btn btn-sm adm-btn-edit me-2" onclick="window.editCatalogoCategoria(${cat.id})">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-sm adm-btn-delete" onclick="window.deleteCatalogoCategoria(${cat.id})">
              <i class="bi bi-trash"></i>
            </button>
          </span>
        </div>
      </li>
    `).join('');
  }
}

// Edita categoria do catálogo
window.editCatalogoCategoria = async function(id) {
  const categoria = catalogoCategorias.find(c => c.id === id);
  if (!categoria) return;
  
  const novoNome = prompt('Editar nome da categoria:', categoria.nome);
  if (!novoNome || novoNome === categoria.nome) return;
  
  const novaDesc = prompt('Editar descrição (opcional):', categoria.descricao || '');
  
  try {
    await updateCatalogoCategoria(id, {
      nome: novoNome,
      descricao: novaDesc
    });
    
    await loadCatalogoCategorias();
  } catch (error) {
    console.error('Erro ao editar categoria do catálogo:', error);
    alert('Erro ao editar categoria: ' + error.message);
  }
};

// Exclui categoria do catálogo
window.deleteCatalogoCategoria = async function(id) {
  const categoria = catalogoCategorias.find(c => c.id === id);
  if (!categoria) return;
  
  if (!confirm(`Excluir categoria "${categoria.nome}"?`)) {
    return;
  }
  
  try {
    await deleteCatalogoCategoria(id);
    await loadCatalogoCategorias();
  } catch (error) {
    console.error('Erro ao excluir categoria do catálogo:', error);
    alert('Erro ao excluir categoria');
  }
};

// Carrega itens do catálogo
async function loadCatalogoItens(categoriaId = null) {
  try {
    const data = await fetchCatalogoItens(categoriaId);
    catalogoItens = data;
    renderCatalogoItens();
    return data;
  } catch (error) {
    console.error('Erro ao carregar itens do catálogo:', error);
    alert('Erro ao carregar itens do catálogo do servidor');
    return [];
  }
}

// Renderiza itens do catálogo na tabela
function renderCatalogoItens() {
  const tbody = document.getElementById('adm-catalogo-item-list');
  if (!tbody) return;
  
  tbody.innerHTML = catalogoItens.map(item => `
    <tr>
      <td><img src="${item.imagem || 'https://via.placeholder.com/80?text=Sem+Imagem'}" alt="${item.nome}"></td>
      <td>${item.nome}</td>
      <td>${item.catalogo_categorias?.nome || 'Sem categoria'}</td>
      <td>${formatarPreco(item.preco)}</td>
      <td>${item.preco_promocional ? formatarPreco(item.preco_promocional) : 'N/A'}</td>
      <td>${item.disponivel ? '<span class="badge bg-success">Sim</span>' : '<span class="badge bg-danger">Não</span>'}</td>
      <td>
        <button class="btn btn-sm adm-btn-edit" onclick="window.editCatalogoItem(${item.id})">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button class="btn btn-sm adm-btn-delete" onclick="window.deleteCatalogoItem(${item.id})">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
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

// Edita item do catálogo
window.editCatalogoItem = async function(id) {
  const item = catalogoItens.find(i => i.id === id);
  if (!item) return;
  
  // Abre o modal de edição
  const modalEditItem = new bootstrap.Modal(document.getElementById('modalEditCatalogoItem'));
  const form = document.getElementById('formEditCatalogoItem');
  
  if (form) {
    form.dataset.itemId = id;
    form.nome.value = item.nome;
    form.categoria_id.value = item.categoria_id || '';
    form.preco.value = item.preco || '';
    form.preco_promocional.value = item.preco_promocional || '';
    form.disponivel.checked = item.disponivel !== false;
    form.descricao.value = item.descricao || '';
    
    // Mostra a imagem atual
    const previewImg = document.getElementById('editCatalogoItemImagePreview');
    if (previewImg && item.imagem) {
      previewImg.src = item.imagem;
      previewImg.style.display = 'block';
    } else if (previewImg) {
      previewImg.style.display = 'none';
    }
    
    modalEditItem.show();
  }
};

// Exclui item do catálogo
window.deleteCatalogoItem = async function(id) {
  const item = catalogoItens.find(i => i.id === id);
  if (!item || !confirm(`Excluir item "${item.nome}" do catálogo?`)) {
    return;
  }
  
  try {
    await deleteCatalogoItem(id);
    await loadCatalogoItens();
  } catch (error) {
    console.error('Erro ao excluir item do catálogo:', error);
    alert('Erro ao excluir item do catálogo');
  }
};

// Adiciona evento no formulário de nova categoria
const formAddCatalogoCategoria = document.getElementById('formAddCatalogoCategoria');
if (formAddCatalogoCategoria) {
  formAddCatalogoCategoria.onsubmit = async function(e) {
    e.preventDefault();
    
    const categoria = {
      nome: formAddCatalogoCategoria.nome.value.trim(),
      descricao: formAddCatalogoCategoria.descricao.value.trim()
    };
    
    if (!categoria.nome) {
      alert('Digite um nome para a categoria');
      return;
    }
    
    try {
      await addCatalogoCategoria(categoria);
      await loadCatalogoCategorias();
      formAddCatalogoCategoria.reset();
      
      // Fecha o modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalAddCatalogoCategoria'));
      if (modal) modal.hide();
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      alert('Erro ao adicionar categoria');
    }
  };
}

// Adiciona evento no formulário de novo item
const formAddCatalogoItem = document.getElementById('formAddCatalogoItem');
if (formAddCatalogoItem) {
  formAddCatalogoItem.onsubmit = async function(e) {
    e.preventDefault();
    
    const formData = new FormData(formAddCatalogoItem);
    const imageFile = formAddCatalogoItem.imagem.files[0];
    
    const itemData = {
      nome: formData.get('nome'),
      categoria_id: formData.get('categoria_id'),
      preco: parseFloat(formData.get('preco')) || null,
      preco_promocional: parseFloat(formData.get('preco_promocional')) || null,
      disponivel: formData.get('disponivel') === 'on',
      descricao: formData.get('descricao')
    };
    
    // Adiciona o arquivo da imagem
    if (imageFile) {
      itemData.imageFile = imageFile;
    }
    
    if (!itemData.nome) {
      alert('Digite um nome para o item');
      return;
    }
    
    try {
      await addCatalogoItem(itemData);
      await loadCatalogoItens();
      formAddCatalogoItem.reset();
      
      // Fecha o modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalAddCatalogoItem'));
      if (modal) modal.hide();
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      alert('Erro ao adicionar item ao catálogo');
    }
  };
}

// Adiciona evento no formulário de edição
const formEditCatalogoItem = document.getElementById('formEditCatalogoItem');
if (formEditCatalogoItem) {
  formEditCatalogoItem.onsubmit = async function(e) {
    e.preventDefault();
    
    const id = parseInt(formEditCatalogoItem.dataset.itemId);
    if (!id) return;
    
    const formData = new FormData(formEditCatalogoItem);
    const imageFile = formEditCatalogoItem.imagem.files[0];
    
    const itemData = {
      nome: formData.get('nome'),
      categoria_id: formData.get('categoria_id'),
      preco: parseFloat(formData.get('preco')) || null,
      preco_promocional: parseFloat(formData.get('preco_promocional')) || null,
      disponivel: formData.get('disponivel') === 'on',
      descricao: formData.get('descricao'),
      updated_at: new Date()
    };
    
    // Adiciona o arquivo da imagem se houver
    if (imageFile) {
      itemData.imageFile = imageFile;
    }
    
    try {
      await updateCatalogoItem(id, itemData);
      await loadCatalogoItens();
      
      // Fecha o modal
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalEditCatalogoItem'));
      if (modal) modal.hide();
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      alert('Erro ao atualizar item do catálogo');
    }
  };
}

// Filtra itens por categoria
const filtroCategoriaSelect = document.getElementById('filtroCategoriaSelect');
if (filtroCategoriaSelect) {
  filtroCategoriaSelect.onchange = async function() {
    const categoriaId = this.value ? parseInt(this.value) : null;
    await loadCatalogoItens(categoriaId);
  };
}

// Preview de imagem para upload
function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
  if (input && preview) {
    input.onchange = function() {
      if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
          preview.src = e.target.result;
          preview.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
      } else {
        preview.style.display = 'none';
      }
    };
  }
}

// Inicialização
async function initializeApp() {
  console.log('Iniciando inicialização da aplicação...');
  
  // Função para esperar até que as dependências estejam prontas
  const waitForDependencies = () => {
    return new Promise((resolve) => {
      const check = () => {
        if (checkDependencies()) {
          // Atualiza as referências
          supabase = window.supabase;
          catalogoClient = window.catalogoClient;
          
          // Atribui as funções do catálogo
          ({
            fetchCatalogoCategorias,
            addCatalogoCategoria,
            updateCatalogoCategoria,
            deleteCatalogoCategoria,
            fetchCatalogoItens,
            addCatalogoItem,
            updateCatalogoItem,
            deleteCatalogoItem,
            uploadCatalogoImage
          } = window.catalogoClient);
          
          console.log('Todas as dependências foram carregadas');
          resolve();
        } else {
          console.log('Aguardando carregamento das dependências...');
          setTimeout(check, 100);
        }
      };
      check();
    });
  };
  
  try {
    // Espera as dependências carregarem
    await waitForDependencies();
    
    // Inicializa o catálogo
    console.log('Inicializando o catálogo...');
    initCatalogo();
    
    // Carrega dados iniciais
    console.log('Carregando categorias do catálogo...');
    await loadCatalogoCategorias();
    console.log('Categorias carregadas com sucesso');
    
    console.log('Carregando itens do catálogo...');
    await loadCatalogoItens();
    console.log('Itens do catálogo carregados com sucesso');
    
    // Exibe a seção principal após carregar os dados
    console.log('Exibindo conteúdo principal...');
    const loading = document.getElementById('loading');
    const mainContent = document.getElementById('main-content');
    
    if (loading) loading.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    
    console.log('Inicialização concluída com sucesso');
  } catch (error) {
    console.error('Erro durante a inicialização:', error);
    
    // Exibe mensagem de erro para o usuário
    const loading = document.getElementById('loading');
    if (loading) {
      loading.innerHTML = `
        <div class="alert alert-danger">
          <h4 class="alert-heading">Erro ao carregar o catálogo</h4>
          <p>${error.message || 'Erro desconhecido'}</p>
          <hr>
          <p class="mb-0">Por favor, recarregue a página ou tente novamente mais tarde.</p>
          <button class="btn btn-warning mt-2" onclick="window.location.reload()">Recarregar Página</button>
        </div>
      `;
    }
  }
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM completamente carregado, iniciando aplicação...');
  initializeApp();
});

// Expõe funções no escopo global para uso nos eventos HTML
window.loadCatalogoCategorias = loadCatalogoCategorias;
window.loadCatalogoItens = loadCatalogoItens;
