// admin_loja.js - Lógica da administração da loja Cezimbra Tattoo

// Aguarda Supabase e DOM
window.addEventListener('DOMContentLoaded', async () => {
  // Referências globais
  let categorias = [];
  let tatuagens = [];
  let categoriaAtual = null;
  let editTattooId = null;

  // Inicialização
  await carregarCategorias();
  await carregarTatuagens();
  configurarEventos();

  // Carregar categorias
  async function carregarCategorias() {
    try {
      categorias = await window.catalogoClient.buscarCategorias();
      renderizarCategorias();
      renderizarOpcoesCategorias();
    } catch (err) {
      alert('Erro ao carregar categorias: ' + (err.message || err));
    }
  }

  // Carregar tatuagens
  async function carregarTatuagens() {
    try {
      tatuagens = await window.catalogoClient.buscarItens();
      renderizarTatuagens();
    } catch (err) {
      alert('Erro ao carregar tatuagens: ' + (err.message || err));
    }
  }

  // Renderização de categorias
  function renderizarCategorias() {
    const tbody = document.getElementById('categoriasTableBody');
    tbody.innerHTML = '';
    categorias.forEach(cat => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cat.nome}</td>
        <td>${cat.descricao || ''}</td>
        <td>
          <button class="btn btn-sm btn-edit" onclick="editarCategoria(${cat.id})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-delete" onclick="excluirCategoria(${cat.id})"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Renderização das opções de categoria nos formulários
  function renderizarOpcoesCategorias() {
    const selects = document.querySelectorAll('[name="categoria"]');
    selects.forEach(select => {
      select.innerHTML = '<option value="">Selecione</option>' + categorias.map(cat => `<option value="${cat.id}">${cat.nome}</option>`).join('');
    });
  }

  // Renderização de tatuagens
  function renderizarTatuagens() {
    const tbody = document.getElementById('tattoosTableBody');
    tbody.innerHTML = '';
    tatuagens.forEach(tattoo => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${tattoo.imagem_base64 ? `<img src="${tattoo.imagem_base64}" class="tattoo-thumb">` : (tattoo.imagem ? `<img src="${tattoo.imagem}" class="tattoo-thumb">` : '')}</td>
        <td>${tattoo.nome}</td>
        <td>${categorias.find(c => c.id === tattoo.categoria_id)?.nome || ''}</td>
        <td>R$ ${tattoo.preco?.toFixed(2) || '-'}</td>
        <td>${tattoo.preco_promocional ? 'R$ ' + tattoo.preco_promocional.toFixed(2) : '-'}</td>
        <td>
          <button class="btn btn-sm btn-edit" onclick="editarTattoo(${tattoo.id})"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-sm btn-delete" onclick="excluirTattoo(${tattoo.id})"><i class="bi bi-trash"></i></button>
        </td>
      `;
      tbody.appendChild(tr);
    });
    // Atualiza contador de tatuagens
    const contador = document.getElementById('tattooCount');
    if (contador) contador.textContent = tatuagens.length;
  }

  // Eventos principais
  function configurarEventos() {
    // Atualizar lista de tatuagens
    document.getElementById('btnRefreshTattoos').onclick = carregarTatuagens;

    // Formulário de categoria
    document.getElementById('formCategoria').onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('categoriaId').value;
      const nome = document.getElementById('categoriaNome').value.trim();
      const descricao = document.getElementById('categoriaDescricao').value.trim();
      if (!nome) return alert('Nome obrigatório');
      try {
        if (id) {
          await window.catalogoClient.atualizarCategoria(parseInt(id), { nome, descricao });
        } else {
          await window.catalogoClient.adicionarCategoria({ nome, descricao });
        }
        await carregarCategorias();
        bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategoria')).hide();
      } catch (err) {
        alert('Erro ao salvar categoria: ' + (err.message || err));
      }
    };



    // --- Wizard de cadastro em massa ---
    let wizardFiles = [];
    let wizardIndex = 0;
    let wizardInputs = [];

    const wizardStep1 = document.getElementById('wizardStep1');
    const wizardStep2 = document.getElementById('wizardStep2');
    const wizardStep3 = document.getElementById('wizardStep3');
    const wizardNextBtn = document.getElementById('wizardNextBtn');
    const wizardPrevBtn = document.getElementById('wizardPrevBtn');
    const wizardNextImageBtn = document.getElementById('wizardNextImageBtn');
    const wizardFinishBtn = document.getElementById('wizardFinishBtn');
    const wizardRestartBtn = document.getElementById('wizardRestartBtn');
    const wizardTattooImages = document.getElementById('wizardTattooImages');
    const wizardImagePreview = document.getElementById('wizardImagePreview');
    const wizardTattooInputs = document.getElementById('wizardTattooInputs');
    const wizardTattooForm = document.getElementById('wizardTattooForm');

    function showWizardStep(step) {
      [wizardStep1, wizardStep2, wizardStep3].forEach((el, idx) => {
        if (idx === step) {
          el.classList.remove('d-none');
          el.style.opacity = 1;
          el.style.transform = 'scale(1)';
        } else {
          el.classList.add('d-none');
          el.style.opacity = 0;
          el.style.transform = 'scale(0.98)';
        }
      });
    }

    wizardTattooImages.onchange = function(e) {
      wizardFiles = Array.from(e.target.files).slice(0, 50);
      wizardIndex = 0;
      wizardInputs = wizardFiles.map(() => ({ nome: '', local: '', tamanho: '', descricao: '', preco: '', preco_promocional: '', categoria_id: '' }));
      wizardNextBtn.disabled = wizardFiles.length === 0;
    };

    wizardNextBtn.onclick = function() {
      if (wizardFiles.length === 0) return;
      renderWizardTattooForm();
      showWizardStep(1);
    };

    wizardPrevBtn.onclick = function() {
      if (wizardIndex > 0) {
        wizardIndex--;
        renderWizardTattooForm();
      }
    };

    wizardNextImageBtn.onclick = function() {
      if (!validateWizardInputs()) return;
      if (wizardIndex < wizardFiles.length - 1) {
        wizardIndex++;
        renderWizardTattooForm();
      }
    };

    wizardRestartBtn.onclick = function() {
      wizardTattooImages.value = '';
      wizardFiles = [];
      wizardIndex = 0;
      wizardInputs = [];
      showWizardStep(0);
      wizardNextBtn.disabled = true;
    };

    function validateWizardInputs() {
      const nome = wizardTattooInputs.querySelector('[name="nome"]');
      const categoria = wizardTattooInputs.querySelector('[name="categoria_id"]');
      if (!nome.value.trim()) { nome.focus(); return false; }
      if (!categoria.value) { categoria.focus(); return false; }
      // Salva os dados
      wizardInputs[wizardIndex] = {
        nome: nome.value.trim(),
        local: wizardTattooInputs.querySelector('[name="local"]').value.trim(),
        tamanho: wizardTattooInputs.querySelector('[name="tamanho"]').value.trim(),
        descricao: wizardTattooInputs.querySelector('[name="descricao"]').value.trim(),
        preco: wizardTattooInputs.querySelector('[name="preco"]').value,
        preco_promocional: wizardTattooInputs.querySelector('[name="preco_promocional"]').value,
        categoria_id: categoria.value
      };
      return true;
    }

    function renderWizardTattooForm() {
      const file = wizardFiles[wizardIndex];
      const url = URL.createObjectURL(file);
      wizardImagePreview.innerHTML = `<img src="${url}" alt="preview">`;
      const dados = wizardInputs[wizardIndex] || {};
      wizardTattooInputs.innerHTML = `
        <div class="mb-2"><label>Nome:<input type="text" name="nome" class="form-control" value="${dados.nome || ''}" required></label></div>
        <div class="mb-2"><label>Local:<input type="text" name="local" class="form-control" value="${dados.local || ''}"></label></div>
        <div class="mb-2"><label>Tamanho:<input type="text" name="tamanho" class="form-control" value="${dados.tamanho || ''}"></label></div>
        <div class="mb-2"><label>Descrição:<input type="text" name="descricao" class="form-control" value="${dados.descricao || ''}"></label></div>
        <div class="mb-2"><label>Valor:<input type="number" min="0" step="0.01" name="preco" class="form-control" value="${dados.preco || ''}"></label></div>
        <div class="mb-2"><label>Valor Promocional:<input type="number" min="0" step="0.01" name="preco_promocional" class="form-control" value="${dados.preco_promocional || ''}"></label></div>
        <div class="mb-2"><label>Categoria:<select name="categoria_id" class="form-select" required></select></label></div>
        <div class="text-muted small">Tatuagem ${wizardIndex+1} de ${wizardFiles.length}</div>
      `;
      // Preenche categorias
      const select = wizardTattooInputs.querySelector('[name="categoria_id"]');
      select.innerHTML = '<option value="">Selecione</option>' + categorias.map(cat => `<option value="${cat.id}" ${cat.id == dados.categoria_id ? 'selected' : ''}>${cat.nome}</option>`).join('');
      // Navegação
      wizardPrevBtn.disabled = wizardIndex === 0;
      wizardNextImageBtn.classList.toggle('d-none', wizardIndex === wizardFiles.length - 1);
      wizardFinishBtn.classList.toggle('d-none', wizardIndex !== wizardFiles.length - 1);
    }

    wizardTattooForm.onsubmit = async function(e) {
      e.preventDefault();
      if (!validateWizardInputs()) return;
      // Cadastro em lote
      try {
        for (let idx = 0; idx < wizardFiles.length; idx++) {
          const file = wizardFiles[idx];
          const dados = wizardInputs[idx];
          const imagem = await window.catalogoClient.fazerUploadImagem(file);
          await window.catalogoClient.adicionarItem({
            nome: dados.nome,
            categoria_id: dados.categoria_id,
            preco: parseFloat(dados.preco) || 0,
            preco_promocional: dados.preco_promocional ? parseFloat(dados.preco_promocional) : null,
            imagem_base64: imagem,
            disponivel: true,
            descricao: dados.descricao,
            detalhes: { local: dados.local, tamanho: dados.tamanho }
          });
        }
        showWizardStep(2);
        await carregarTatuagens();
      } catch (err) {
        alert('Erro ao cadastrar tatuagens: ' + (err.message || err));
      }
    };

    showWizardStep(0);
  }

  // Editar categoria
  window.editarCategoria = function(id) {
    const cat = categorias.find(c => c.id === id);
    if (!cat) return;
    document.getElementById('categoriaId').value = cat.id;
    document.getElementById('categoriaNome').value = cat.nome;
    document.getElementById('categoriaDescricao').value = cat.descricao || '';
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalCategoria')).show();
  };
  // Excluir categoria
  window.excluirCategoria = async function(id) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await window.catalogoClient.removerCategoria(id);
      await carregarCategorias();
      await carregarTatuagens();
    } catch (err) {
      alert('Erro ao excluir categoria: ' + (err.message || err));
    }
  };
  // Editar tatuagem
  window.editarTattoo = function(id) {
    const tattoo = tatuagens.find(t => t.id === id);
    if (!tattoo) return;
    editTattooId = id;
    // Preencher formulário do modal
    let html = '';
    html += `<input type='hidden' name='id' value='${tattoo.id}'>`;
    html += `<div><label>Nome:<input type='text' name='nome' class='form-control' value='${tattoo.nome || ''}' required></label></div>`;
    html += `<div><label>Local:<input type='text' name='local' class='form-control' value='${tattoo.detalhes?.local || ''}'></label></div>`;
    html += `<div><label>Tamanho:<input type='text' name='tamanho' class='form-control' value='${tattoo.detalhes?.tamanho || ''}'></label></div>`;
    html += `<div><label>Descrição:<textarea name='descricao' class='form-control'>${tattoo.descricao || ''}</textarea></label></div>`;
    html += `<div><label>Valor:<input type='number' min='0' step='0.01' name='preco' class='form-control' value='${tattoo.preco || ''}'></label></div>`;
    html += `<div><label>Valor Promocional:<input type='number' min='0' step='0.01' name='preco_promocional' class='form-control' value='${tattoo.preco_promocional || ''}'></label></div>`;
    html += `<div><label>Categoria:<select name='categoria' class='form-select' required>${categorias.map(cat => `<option value='${cat.id}' ${cat.id === tattoo.categoria_id ? 'selected' : ''}>${cat.nome}</option>`).join('')}</select></label></div>`;
    html += `<div><label>Imagem:<input type='file' name='imagem' class='form-control'></label></div>`;
    if (tattoo.imagem) html += `<div><img src='${tattoo.imagem}' class='tattoo-thumb mt-2'></div>`;
    document.getElementById('editTattooFormBody').innerHTML = html;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalEditTattoo')).show();
  };
  // Excluir tatuagem
  window.excluirTattoo = async function(id) {
    if (!confirm('Tem certeza que deseja excluir esta tatuagem?')) return;
    try {
      await window.catalogoClient.removerItem(id);
      await carregarTatuagens();
    } catch (err) {
      alert('Erro ao excluir tatuagem: ' + (err.message || err));
    }
  };

  // Preview das imagens selecionadas
  function handleMultiUploadPreview(e) {
    const file = e.target.files[0];
    const previewDiv = document.getElementById('multiUploadPreview');
    const formsDiv = document.getElementById('multiUploadForms');
    previewDiv.innerHTML = '';
    formsDiv.innerHTML = '';
    if (file) {
      const url = URL.createObjectURL(file);
      previewDiv.innerHTML = `<img src="${url}" alt="preview">`;
      formsDiv.innerHTML = `
        <div class="border rounded p-2 mb-2 tattoo-form-grid bg-black bg-opacity-25">
          <h6 class="fw-bold">Nova Tatuagem</h6>
          <div><label>Nome:<input type="text" name="nome_0" class="form-control" required></label></div>
          <div><label>Local:<input type="text" name="local_0" class="form-control"></label></div>
          <div><label>Tamanho:<input type="text" name="tamanho_0" class="form-control"></label></div>
          <div><label>Descrição:<input type="text" name="descricao_0" class="form-control"></label></div>
          <div><label>Valor:<input type="number" min="0" step="0.01" name="preco_0" class="form-control"></label></div>
          <div><label>Valor Promocional:<input type="number" min="0" step="0.01" name="preco_promocional_0" class="form-control"></label></div>
          <div><label>Categoria:<select name="categoria_0" class="form-select" required></select></label></div>
        </div>
      `;
      categorias.forEach(cat => {
        formsDiv.querySelector(`select[name="categoria_0"]`).innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
      });
    }
  }

  // Upload em massa das tatuagens
  async function handleMultiUploadSubmit(e) {
    e.preventDefault();
    const fileInput = document.getElementById('multiTattooImages');
    const file = fileInput.files[0];
    if (!file) return alert('Selecione uma imagem.');
    const formsDiv = document.getElementById('multiUploadForms');
    const form = formsDiv.querySelector('.tattoo-form-grid');
    if (!form) return alert('Preencha o formulário da tatuagem.');
    const nome = form.querySelector(`[name="nome_0"]`).value.trim();
    const local = form.querySelector(`[name="local_0"]`).value.trim();
    const tamanho = form.querySelector(`[name="tamanho_0"]`).value.trim();
    const descricao = form.querySelector(`[name="descricao_0"]`).value.trim();
    const preco = parseFloat(form.querySelector(`[name="preco_0"]`).value) || 0;
    const preco_promocional = parseFloat(form.querySelector(`[name="preco_promocional_0"]`).value) || null;
    const categoria_id = form.querySelector(`[name="categoria_0"]`).value;
    try {
      const imagem = await window.catalogoClient.fazerUploadImagem(file);
      await window.catalogoClient.adicionarItem({
        nome,
        categoria_id,
        preco,
        preco_promocional,
        imagem_base64: imagem,
        disponivel: true,
        descricao,
        detalhes: { local, tamanho }
      });
      alert('Tatuagem cadastrada com sucesso!');
      document.getElementById('formMultiUpload').reset();
      document.getElementById('multiUploadPreview').innerHTML = '';
      document.getElementById('multiUploadForms').innerHTML = '';
      await carregarTatuagens();
    } catch (err) {
      console.error('Falha ao enviar tatuagem', err);
      alert(`Erro ao enviar a tatuagem: ${err.message || err}`);
    }
  }
});
