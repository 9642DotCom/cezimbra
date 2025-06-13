// catalogo-client.js - Integração com o catálogo do Supabase

console.log('=== INICIALIZAÇÃO CATALOGO-CLIENT.JS ===');

// Verifica se o Supabase está disponível
if (typeof window.supabase === 'undefined') {
  console.error('ERRO: Supabase não está disponível');
  throw new Error('Supabase não está disponível');
}

// Usa o cliente Supabase global diretamente sem criar nova constante
console.log('Cliente Supabase disponível no catalogo-client.js:', !!window.supabase);

// ==================== Categorias ====================

/**
 * Busca todas as categorias do catálogo.
 * @returns {Promise<Array>} Lista de categorias.
 */
async function buscarCategorias() {
  try {
    const { data, error } = await window.supabase
      .from('catalogo_categorias')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    throw error;
  }
}

/**
 * Adiciona uma nova categoria ao catálogo.
 * @param {Object} categoria - Dados da categoria a ser adicionada.
 * @returns {Promise<Object>} Categoria adicionada.
 */
async function adicionarCategoria(categoria) {
  try {
    const { data, error } = await window.supabase
      .from('catalogo_categorias')
      .insert([categoria])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
    throw error;
  }
}

/**
 * Atualiza uma categoria existente no catálogo.
 * @param {number} id - ID da categoria a ser atualizada.
 * @param {Object} atualizacoes - Dados atualizados da categoria.
 * @returns {Promise<Object>} Categoria atualizada.
 */
async function atualizarCategoria(id, atualizacoes) {
  try {
    const { data, error } = await window.supabase
      .from('catalogo_categorias')
      .update(atualizacoes)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    throw error;
  }
}

/**
 * Remove uma categoria do catálogo.
 * @param {number} id - ID da categoria a ser removida.
 * @returns {Promise<boolean>} True se a categoria foi removida com sucesso.
 */
async function removerCategoria(id) {
  try {
    // Verifica se existem itens nesta categoria
    const { data: itens, error: itensError } = await window.supabase
      .from('catalogo_itens')
      .select('id')
      .eq('categoria_id', id);
    
    if (itensError) throw itensError;
    
    if (itens && itens.length > 0) {
      throw new Error('Não é possível excluir uma categoria que possui itens');
    }
    
    const { error } = await window.supabase
      .from('catalogo_categorias')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao remover categoria:', error);
    throw error;
  }
}

// ==================== Itens ====================

/**
 * Busca itens do catálogo com base em filtros.
 * @param {Object} filtros - Filtros para a busca de itens.
 * @returns {Promise<Array>} Lista de itens.
 */
async function buscarItens(filtros = {}) {
  try {
    let query = window.supabase
      .from('catalogo_itens')
      .select(`
        *,
        categoria:categoria_id (id, nome)
      `);
    
    // Aplica filtros
    if (filtros.categoria_id) {
      query = query.eq('categoria_id', filtros.categoria_id);
    }
    
    if (filtros.disponivel !== undefined) {
      query = query.eq('disponivel', filtros.disponivel);
    }
    
    if (filtros.busca) {
      query = query.ilike('nome', `%${filtros.busca}%`);
    }
    
    const { data, error } = await query.order('nome');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar itens:', error);
    throw error;
  }
}

/**
 * Busca um item do catálogo por ID.
 * @param {number} id - ID do item a ser buscado.
 * @returns {Promise<Object>} Item buscado.
 */
async function buscarItemPorId(id) {
  try {
    const { data, error } = await window.supabase
      .from('catalogo_itens')
      .select(`
        *,
        categoria:categoria_id (id, nome)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    throw error;
  }
}

/**
 * Adiciona um novo item ao catálogo.
 * @param {Object} item - Dados do item a ser adicionado.
 * @returns {Promise<Object>} Item adicionado.
 */
async function adicionarItem(item) {
  try {
    const { data, error } = await window.supabase
      .from('catalogo_itens')
      .insert([item])
      .select(`
        *,
        categoria:categoria_id (id, nome)
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    throw error;
  }
}

/**
 * Atualiza um item existente no catálogo.
 * @param {number} id - ID do item a ser atualizado.
 * @param {Object} atualizacoes - Dados atualizados do item.
 * @returns {Promise<Object>} Item atualizado.
 */
async function atualizarItem(id, atualizacoes) {
  try {
    const { data, error } = await window.supabase
      .from('catalogo_itens')
      .update({
        ...atualizacoes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        categoria:categoria_id (id, nome)
      `)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    throw error;
  }
}

/**
 * Remove um item do catálogo.
 * @param {number} id - ID do item a ser removido.
 * @returns {Promise<boolean>} True se o item foi removido com sucesso.
 */
async function removerItem(id) {
  try {
    const { error } = await window.supabase
      .from('catalogo_itens')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Erro ao remover item:', error);
    throw error;
  }
}

// ==================== Upload de Imagens ====================

/**
 * Faz o upload de uma imagem para o catálogo.
 * @param {File} arquivo - Arquivo da imagem a ser enviada.
 * @param {string} pasta - Pasta onde a imagem será armazenada.
 * @returns {Promise<string>} URL da imagem enviada.
 */
async function fazerUploadImagem(arquivo, pasta = 'itens') {
  try {
    const extensao = arquivo.name.split('.').pop();
    const nomeArquivo = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${extensao}`;
    const caminhoArquivo = `${pasta}/${nomeArquivo}`;
    
    const { data, error } = await window.supabase.storage
      .from('catalogo')
      .upload(caminhoArquivo, arquivo);
    
    if (error) throw error;
    
    // Obtém a URL pública da imagem
    const { data: { publicUrl } } = window.supabase.storage
      .from('catalogo')
      .getPublicUrl(caminhoArquivo);
    
    return publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    throw error;
  }
}

// Exporta as funções para o escopo global
window.catalogoClient = {
  // Categorias
  buscarCategorias,
  adicionarCategoria,
  atualizarCategoria,
  removerCategoria,
  
  // Itens
  buscarItens,
  buscarItemPorId,
  adicionarItem,
  atualizarItem,
  removerItem,
  
  // Upload
  fazerUploadImagem
};

console.log('=== CATALOGO-CLIENT INICIALIZADO ===');

// Executa o teste de conexão em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  // Testa a conexão com o Supabase
  async function testarConexao() {
    try {
      console.log('Testando conexão com o catálogo...');
      const { data, error } = await window.supabase
        .from('catalogo_categorias')
        .select('*')
        .limit(1);
      
      if (error) throw error;
      
      console.log('Conexão com o catálogo estabelecida com sucesso!');
      console.log('Dados de teste:', data);
      return true;
    } catch (error) {
      console.error('Erro ao conectar ao catálogo:', error);
      return false;
    }
  }
  
  testarConexao();
}

// Exporta as funções para uso global
window.catalogoClient = {
  fetchCatalogoCategorias,
  addCatalogoCategoria,
  updateCatalogoCategoria,
  deleteCatalogoCategoria,
  fetchCatalogoItens,
  addCatalogoItem,
  updateCatalogoItem,
  deleteCatalogoItem,
  uploadCatalogoImage
};

console.log('=== FIM DA INICIALIZAÇÃO CATALOGO-CLIENT.JS ===');

// Funções para categorias do catálogo
async function fetchCatalogoCategorias() {
  console.log('=== fetchCatalogoCategorias iniciada ===');
  try {
    console.log('Verificando cliente Supabase...');
    console.log('Tipo de supabase:', typeof supabase);
    console.log('Cliente supabase disponível?', !!supabase);
    
    if (!supabase) {
      const error = new Error('Cliente Supabase não inicializado');
      console.error('Erro:', error.message);
      throw error;
    }
    
    console.log('Iniciando consulta ao Supabase...');
    console.log('Tabela: catalogo_categorias');
    
    const query = supabase
      .from('catalogo_categorias')
      .select('*')
      .order('nome');
    
    console.log('Query construída, executando...');
    const { data, error } = await query;

    if (error) {
      console.error('Erro na consulta ao Supabase:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        details: error.details
      });
      throw error;
    }
    
    console.log(`Sucesso! ${data?.length || 0} categorias encontradas`);
    console.log('Primeiras 3 categorias:', data?.slice(0, 3));
    return data || [];
  } catch (error) {
    console.error('Erro em fetchCatalogoCategorias:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error; // Propaga o erro para quem chamou
  } finally {
    console.log('=== fetchCatalogoCategorias finalizada ===');
  }
}

async function addCatalogoCategoria(categoria) {
  try {
    console.log(`Adicionando categoria ao catálogo: ${categoria.nome}`);
    
    // Verificar se a categoria já existe
    const { data: existingCategory } = await supabase
      .from('catalogo_categorias')
      .select('id')
      .eq('nome', categoria.nome)
      .maybeSingle();
    
    if (existingCategory) {
      console.log(`A categoria '${categoria.nome}' já existe no catálogo`);
      return existingCategory;
    }
    
    // Adicionar nova categoria
    const { data, error } = await supabase
      .from('catalogo_categorias')
      .insert([categoria])
      .select();

    if (error) throw error;
    console.log(`Categoria '${categoria.nome}' adicionada com sucesso ao catálogo`);
    return data[0];
  } catch (error) {
    console.error('Erro ao adicionar categoria ao catálogo:', error);
    throw error;
  }
}

async function updateCatalogoCategoria(id, categoria) {
  try {
    console.log(`Atualizando categoria ID ${id} do catálogo`);
    
    const { data, error } = await supabase
      .from('catalogo_categorias')
      .update(categoria)
      .eq('id', id)
      .select();

    if (error) throw error;
    console.log('Categoria do catálogo atualizada com sucesso:', data[0]);
    return data[0];
  } catch (error) {
    console.error(`Erro ao atualizar categoria ${id} do catálogo:`, error);
    throw error;
  }
}

async function deleteCatalogoCategoria(id) {
  try {
    console.log(`Deletando categoria ID: ${id} do catálogo`);
    
    const { error } = await supabase
      .from('catalogo_categorias')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    console.log(`Categoria ID ${id} deletada com sucesso do catálogo`);
    return true;
  } catch (error) {
    console.error('Erro ao excluir categoria do catálogo:', error);
    return false;
  }
}

// Funções para itens do catálogo
async function fetchCatalogoItens(categoriaId = null) {
  try {
    let query = supabase
      .from('catalogo_itens')
      .select(`
        *,
        catalogo_categorias:categoria_id (id, nome)
      `)
      .order('nome');
    
    if (categoriaId) {
      query = query.eq('categoria_id', categoriaId);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    
    console.log(`${data.length} itens do catálogo encontrados`);
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar itens do catálogo:', error);
    return [];
  }
}

async function addCatalogoItem(itemData) {
  try {
    console.log('Adicionando novo item ao catálogo:', itemData);
    
    // Extrair a imagem da data para upload separado
    const { imageFile, ...itemInfo } = itemData;
    
    // Adicionar o item no banco
    const { data, error } = await supabase
      .from('catalogo_itens')
      .insert([itemInfo])
      .select();

    if (error) throw error;
    
    // Upload da imagem se fornecida
    if (imageFile) {
      const imageUrl = await uploadCatalogoImage(imageFile, data[0].id);
      
      // Atualizar o registro com a URL da imagem
      if (imageUrl) {
        const { error: updateError } = await supabase
          .from('catalogo_itens')
          .update({ imagem: imageUrl })
          .eq('id', data[0].id);
        
        if (updateError) throw updateError;
        data[0].imagem = imageUrl;
      }
    }
    
    console.log('Item adicionado com sucesso ao catálogo:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Erro ao adicionar item ao catálogo:', error);
    throw error;
  }
}

async function updateCatalogoItem(id, itemData) {
  try {
    console.log(`Atualizando item ID ${id} do catálogo com dados:`, itemData);
    
    // Extrair a imagem da data para upload separado
    const { imageFile, ...itemInfo } = itemData;
    
    // Se houver uma nova imagem, fazer o upload
    if (imageFile) {
      const imageUrl = await uploadCatalogoImage(imageFile, id);
      if (imageUrl) {
        itemInfo.imagem = imageUrl;
      }
    }
    
    const { data, error } = await supabase
      .from('catalogo_itens')
      .update(itemInfo)
      .eq('id', id)
      .select();

    if (error) throw error;
    console.log('Item do catálogo atualizado com sucesso:', data[0]);
    return data[0];
  } catch (error) {
    console.error(`Erro ao atualizar item ${id} do catálogo:`, error);
    throw error;
  }
}

async function deleteCatalogoItem(id) {
  try {
    console.log(`Deletando item ID: ${id} do catálogo`);
    
    // Primeiro, buscar o item para obter a URL da imagem
    const { data: item, error: fetchError } = await supabase
      .from('catalogo_itens')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`Erro ao buscar item ID ${id} do catálogo:`, fetchError);
      if (fetchError.code === 'PGRST116') {
        console.log('Item já foi deletado anteriormente.');
        return true; // Já está deletado
      }
      throw fetchError;
    }
    
    if (!item) {
      console.error(`Item com ID ${id} não encontrado no catálogo.`);
      return false;
    }
    
    // Excluir o registro do item
    const { error } = await supabase
      .from('catalogo_itens')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Se o item tem imagem, tenta removê-la do storage
    if (item.imagem) {
      try {
        // Extrai o nome do arquivo da URL
        const imagePath = item.imagem.split('/').pop();
        
        if (imagePath) {
          console.log('Tentando remover imagem do catálogo:', imagePath);
          
          const { error: storageError } = await supabase.storage
            .from('catalogo')
            .remove([imagePath]);
            
          if (storageError) {
            console.error('Erro ao excluir imagem do catálogo:', storageError);
          } else {
            console.log('Imagem do catálogo removida com sucesso');
          }
        }
      } catch (imageError) {
        console.error('Erro ao processar deleção da imagem do catálogo:', imageError);
      }
    }
    
    console.log(`Item ID ${id} deletado com sucesso do catálogo`);
    return true;
  } catch (error) {
    console.error('Erro ao excluir item do catálogo:', error);
    return false;
  }
}

// Função de upload de imagens para o catálogo
async function uploadCatalogoImage(file, itemId) {
  try {
    console.log('Iniciando upload de imagem para o catálogo...');
    
    // Verificar se o bucket 'catalogo' existe, criar se não existir
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some(b => b.name === 'catalogo');
    
    if (!bucketExists) {
      console.log('Bucket "catalogo" não encontrado. Tentando criar...');
      const { error: createError } = await supabase.storage.createBucket('catalogo', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760  // 10MB em bytes
      });
      
      if (createError) {
        console.error('Erro ao criar bucket para o catálogo:', createError);
        throw createError;
      }
    }
    
    // Gerar nome de arquivo único
    const fileExt = file.name.split('.').pop();
    const fileName = `catalogo_${itemId || Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    console.log(`Enviando arquivo ${fileName} para o bucket catalogo...`);
    
    // Upload da imagem para o Storage
    const { error: uploadError, data } = await supabase.storage
      .from('catalogo')
      .upload(fileName, file);

    if (uploadError) throw uploadError;
    
    // Gerar URL pública para a imagem
    const { data: publicURL } = supabase.storage
      .from('catalogo')
      .getPublicUrl(fileName);
    
    console.log('Upload concluído com sucesso. URL:', publicURL.publicUrl);
    return publicURL.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem para o catálogo:', error);
    return null;
  }
}

// Expõe as funções no escopo global
window.catalogoClient = {
  fetchCatalogoCategorias,
  addCatalogoCategoria,
  updateCatalogoCategoria,
  deleteCatalogoCategoria,
  fetchCatalogoItens,
  addCatalogoItem,
  updateCatalogoItem,
  deleteCatalogoItem,
  uploadCatalogoImage
};

console.log('=== CATALOGO CLIENT INICIALIZADO COM SUCESSO ===');
