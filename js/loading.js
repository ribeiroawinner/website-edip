window.addEventListener('load', () => {
    const loader = document.getElementById('loading-screen');

    // Tempo mínimo de loading para dar um "charme" (2.5s)
    setTimeout(() => {
        loader.classList.add('loaded');

        // Opcional: Tocar música se o autoplay permitir assim que carregar
        // const audioBtn = document.querySelector('.sound-control');
        // if(audioBtn) audioBtn.click(); // Hacky, browsers bloqueiam, mas vale tentar
    }, 2500);
});
