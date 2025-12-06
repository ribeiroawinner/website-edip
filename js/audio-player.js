/* Audio Player Logic */
document.addEventListener('DOMContentLoaded', () => {
    // Lista de músicas Encontradas na Raiz
    const playlist = [
        'Future, Metro Boomin, Travis Scott, Playboi Carti - Type Shit (Official Video).mp3',
        'Gunna & Future - pushin P (feat. Young Thug) [Official Audio].mp3',
        'Playboi Carti - TOXIC [with Skepta] (Official Audio).mp3',
        'Travis Scott - DUMBO.mp3'
    ];

    // Configuração
    const audio = new Audio();
    audio.volume = 0.2; // 20% do volume original
    let currentTrack = 0;

    // UI Elements
    // Criando o botão via JS para não poluir o HTML se não tiver musica
    const soundBtn = document.createElement('button');
    soundBtn.className = 'sound-control';
    soundBtn.textContent = 'SOUND [OFF]';
    soundBtn.style.position = 'absolute';
    soundBtn.style.bottom = '2rem';
    soundBtn.style.right = '2rem';
    soundBtn.style.background = 'none';
    soundBtn.style.border = 'none';
    soundBtn.style.color = 'rgba(255,255,255,0.5)';
    soundBtn.style.fontFamily = 'var(--font-mono)';
    soundBtn.style.fontSize = '0.8rem';
    soundBtn.style.cursor = 'pointer';
    soundBtn.style.zIndex = '100';
    document.body.appendChild(soundBtn);

    // Shuffle Array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    shuffle(playlist);

    function playTrack(index) {
        if (index >= playlist.length) index = 0;
        currentTrack = index;
        audio.src = playlist[currentTrack];

        const playPromise = audio.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                // Autoplay started!
                soundBtn.textContent = 'SOUND [ON]';
                soundBtn.style.color = '#fff';
            }).catch(error => {
                // Auto-play was prevented
                console.log('Autoplay blocked. Waiting for interaction.');
                soundBtn.textContent = 'SOUND [OFF]';
            });
        }
    }

    // Ao acabar a música, toca a próxima
    audio.addEventListener('ended', () => {
        playTrack(currentTrack + 1);
    });

    // Controle Manual
    soundBtn.addEventListener('click', () => {
        if (audio.paused) {
            playTrack(currentTrack);
        } else {
            audio.pause();
            soundBtn.textContent = 'SOUND [OFF]';
            soundBtn.style.color = 'rgba(255,255,255,0.5)';
        }
    });

    // Tentar iniciar (pode ser bloqueado, mas o botão resolve)
    playTrack(0);
});
