// loja.js - Catálogo público estilo Pinterest com filtro, carrinho e reserva

let categorias = [];
let tatuagens = [];
let filtroCategoriaId = null;
let carrinho = [];

window.addEventListener('DOMContentLoaded', async () => {
  await carregarCategorias();
  await carregarTatuagens();
  renderizarCarrinhoBtn();
  configurarEventos();
});

async function carregarCategorias() {
  try {
    categorias = await window.catalogoClient.buscarCategorias();
    renderizarCategoriasFiltro();
  } catch (err) {
    alert('Erro ao carregar categorias: ' + (err.message || err));
  }
}

async function carregarTatuagens() {
  try {
    const filtros = filtroCategoriaId ? { categoria_id: filtroCategoriaId, disponivel: true } : { disponivel: true };
    tatuagens = await window.catalogoClient.buscarItens(filtros);
    renderizarTatuagens();
  } catch (err) {
    alert('Erro ao carregar tatuagens: ' + (err.message || err));
  }
}

function renderizarCategoriasFiltro() {
  const div = document.getElementById('categoriasFiltro');
  div.innerHTML = '<button class="btn btn-outline-warning categoria-btn" data-id="">Todas</button>' +
    categorias.map(cat => `<button class="btn btn-outline-warning categoria-btn" data-id="${cat.id}">${cat.nome}</button>`).join('');
  div.querySelectorAll('button').forEach(btn => {
    btn.onclick = () => {
      filtroCategoriaId = btn.dataset.id ? parseInt(btn.dataset.id) : null;
      carregarTatuagens();
      div.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    };
  });
}

function renderizarTatuagens() {
  const grid = document.getElementById('tattooGrid');
  grid.innerHTML = '';
  if (!tatuagens.length) {
    grid.innerHTML = '<div class="text-center text-muted">Nenhuma tatuagem encontrada.</div>';
    return;
  }
  for (const tattoo of tatuagens) {
    grid.innerHTML += `
      <div class="tattoo-card" onclick="abrirDetalheTattoo(${tattoo.id})">
        <img src="${tattoo.imagem || ''}" class="tattoo-img mb-2" alt="Tattoo">
        <div class="tattoo-title">${tattoo.nome}</div>
        <div>${categorias.find(c=>c.id===tattoo.categoria_id)?.nome || ''}</div>
        <div class="tattoo-price">
          R$ ${tattoo.preco?.toFixed(2) || '-'}
          ${tattoo.preco_promocional ? `<span class='tattoo-old-price'>R$ ${tattoo.preco_promocional.toFixed(2)}</span>` : ''}
        </div>
      </div>
    `;
  }
}

window.abrirDetalheTattoo = function(id) {
  const tattoo = tatuagens.find(t => t.id === id);
  if (!tattoo) return;
  let html = `<div class='row'>
    <div class='col-md-5 text-center mb-3'><img src='${tattoo.imagem || ''}' class='img-fluid rounded'></div>
    <div class='col-md-7'>
      <h4 class='fw-bold mb-2'>${tattoo.nome}</h4>
      <div class='mb-2'><span class='tattoo-badge'>${categorias.find(c=>c.id===tattoo.categoria_id)?.nome || ''}</span></div>
      <div class='mb-2'><b>Valor:</b> R$ ${tattoo.preco?.toFixed(2) || '-'}</div>
      ${tattoo.preco_promocional ? `<div class='mb-2'><b>Promoção:</b> R$ ${tattoo.preco_promocional.toFixed(2)}</div>` : ''}
      <div class='mb-2'><b>Local:</b> ${tattoo.detalhes?.local || '-'}</div>
      <div class='mb-2'><b>Tamanho:</b> ${tattoo.detalhes?.tamanho || '-'}</div>
      <div class='mb-2'><b>Descrição:</b><br>${tattoo.descricao || '-'}</div>
    </div>
  </div>`;
  document.getElementById('tattooDetalheBody').innerHTML = html;
  const btn = document.getElementById('btnAddCarrinho');
  btn.onclick = () => adicionarAoCarrinho(tattoo.id);
  new bootstrap.Modal(document.getElementById('modalTattooDetalhe')).show();
}

function adicionarAoCarrinho(id) {
  if (!carrinho.includes(id)) carrinho.push(id);
  renderizarCarrinhoBtn();
  new bootstrap.Modal(document.getElementById('modalTattooDetalhe')).hide();
}

function renderizarCarrinhoBtn() {
  const btn = document.getElementById('btnCarrinho');
  btn.style.display = carrinho.length ? 'inline-block' : 'none';
  document.getElementById('cartCount').textContent = carrinho.length;
  btn.onclick = abrirCarrinho;
}

function abrirCarrinho() {
  const body = document.getElementById('carrinhoBody');
  if (!carrinho.length) {
    body.innerHTML = '<div class="text-center text-muted">Seu carrinho está vazio.</div>';
  } else {
    body.innerHTML = carrinho.map(id => {
      const tattoo = tatuagens.find(t => t.id === id);
      if (!tattoo) return '';
      return `<div class='d-flex align-items-center mb-2'><img src='${tattoo.imagem || ''}' style='width:60px;height:60px;object-fit:cover;border-radius:8px;margin-right:10px;'><div><div class='fw-bold'>${tattoo.nome}</div><div class='small text-muted'>R$ ${tattoo.preco?.toFixed(2) || '-'}</div></div><button class='btn btn-sm btn-outline-danger ms-auto' onclick='removerDoCarrinho(${id})'><i class="bi bi-trash"></i></button></div>`;
    }).join('');
  }
  new bootstrap.Modal(document.getElementById('modalCarrinho')).show();
  document.getElementById('btnReservarTattoo').onclick = abrirModalReserva;
}

window.removerDoCarrinho = function(id) {
  carrinho = carrinho.filter(cid => cid !== id);
  renderizarCarrinhoBtn();
  abrirCarrinho();
}

function abrirModalReserva() {
  new bootstrap.Modal(document.getElementById('modalCarrinho')).hide();
  document.getElementById('formReserva').reset();
  new bootstrap.Modal(document.getElementById('modalReserva')).show();
}

function configurarEventos() {
  document.getElementById('formReserva').onsubmit = async (e) => {
    e.preventDefault();
    if (!carrinho.length) return alert('Carrinho vazio!');
    const form = e.target;
    const nome = form.nome.value.trim();
    const telefone = form.telefone.value.trim();
    const obs = form.obs.value.trim();
    const pagamento = form.pagamento.value;
    if (!nome || !telefone || !pagamento) return alert('Preencha todos os campos obrigatórios.');
    // Aqui você pode integrar com Supabase para salvar a reserva
    alert('Reserva realizada com sucesso! (simulação)\nEntraremos em contato para confirmar.');
    carrinho = [];
    renderizarCarrinhoBtn();
    new bootstrap.Modal(document.getElementById('modalReserva')).hide();
  };
}
