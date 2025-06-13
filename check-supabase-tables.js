// Script para verificar as tabelas existentes no Supabase
// Importar supabaseClient do script carregado no HTML
document.addEventListener('DOMContentLoaded', async () => {
  const output = document.getElementById('output');
  
  try {
    // Configurando credenciais Supabase
    const SUPABASE_URL = 'https://pvjcpgvkmolgtvdaqlzi.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2amNwZ3ZrbW9sZ3R2ZGFxbHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTg3OTYsImV4cCI6MjA0OTUzNDc5Nn0.Au_fbs9pbWbVCfG2vDN2RI3C_jD3DJNXTr11bgqFQ3s';
    
    // Criando o cliente do Supabase
    const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Verificar a conexão
    const { data: connectionTest, error: connectionError } = await supabase.from('tattoos').select('count');
    if (connectionError) throw connectionError;
    
    output.innerHTML += `<p class="success">✅ Conexão com Supabase estabelecida!</p>`;
    
    // Verificar estrutura da tabela 'tattoos'
    const { data: tattoosInfo, error: tattoosError } = await supabase.rpc('get_table_info', { table_name: 'tattoos' });
    
    if (tattoosError) {
      output.innerHTML += `<p class="error">❌ Erro ao verificar tabela 'tattoos': ${tattoosError.message}</p>`;
    } else {
      output.innerHTML += `<h3>Estrutura da tabela 'tattoos':</h3>`;
      output.innerHTML += `<pre>${JSON.stringify(tattoosInfo, null, 2)}</pre>`;
    }
    
    // Verificar estrutura da tabela 'categories'
    const { data: categoriesInfo, error: categoriesError } = await supabase.rpc('get_table_info', { table_name: 'categories' });
    
    if (categoriesError) {
      output.innerHTML += `<p class="error">❌ Erro ao verificar tabela 'categories': ${categoriesError.message}</p>`;
      output.innerHTML += `<p>Tentando buscar dados diretamente para verificar estrutura...</p>`;
      
      // Tentativa alternativa: buscar dados para verificar colunas
      const { data: categoriesData, error: categoriesFetchError } = await supabase.from('categories').select('*').limit(1);
      
      if (categoriesFetchError) {
        output.innerHTML += `<p class="error">❌ Erro ao buscar dados de 'categories': ${categoriesFetchError.message}</p>`;
      } else if (categoriesData && categoriesData.length > 0) {
        output.innerHTML += `<h3>Colunas da tabela 'categories' (com base em uma amostra):</h3>`;
        output.innerHTML += `<pre>${JSON.stringify(Object.keys(categoriesData[0]))}</pre>`;
      } else {
        output.innerHTML += `<p>Tabela 'categories' parece existir mas está vazia.</p>`;
      }
    } else {
      output.innerHTML += `<h3>Estrutura da tabela 'categories':</h3>`;
      output.innerHTML += `<pre>${JSON.stringify(categoriesInfo, null, 2)}</pre>`;
    }
    
    // Verificar buckets do Storage
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      output.innerHTML += `<p class="error">❌ Erro ao verificar buckets do Storage: ${bucketsError.message}</p>`;
    } else {
      output.innerHTML += `<h3>Buckets do Storage:</h3>`;
      output.innerHTML += `<pre>${JSON.stringify(buckets, null, 2)}</pre>`;
    }
    
  } catch (error) {
    output.innerHTML += `<p class="error">❌ Erro: ${error.message}</p>`;
    console.error('Erro completo:', error);
  }
});
