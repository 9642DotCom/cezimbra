// Animações e navegação dos botões

document.addEventListener('DOMContentLoaded', function() {
    const btnFazer = document.getElementById('btn-fazer-tattoo');
    const btnRemover = document.getElementById('btn-remover-tattoo');

    btnFazer.addEventListener('click', function() {
        // Simulação de navegação para o próximo passo
        window.location.href = 'fazer_tattoo.html';
    });

    btnRemover.addEventListener('click', function() {
        // Simulação de navegação para o próximo passo
        window.location.href = 'remover_tattoo.html';
    });
});
