// Script para testar a conexão com o Supabase
// Execute este arquivo em um servidor local

import { supabase, fetchCategories, fetchTattoos, addCategory } from './supabase-client.js';

// Container para exibir os resultados
const container = document.createElement('div');
container.style.padding = '20px';
container.style.fontFamily = 'monospace';
container.style.backgroundColor = '#222';
container.style.color = '#fff';
container.style.borderRadius = '8px';
container.style.maxWidth = '800px';
container.style.margin = '20px auto';
document.body.appendChild(container);

// Função para adicionar resultado ao container
function addResult(title, data, success = true) {
  const resultDiv = document.createElement('div');
  resultDiv.style.marginBottom = '20px';
  resultDiv.style.padding = '10px';
  resultDiv.style.border = `1px solid ${success ? '#4CAF50' : '#F44336'}`;
  resultDiv.style.borderRadius = '4px';
  
  const titleElem = document.createElement('h3');
  titleElem.textContent = title;
  titleElem.style.margin = '0 0 10px 0';
  titleElem.style.color = success ? '#4CAF50' : '#F44336';
  
  const contentElem = document.createElement('pre');
  contentElem.textContent = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
  contentElem.style.whiteSpace = 'pre-wrap';
  contentElem.style.overflow = 'auto';
  contentElem.style.maxHeight = '300px';
  
  resultDiv.appendChild(titleElem);
  resultDiv.appendChild(contentElem);
  container.appendChild(resultDiv);
}

// Função principal de teste
document.addEventListener('DOMContentLoaded', async () => {
  const output = document.getElementById('output');
  const testButtons = document.getElementById('test-buttons');
  
  try {
    // Esperar o script do Supabase carregar
    if (!window.supabaseClient) {
      output.innerHTML += `<p class="error">❌ Erro: Biblioteca Supabase não carregada!</p>`;
      return;
    }
    
    // Configurando credenciais Supabase
    const SUPABASE_URL = 'https://pvjcpgvkmolgtvdaqlzi.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2amNwZ3ZrbW9sZ3R2ZGFxbHppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NTg3OTYsImV4cCI6MjA0OTUzNDc5Nn0.Au_fbs9pbWbVCfG2vDN2RI3C_jD3DJNXTr11bgqFQ3s';
    
    // Criando o cliente do Supabase
    const supabase = supabaseClient.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Teste de conexão
    const { data, error } = await supabase.from('categories').select('*');
    
    if (error) throw error;
    
    output.innerHTML += `<p class="success">✅ Conexão com Supabase estabelecida com sucesso!</p>`;
    output.innerHTML += `<p>Categorias recuperadas: ${data.length}</p>`;
    output.innerHTML += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    
    // Botões de teste para as funções
    testButtons.innerHTML = `
      <div class="function-tests">
        <h3>Testar Funções</h3>
        <button id="test-fetchCategories">Testar fetchCategories()</button>
        <button id="test-fetchTattoos">Testar fetchTattoos()</button>
        <button id="test-addCategory">Adicionar Categoria</button>
        <button id="test-deleteCategory">Excluir Categoria</button>
      </div>
    `;
    
    // Eventos para os botões
    document.getElementById('test-fetchCategories').addEventListener('click', async () => {
      const { fetchCategories } = await import('./supabase-client.js');
      const categories = await fetchCategories();
      output.innerHTML = `<h4>Resultado de fetchCategories():</h4><pre>${JSON.stringify(categories, null, 2)}</pre>`;
    });
    
    document.getElementById('test-fetchTattoos').addEventListener('click', async () => {
      const { fetchTattoos } = await import('./supabase-client.js');
      try {
        const tattoos = await fetchTattoos();
        addResult('Tatuagens Encontradas', tattoos);
      } catch (error) {
        addResult('Erro ao buscar tatuagens', error.message, false);
      }
    });

    document.getElementById('test-addCategory').addEventListener('click', async () => {
      const { addCategory } = await import('./supabase-client.js');
      try {
        const testCategory = await addCategory('Teste ' + new Date().toISOString());
        addResult('Categoria de Teste Adicionada', testCategory);
      } catch (error) {
        addResult('Erro ao adicionar categoria de teste', error.message, false);
      }
    });
    
    addResult('Testes Concluídos', 'Todos os testes foram executados!');
    
  } catch (error) {
    addResult('Erro nos testes', error.message, false);
  }
});
