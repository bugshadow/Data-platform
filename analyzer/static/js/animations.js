// Configuration du Canvas pour les particules et connexions
const canvas = document.getElementById('dataCanvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Classe pour les particules
class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.life = 255;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0 || this.x > width) this.speedX *= -1;
        if (this.y < 0 || this.y > height) this.speedY *= -1;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 255, ${this.life / 255})`;
        ctx.fill();
    }
}

// Initialisation des particules
const particles = Array.from({ length: 100 }, () => new Particle());

// Animation du canvas
function animate() {
    ctx.fillStyle = 'rgba(10, 10, 31, 0.1)';
    ctx.fillRect(0, 0, width, height);

    particles.forEach((particle, index) => {
        particle.update();
        particle.draw();

        // Dessiner les connexions entre les particules proches
        for (let j = index + 1; j < particles.length; j++) {
            const dx = particles[j].x - particle.x;
            const dy = particles[j].y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 255, 255, ${(100 - distance) / 500})`;
                ctx.lineWidth = 0.5;
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animate);
}

// Création des ondes WiFi
function createWifiWaves() {
    const container = document.getElementById('flowContainer');
    const waveCount = 3;

    for (let i = 0; i < waveCount; i++) {
        const wave = document.createElement('div');
        wave.className = 'wifi-wave';
        wave.style.left = '50%';
        wave.style.top = '50%';
        wave.style.animationDelay = `${i * 1.5}s`;
        container.appendChild(wave);
    }
}

// Création des flux de données
function createDataStreams() {
    const container = document.getElementById('flowContainer');
    const streamCount = 20;

    for (let i = 0; i < streamCount; i++) {
        const stream = document.createElement('div');
        stream.className = 'data-stream';
        stream.style.top = `${Math.random() * 100}%`;
        stream.style.left = `${Math.random() * 100}%`;
        stream.style.width = `${Math.random() * 100 + 50}px`;
        stream.style.transform = `rotate(${Math.random() * 360}deg)`;
        stream.style.animationDelay = `${Math.random() * 2}s`;
        container.appendChild(stream);
    }
}

// Création des nœuds de connexion
function createNodes() {
    const container = document.getElementById('flowContainer');
    const nodeCount = 30;

    for (let i = 0; i < nodeCount; i++) {
        const node = document.createElement('div');
        node.className = 'connection-node';
        node.style.left = `${Math.random() * 100}%`;
        node.style.top = `${Math.random() * 100}%`;
        node.style.animation = `pulse ${1 + Math.random()}s ease-in-out infinite`;
        container.appendChild(node);
    }
}

// Initialisation
window.addEventListener('load', () => {
    createWifiWaves();
    createDataStreams();
    createNodes();
    animate();
});

// Gestion du redimensionnement
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// Interaction à la souris
let mouseX = 0;
let mouseY = 0;
document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Création d'une onde au passage de la souris
    const wave = document.createElement('div');
    wave.className = 'wifi-wave';
    wave.style.left = `${mouseX}px`;
    wave.style.top = `${mouseY}px`;
    document.getElementById('flowContainer').appendChild(wave);

    // Suppression de l'onde après l'animation
    wave.addEventListener('animationend', () => {
        wave.remove();
    });
});