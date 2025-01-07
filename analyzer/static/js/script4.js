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

// Gestion de la soumission du formulaire d'inscription
const signupForm = document.getElementById('signup-form');
const errorMessage = document.getElementById('error-message');

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Empêcher la soumission par défaut du formulaire

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        errorMessage.textContent = 'Les mots de passe ne correspondent pas.';
        return;
    }

    try {
        const response = await fetch('/signup/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken') // Ajouter le token CSRF
            },
            body: JSON.stringify({ username, email, password, confirm_password: confirmPassword })
        });

        const data = await response.json();

        if (response.ok) {
            // Rediriger vers l'interface principale
            window.location.href = '/index/';
        } else {
            // Afficher un message d'erreur
            errorMessage.textContent = data.error || 'Erreur lors de l\'inscription';
        }
    } catch (error) {
        errorMessage.textContent = 'Erreur lors de la connexion au serveur';
    }
});

// Fonction pour récupérer le cookie CSRF
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}