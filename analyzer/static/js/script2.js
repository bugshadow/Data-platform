// Gestion du mode sombre/clair
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

function toggleTheme() {
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        themeToggle.textContent = '🌙';
    } else {
        body.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '🌞';
    }
}

// Appliquer le thème au chargement
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '🌞';
} else {
    body.removeAttribute('data-theme');
    themeToggle.textContent = '🌙';
}

// Écouteur d'événement pour le bouton de bascule
themeToggle.addEventListener('click', () => {
    toggleTheme();
    localStorage.setItem('theme', body.getAttribute('data-theme') || 'light');
});

// Créer des faisceaux lumineux et des orbes d'énergie
function createLightBeams(containerId) {
    const container = document.getElementById(containerId);
    const numberOfBeams = 10;

    for (let i = 0; i < numberOfBeams; i++) {
        const beam = document.createElement('div');
        beam.className = 'light-beam';
        beam.style.top = `${Math.random() * 100}%`;
        beam.style.left = `${Math.random() * 100}%`;
        beam.style.animationDelay = `${Math.random() * 5}s`;
        container.appendChild(beam);
    }

    // Créer des orbes d'énergie
    for (let i = 0; i < 5; i++) {
        const orb = document.createElement('div');
        orb.className = 'energy-orb';
        orb.style.top = `${Math.random() * 80 + 10}%`;
        orb.style.left = `${Math.random() * 80 + 10}%`;
        orb.style.animationDelay = `${Math.random() * 4}s`;
        container.appendChild(orb);
    }

    // Créer des points lumineux
    for (let i = 0; i < 20; i++) {
        const point = document.createElement('div');
        point.className = 'glow-points';
        point.style.top = `${Math.random() * 100}%`;
        point.style.left = `${Math.random() * 100}%`;
        point.style.animationDelay = `${Math.random() * 4}s`;
        container.appendChild(point);
    }
}

// Initialiser les animations pour les sections
createLightBeams('quotesLightContainer');
createLightBeams('contactLightContainer');

// Recréer les faisceaux périodiquement
setInterval(() => {
    const containers = document.querySelectorAll('.light-container');
    containers.forEach(container => {
        const oldBeams = container.querySelectorAll('.light-beam, .energy-orb, .glow-points');
        oldBeams.forEach(beam => beam.remove());
        createLightBeams(container.id);
    });
}, 12000);