// Slot Machine moderno - Fortune Tiger
let moedas = 3;
let ganhou = false;
const moedasSpan = document.getElementById('moedas');
const btnJogar = document.getElementById('btn-jogar');
const valePremio = document.getElementById('vale-premio');
const comprarMoedasDiv = document.getElementById('comprar-moedas');
const btnComprar = document.getElementById('btn-comprar');
const popupMsg = document.getElementById('popup-msg');
const alavanca = document.getElementById('alavanca');
const painelMoedas = document.getElementById('moedas');
const rolos = [];
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        rolos.push(document.getElementById(`r${i}${j}`));
    }
}
const simbolos = ['🐯', '🍀', '💎', '🍒', '🔔', '⭐', '7️⃣'];

function atualizarMoedas() {
    painelMoedas.textContent = moedas;
    if (moedas <= 0) {
        btnJogar.disabled = true;
        comprarMoedasDiv.style.display = 'block';
    } else {
        btnJogar.disabled = false;
        comprarMoedasDiv.style.display = 'none';
    }
}

function mostrarPopup(msg, tempo=1800) {
    popupMsg.textContent = msg;
    popupMsg.classList.add('show');
    setTimeout(() => {
        popupMsg.classList.remove('show');
    }, tempo);
}

function animarRolos(callback) {
    // Efeito de embaralhamento visual antes de parar
    let embaralha = 0;
    const maxEmbaralha = 16;
    const interval = setInterval(() => {
        for (let i = 0; i < 9; i++) {
            const rand = Math.floor(Math.random() * simbolos.length);
            rolos[i].textContent = simbolos[rand];
            rolos[i].classList.remove('ganhou');
        }
        embaralha++;
        if (embaralha >= maxEmbaralha) {
            clearInterval(interval);
            // Sorteio final
            for (let i = 0; i < 9; i++) {
                const rand = Math.floor(Math.random() * simbolos.length);
                rolos[i].textContent = simbolos[rand];
            }
            setTimeout(() => {
                callback();
            }, 200);
        }
    }, 60);
}

function verificarVitoria() {
    // Exemplo: vitória se linha do meio for igual
    const meio = [rolos[3], rolos[4], rolos[5]];
    if (meio.every(r => r.textContent === meio[0].textContent)) {
        mostrarPopup('🎉 JACKPOT! Você ganhou!');
        valePremio.style.display = 'block';
        btnJogar.disabled = true;
        meio.forEach(r=>r.classList.add('ganhou'));
        exibirBigWinCelebration();
    } else {
        mostrarPopup('Não foi dessa vez... Tente novamente!');
    }
}

btnJogar.addEventListener('click', () => {
    if (btnJogar.disabled) return;
    if (moedas <= 0) {
        mostrarPopup('Você está sem moedas!');
        return;
    }
    moedas--;
    atualizarMoedas();
    // Alavanca anima: fica vermelha e desce
    alavanca.classList.add('ativa');
    setTimeout(() => {
        alavanca.classList.remove('ativa');
    }, 600);
    animarRolos(() => {
        verificarVitoria();
    });
});

btnComprar.onclick = function() {
    moedas = 3;
    atualizarMoedas();
    valePremio.style.display = 'none';
    ganhou = false;
    rolos.forEach((r,i)=>{r.textContent=simbolos[i*2]||simbolos[0]; r.classList.remove('ganhou');});
};

// BIG WIN CELEBRATION
function exibirBigWinCelebration() {
    const bigWin = document.getElementById('big-win-celebration');
    const particles = bigWin.querySelector('.big-win-particles');
    bigWin.classList.add('active');
    // Limpa partículas antigas
    particles.innerHTML = '';
    // Gera partículas animadas (confetes e moedas)
    const emojilist = ['💰','🪙','🎉','✨','🥇','💵','💎','🌟'];
    for(let i=0;i<18;i++){
        const span = document.createElement('span');
        span.className = 'big-win-particle';
        span.textContent = emojilist[Math.floor(Math.random()*emojilist.length)];
        span.style.left = (10+Math.random()*80)+'%';
        span.style.bottom = (10+Math.random()*40)+'px';
        span.style.fontSize = (1.2+Math.random()*1.6)+'rem';
        span.style.animationDelay = (Math.random()*0.7)+'s';
        particles.appendChild(span);
    }
    setTimeout(()=>{
        bigWin.classList.remove('active');
        exibirPopupInstrucoes();
    }, 2500);
}

function exibirPopupInstrucoes() {
    const popup = document.getElementById('popup-instrucoes');
    popup.classList.add('active');
    document.getElementById('fechar-instrucoes').onclick = ()=>{
        popup.classList.remove('active');
    };
}


// Inicialização dos símbolos do grid
window.addEventListener('DOMContentLoaded', () => {
    atualizarMoedas();
    rolos.forEach((r,i)=>{r.textContent=simbolos[i%simbolos.length];});
});
