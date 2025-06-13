// JS para botões finais da página "Fazer uma Tattoo"
document.addEventListener('DOMContentLoaded', function() {
    // O botão 'btn-orcamento-tattoo' agora apenas abre o modal (feito pelo atributo data-bs-toggle)
    document.getElementById('btn-enviar-whatsapp').addEventListener('click', function() {
        const mensagem =
            `Olá, tudo bem? Gostaria de fazer um orçamento para uma nova tatuagem com vocês!%0A` +
            `Segue as informações para orçamento:%0A` +
            `- Foto da tatuagem que desejo fazer%0A` +
            `- Foto do local onde desejo a tattoo%0A` +
            `- Uma breve explicação se desejo fazer alguma alteração na imagem`;
        const fone = '5566992156546';
        const url = `https://wa.me/${fone}?text=${encodeURIComponent(mensagem)}`;
        window.open(url, '_blank');
    });
    document.getElementById('btn-catalogo-tattoo').addEventListener('click', function() {
        window.location.href = 'catalogo.html';
    });

    // Scroll para o topo ao abrir o modal de orçamento
    var modalOrcamento = document.getElementById('modalOrcamentoTattoo');
    if (modalOrcamento) {
        modalOrcamento.addEventListener('show.bs.modal', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
