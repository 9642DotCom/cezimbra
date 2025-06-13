// supabase-client.js - Integração com Supabase para o site Cezimbra Tattoo

// Configuração do Supabase
const SUPABASE_URL = 'https://pvjcpgvkmolgtvdaqlzi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2amNwZ3ZrbW9sZ3R2ZGFxbHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTg3OTYsImV4cCI6MjA0OTUzNDc5Nn0.Au_fbs9pbWbVCfG2vDN2RI3C_jD3DJNXTr11bgqFQ3s';

// Inicializa o cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('=== INICIALIZAÇÃO DO SUPABASE-CLIENT.JS ===');
console.log('Cliente Supabase inicializado:', !!supabase);

// Testa a conexão com o Supabase
async function testSupabaseConnection() {
  try {
    console.log('Testando conexão com o Supabase...');
    const { data, error } = await supabase
      .from('catalogo_categorias')
      .select('*')
      .limit(1);
      
    if (error) throw error;
    
    console.log('Conexão com o Supabase estabelecida com sucesso!');
    console.log('Dados de teste:', data);
    return true;
  } catch (error) {
    console.error('Erro ao testar conexão com o Supabase:', error);
    return false;
  }
}

// Executa o teste de conexão em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  testSupabaseConnection();
}

// Exporta o cliente Supabase e as funções úteis
const catalogoClient = {
  // Funções de teste
  testConnection: testSupabaseConnection,
  
  // Funções de categorias
  buscarCategorias: async () => {
    const { data, error } = await supabase
      .from('catalogo_categorias')
      .select('*')
      .order('nome');
    
    if (error) throw error;
    return data || [];
  },
  
  adicionarCategoria: async (categoria) => {
    const { data, error } = await supabase
      .from('catalogo_categorias')
      .insert([categoria])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  atualizarCategoria: async (id, atualizacoes) => {
    const { data, error } = await supabase
      .from('catalogo_categorias')
      .update(atualizacoes)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  removerCategoria: async (id) => {
    // Verifica se existem itens nesta categoria
    const { data: itens, error: itensError } = await supabase
      .from('catalogo_itens')
      .select('id')
      .eq('categoria_id', id);
    
    if (itensError) throw itensError;
    
    if (itens && itens.length > 0) {
      throw new Error('Não é possível excluir uma categoria que possui itens');
    }
    
    const { error } = await supabase
      .from('catalogo_categorias')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Funções de itens
  buscarItens: async (filtros = {}) => {
    let query = supabase
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
  },
  
  buscarItemPorId: async (id) => {
    const { data, error } = await supabase
      .from('catalogo_itens')
      .select(`
        *,
        categoria:categoria_id (id, nome)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  adicionarItem: async (item) => {
    const { data, error } = await supabase
      .from('catalogo_itens')
      .insert([item])
      .select(`
        *,
        categoria:categoria_id (id, nome)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  atualizarItem: async (id, atualizacoes) => {
    const { data, error } = await supabase
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
  },
  
  removerItem: async (id) => {
    const { error } = await supabase
      .from('catalogo_itens')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  // Upload de arquivos
  fazerUploadImagem: async (arquivo, pasta = 'itens') => {
    // Lê o arquivo como base64 e retorna
    const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
    return await toBase64(arquivo);
  }
};

// Torna o cliente disponível globalmente
window.catalogoClient = catalogoClient;

console.log('=== SUPABASE CLIENT INICIALIZADO COM SUCESSO ===');

// Verificação de conexão com o Supabase
async function checkConnection() {
  try {
    const { data, error } = await supabase.from('tattoos').select('count');
    if (error) throw error;
    console.log("Conexão com Supabase estabelecida com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro na conexão com Supabase:", error);
    return false;
  }
}

// Funções para tatuagens
async function fetchTattoos() {
  try {
    const { data, error } = await supabase
      .from('tattoos')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    
    console.log(`${data.length} tatuagens encontradas`);
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar tatuagens:', error);
    return [];
  }
}

async function addTattoo(tattooData) {
  try {
    console.log('Adicionando nova tatuagem:', tattooData);
    
    // Extrair a imagem da data para upload separado
    const { imageFile, ...tattooInfo } = tattooData;
    
    // Adicionar a tatuagem no banco
    const { data, error } = await supabase
      .from('tattoos')
      .insert([tattooInfo])
      .select();

    if (error) throw error;
    
    // Upload da imagem se fornecida
    if (imageFile) {
      const imageUrl = await uploadImage(imageFile, data[0].id);
      
      // Atualizar o registro com a URL da imagem
      if (imageUrl) {
        const { error: updateError } = await supabase
          .from('tattoos')
          .update({ imagem: imageUrl })
          .eq('id', data[0].id);
        
        if (updateError) throw updateError;
        data[0].imagem = imageUrl;
      }
    }
    
    console.log('Tatuagem adicionada com sucesso:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Erro ao adicionar tatuagem:', error);
    throw error;
  }
}

async function updateTattoo(id, tattooData) {
  try {
    console.log(`Atualizando tatuagem ID ${id} com dados:`, tattooData);
    
    // Extrair a imagem da data para upload separado
    const { imageFile, ...tattooInfo } = tattooData;
    
    // Se houver uma nova imagem, fazer o upload
    if (imageFile) {
      const imageUrl = await uploadImage(imageFile, id);
      if (imageUrl) {
        tattooInfo.imagem = imageUrl;
      }
    }
    
    const { data, error } = await supabase
      .from('tattoos')
      .update(tattooInfo)
      .eq('id', id)
      .select();

    if (error) throw error;
    console.log('Tatuagem atualizada com sucesso:', data[0]);
    return data[0];
  } catch (error) {
    console.error(`Erro ao atualizar tatuagem ${id}:`, error);
    throw error;
  }
}

async function deleteTattoo(id) {
  try {
    console.log(`Deletando tatuagem ID: ${id}`);
    
    // Primeiro, buscar a tatuagem para obter a URL da imagem
    const { data: tattoo, error: fetchError } = await supabase
      .from('tattoos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error(`Erro ao buscar tatuagem ID ${id}:`, fetchError);
      if (fetchError.code === 'PGRST116') {
        console.log('Tatuagem já foi deletada anteriormente.');
        return true; // Já está deletada
      }
      throw fetchError;
    }
    
    if (!tattoo) {
      console.error(`Tatuagem com ID ${id} não encontrada.`);
      return false;
    }
    
    // Excluir o registro da tatuagem
    const { error } = await supabase
      .from('tattoos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    // Se a tatuagem tem imagem, tenta removê-la do storage
    if (tattoo.imagem) {
      try {
        // Extrai o nome do arquivo da URL
        const imagePath = tattoo.imagem.split('/').pop();
        
        if (imagePath) {
          console.log('Tentando remover imagem:', imagePath);
          
          const { error: storageError } = await supabase.storage
            .from('tattoos')
            .remove([imagePath]);
            
          if (storageError) {
            console.error('Erro ao excluir imagem:', storageError);
          } else {
            console.log('Imagem removida com sucesso');
          }
        }
      } catch (imageError) {
        console.error('Erro ao processar deleção da imagem:', imageError);
      }
    }
    
    console.log(`Tatuagem ID ${id} deletada com sucesso`);
    return true;
  } catch (error) {
    console.error('Erro ao excluir tatuagem:', error);
    return false;
  }
}

// Funções para categorias
async function fetchCategories() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('nome');

    if (error) throw error;
    
    console.log(`${data.length} categorias encontradas`);
    // Retornar os objetos completos para ter mais flexibilidade
    return data || [];
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return [];
  }
}

async function addCategory(categoryName) {
  try {
    console.log(`Adicionando categoria: ${categoryName}`);
    
    // Verificar se a categoria já existe
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('nome', categoryName)
      .maybeSingle();
    
    if (existingCategory) {
      console.log(`A categoria '${categoryName}' já existe`);
      return existingCategory;
    }
    
    // Adicionar nova categoria
    const { data, error } = await supabase
      .from('categories')
      .insert([{ nome: categoryName }])
      .select();

    if (error) throw error;
    console.log(`Categoria '${categoryName}' adicionada com sucesso`);
    return data[0];
  } catch (error) {
    console.error('Erro ao adicionar categoria:', error);
    throw error;
  }
}

async function deleteCategory(categoryName) {
  try {
    console.log(`Deletando categoria: ${categoryName}`);
    
    // Busca o ID da categoria pelo nome
    const { data: categoria, error: fetchError } = await supabase
      .from('categories')
      .select('id')
      .eq('nome', categoryName)
      .single();
    
    if (fetchError) {
      console.error('Erro ao buscar categoria:', fetchError);
      return false;
    }
    
    if (!categoria) {
      console.error(`Categoria '${categoryName}' não encontrada.`);
      return false;
    }
    
    console.log(`Encontrada categoria com ID ${categoria.id}`);
    
    // Deletar a categoria pelo ID
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoria.id);

    if (error) throw error;
    
    console.log(`Categoria '${categoryName}' deletada com sucesso`);
    return true;
  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return false;
  }
}

// Função de upload de imagens
async function uploadImage(file, tattooId) {
  try {
    console.log('Iniciando upload de imagem...');
    
    // Verificar se o bucket 'tattoos' existe, criar se não existir
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some(b => b.name === 'tattoos');
    
    if (!bucketExists) {
      console.log('Bucket "tattoos" não encontrado. Tentando criar...');
      const { error: createError } = await supabase.storage.createBucket('tattoos', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp'],
        fileSizeLimit: 10485760  // 10MB em bytes
      });
      
      if (createError) {
        console.error('Erro ao criar bucket:', createError);
        throw createError;
      }
    }
    
    // Gerar nome de arquivo único
    const fileExt = file.name.split('.').pop();
    const fileName = `tattoo_${tattooId || Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    console.log(`Enviando arquivo ${fileName} para o bucket tattoos...`);
    
    // Upload da imagem para o Storage
    const { error: uploadError, data } = await supabase.storage
      .from('tattoos')
      .upload(fileName, file);

    if (uploadError) throw uploadError;
    
    // Gerar URL pública para a imagem
    const { data: publicURL } = supabase.storage
      .from('tattoos')
      .getPublicUrl(fileName);
    
    console.log('Upload concluído com sucesso. URL:', publicURL.publicUrl);
    return publicURL.publicUrl;
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return null;
  }
}

// Expõe as funções no escopo global
window.supabaseClient = {
  supabase,
  checkConnection,
  fetchTattoos,
  addTattoo,
  updateTattoo,
  deleteTattoo,
  fetchCategories,
  addCategory,
  deleteCategory,
  uploadImage
};

console.log('=== SUPABASE CLIENT INICIALIZADO COM SUCESSO ===');
