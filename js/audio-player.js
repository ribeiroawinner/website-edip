/* Audio Player Logic */
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on a checkout page - if so, do not initialize the player
    if (window.location.href.toLowerCase().includes('checkout')) {
        return;
    }

    // Lista de músicas Encontradas na Raiz
    const playlist = [
        'musicas-sons/Future, Metro Boomin, Travis Scott, Playboi Carti - Type Shit (Official Video).mp3',
        'musicas-sons/Gunna & Future - pushin P (feat. Young Thug) [Official Audio].mp3',
        'musicas-sons/Playboi Carti - TOXIC [with Skepta] (Official Audio).mp3',
        'musicas-sons/Travis Scott - DUMBO.mp3'
    ];

    // Configuração
    const audio = new Audio();
    audio.volume = 0.2; // 20% do volume original
    let currentTrack = 0;

    // UI Elements - Container
    const playerContainer = document.createElement('div');
    playerContainer.id = 'audio-controls';
    playerContainer.style.position = 'fixed';
    playerContainer.style.bottom = '2rem';
    playerContainer.style.right = '2rem';
    playerContainer.style.zIndex = '1000';
    playerContainer.style.display = 'flex';
    playerContainer.style.gap = '1rem';
    playerContainer.style.alignItems = 'center';

    // Common button styles
    const btnStyle = (btn) => {
        btn.style.background = 'none';
        btn.style.border = 'none';
        btn.style.color = 'rgba(255,255,255,0.5)';
        btn.style.fontFamily = 'var(--font-mono, monospace)';
        btn.style.fontSize = '1.2rem'; /* Aumentado um pouco para as setas */
        btn.style.cursor = 'pointer';
        btn.style.transition = 'color 0.3s ease';

        btn.addEventListener('mouseenter', () => btn.style.color = '#fff');
        btn.addEventListener('mouseleave', () => {
            if (btn.id !== 'sound-toggle' || audio.paused) {
                btn.style.color = 'rgba(255,255,255,0.5)';
            } else {
                btn.style.color = '#fff'; // Keep white if playing
            }
        });
    };

    // Prev Button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '<';
    btnStyle(prevBtn);

    // Sound Toggle Button
    const soundBtn = document.createElement('button');
    soundBtn.id = 'sound-toggle';
    soundBtn.textContent = 'SOUND [OFF]';
    btnStyle(soundBtn);
    soundBtn.style.fontSize = '0.8rem'; /* Mantem o texto pequeno */

    // Next Button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '>';
    btnStyle(nextBtn);

    // Append to container
    playerContainer.appendChild(prevBtn);
    playerContainer.appendChild(soundBtn);
    playerContainer.appendChild(nextBtn);
    document.body.appendChild(playerContainer);

    // Shuffle Array
    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    shuffle(playlist);

    function playTrack(index) {
        // Loop logic
        if (index >= playlist.length) index = 0;
        if (index < 0) index = playlist.length - 1;

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
                soundBtn.style.color = 'rgba(255,255,255,0.5)';
            });
        }
    }

    // Ao acabar a música, toca a próxima
    audio.addEventListener('ended', () => {
        playTrack(currentTrack + 1);
    });

    // Controle Manual - Sound Toggle
    soundBtn.addEventListener('click', () => {
        if (audio.paused) {
            playTrack(currentTrack);
        } else {
            audio.pause();
            soundBtn.textContent = 'SOUND [OFF]';
            soundBtn.style.color = 'rgba(255,255,255,0.5)';
        }
    });

    // Controle Manual - Next
    nextBtn.addEventListener('click', () => {
        playTrack(currentTrack + 1);
    });

    // Controle Manual - Prev
    prevBtn.addEventListener('click', () => {
        playTrack(currentTrack - 1);
    });

    // Tentar iniciar (pode ser bloqueado, mas o botão resolve)
    playTrack(0);
});
