// Wizard IA Tattoo - Passo a passo animado e intuitivo
// Feito para ser simples para qualquer usuário

document.addEventListener('DOMContentLoaded', function() {
  // Permitir que ambos botões abram o wizard
  const btnsOpen = [
    document.getElementById('btn-criar-tattoo-ia'),
    document.getElementById('btn-criar-ia')
  ].filter(Boolean);
  const modal = new bootstrap.Modal(document.getElementById('modalWizardIA'));
  const steps = Array.from(document.querySelectorAll('.wizard-step'));
  let stepIdx = 0;
  let local = '', tamanho = '', desc = '';

  function showStep(idx) {
    steps.forEach((el, i) => {
      el.classList.toggle('d-none', i !== idx);
      if(i === idx) el.classList.add('animate__animated','animate__fadeInRight');
      else el.classList.remove('animate__animated','animate__fadeInRight');
    });
    stepIdx = idx;
  }

  btnsOpen.forEach(btn => btn.addEventListener('click', e => {
    e.preventDefault();
    showStep(0);
    document.getElementById('wizard-ia-form').reset();
    modal.show();
  }));

  // Avançar etapas
  // Sempre obter valores dos campos no momento do envio, para evitar problemas de reset ou escopo
  document.querySelectorAll('.wizard-next').forEach((btn, idx) => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      if(idx === 0) {
        const localInput = document.getElementById('input-local').value.trim();
        if(!localInput) { document.getElementById('input-local').focus(); return; }
        local = localInput;
        showStep(1);
      } else if(idx === 1) {
        const tamanhoInput = document.getElementById('input-tamanho').value;
        if(!tamanhoInput) { document.getElementById('input-tamanho').focus(); return; }
        tamanho = tamanhoInput;
        showStep(2);
      } else if(idx === 2) {
        const descInput = document.getElementById('input-desc').value.trim();
        if(!descInput) { document.getElementById('input-desc').focus(); return; }
        desc = descInput;
        showStep(3);
        gerarTattooIA();
      }
    });
  });

  async function gerarTattooIA() {
  showStep(3); // loading
  const prompt = `Faça uma tatuagem bem detalhada e realista, bem detalhada e em uma forma que de pra ver todos os detalhes para o tatuador conseguir replicar na minha pele. Tatuagem para ${local}, tamanho ${tamanho}. ${desc}`;
  try {
    const response = await fetch(
      "https://multimodalart-flux-lora-the-explorer.hf.space/run_lora",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          image_input: null,
          image_strength: 0.75,
          cfg_scale: 3.5,
          steps: 28,
          randomize_seed: true,
          seed: 0,
          width: 1024,
          height: 1024,
          lora_scale: 0.95
        })
      }
    );
    const result = await response.json();
    console.log('Resposta IA:', result);
    if (!result.data || !result.data[0]) {
      throw new Error('A IA não retornou uma imagem válida.');
    }
    mostrarResultado(result.data[0]);
  } catch (err) {
    showStep(2);
    alert('Erro ao gerar imagem com IA: ' + (err.message || 'Tente novamente em alguns instantes.'));
  }
}

  function mostrarResultado(imgUrl) {
    document.getElementById('ia-img-result').src = imgUrl;
    showStep(4);
  }

  document.querySelector('.wizard-again').addEventListener('click', function() {
    showStep(2);
  });
  document.querySelector('.wizard-book').addEventListener('click', function() {
    alert('Reserva iniciada! Em breve entraremos em contato para agendar sua tattoo.');
    modal.hide();
  });
});
