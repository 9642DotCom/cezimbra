// JS para questionário animado e envio para WhatsApp

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('form-remocao');
    const animacao = document.getElementById('animacao-remocao');
    const questionario = document.querySelector('.questionario-box');
    let respostas = {};

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        respostas.tempo = document.getElementById('tempoTattoo').value;
        respostas.motivo = document.getElementById('motivoTattoo').value;
        respostas.retoque = document.getElementById('retoqueTattoo').value;
        // Animação de saída do questionário
        questionario.classList.add('animate__fadeOutUp');
        setTimeout(() => {
            questionario.classList.add('d-none');
            animacao.classList.remove('d-none');
            animacao.classList.add('animate__fadeInUp');
        }, 700);
    });

    document.getElementById('btn-orcamento').addEventListener('click', function() {
        const mensagem =
            `Olá, tudo bem? Tenho uma tatuagem que desejo remover e preciso fazer um orçamento.%0A` +
            `Essa tatuagem já possui: ${respostas.tempo}%0A` +
            `Motivo para remover: ${respostas.motivo}%0A` +
            `A tatuagem foi feita somente uma vez ou já teve retoque? ${respostas.retoque}%0A` +
            `Agora irei enviar uma foto da minha tatuagem para você avaliar e me passar um orçamento.`;
        const fone = '5566992156546';
        const url = `https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
    });
});
