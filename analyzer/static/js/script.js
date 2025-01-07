// Animation 3D
const scene = new THREE.Scene(); // Crée une scène 3D
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000); // Crée une caméra perspective
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('animation-bg'), // Utilise le canvas existant pour le rendu
    antialias: true // Active l'antialiasing pour un rendu plus lisse
});
renderer.setSize(window.innerWidth, window.innerHeight); // Définit la taille du rendu
renderer.setPixelRatio(window.devicePixelRatio); // Ajuste le ratio de pixels pour les écrans haute résolution

// Création des particules
const particlesGeometry = new THREE.BufferGeometry(); // Crée une géométrie pour les particules
const particlesCount = 2000; // Nombre de particules
const posArray = new Float32Array(particlesCount * 3); // Tableau pour stocker les positions des particules

for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 8; // Position aléatoire pour chaque particule
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3)); // Définit l'attribut de position pour la géométrie

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.005, // Taille des particules
    color: '#4A90E2', // Couleur des particules
    transparent: true, // Rend le matériau transparent
    opacity: 0.8, // Opacité des particules
    blending: THREE.AdditiveBlending // Mode de mélange pour un effet de lumière
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial); // Crée un maillage de particules
scene.add(particlesMesh); // Ajoute le maillage à la scène

camera.position.z = 3; // Positionne la caméra

let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2); // Calcule la position X de la souris
    mouseY = (event.clientY - window.innerHeight / 2); // Calcule la position Y de la souris
});

function animate() {
    requestAnimationFrame(animate); // Boucle d'animation

    targetX = mouseX * 0.001; // Ajuste la cible X en fonction de la souris
    targetY = mouseY * 0.001; // Ajuste la cible Y en fonction de la souris

    particlesMesh.rotation.y += 0.01 * (targetX - particlesMesh.rotation.y); // Fait pivoter les particules autour de l'axe Y
    particlesMesh.rotation.x += 0.01 * (targetY - particlesMesh.rotation.x); // Fait pivoter les particules autour de l'axe X

    renderer.render(scene, camera); // Rend la scène avec la caméra
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; // Ajuste l'aspect de la caméra
    camera.updateProjectionMatrix(); // Met à jour la matrice de projection de la caméra
    renderer.setSize(window.innerWidth, window.innerHeight); // Ajuste la taille du rendu
});

animate(); // Démarre l'animation

// Animation du texte
const textElement = document.getElementById('animated-text'); // Récupère l'élément texte
const text = "Analyseur de Données"; // Texte à animer
let index = 0;
let isDeleting = false;

function typeText() {
    const currentText = textElement.innerText;

    if (!isDeleting) {
        // Ajouter une lettre
        textElement.innerText = text.slice(0, index + 1);
        index++;
        if (index === text.length) {
            isDeleting = true;
            setTimeout(typeText, 1000); // Pause avant de supprimer
        } else {
            setTimeout(typeText, 100); // Vitesse d'écriture
        }
    } else {
        // Supprimer une lettre
        textElement.innerText = text.slice(0, index - 1);
        index--;
        if (index === 0) {
            isDeleting = false;
            setTimeout(typeText, 500); // Pause avant de réécrire
        } else {
            setTimeout(typeText, 50); // Vitesse de suppression
        }
    }
}

// Démarrer l'animation du texte
typeText();

// Gestion du mode sombre/clair
const themeToggle = document.getElementById('theme-toggle'); // Récupère le bouton de bascule de thème
const body = document.body;

function setTheme(theme) {
    body.setAttribute('data-theme', theme); // Définit le thème sur le body
    localStorage.setItem('theme', theme); // Sauvegarde le thème dans le localStorage
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙'; // Change l'icône du bouton
}

function toggleTheme() {
    const currentTheme = body.getAttribute('data-theme'); // Récupère le thème actuel
    setTheme(currentTheme === 'dark' ? 'light' : 'dark'); // Bascule entre les thèmes
}

// Appliquer le thème au chargement
const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(savedTheme); // Applique le thème sauvegardé ou par défaut

// Écouteur d'événement pour le bouton de bascule
themeToggle.addEventListener('click', toggleTheme);

// Gestion du cercle utilisateur et du menu déroulant
const userCircle = document.getElementById('user-circle'); // Récupère le cercle utilisateur
const userDropdown = document.getElementById('user-dropdown'); // Récupère le menu déroulant

userCircle.addEventListener('click', () => {
    userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block'; // Bascule l'affichage du menu
});

// Fermer le menu déroulant si on clique ailleurs
document.addEventListener('click', (event) => {
    if (!userCircle.contains(event.target)) {
        userDropdown.style.display = 'none'; // Cache le menu si on clique en dehors
    }
});

// Logique de l'application
const fileInput = document.getElementById('csv-input'); // Récupère l'input de fichier
const uploadBtn = document.getElementById('upload-btn'); // Récupère le bouton d'upload
const downloadBtn = document.getElementById('download-btn'); // Récupère le bouton de téléchargement
const columnSelect = document.getElementById('column-select'); // Récupère le sélecteur de colonne
const vizColumnSelect = document.getElementById('viz-column-select'); // Récupère le sélecteur de colonne pour la visualisation
const statsContainer = document.getElementById('stats-container'); // Récupère le conteneur des statistiques
const vizContainer = document.getElementById('visualization'); // Récupère le conteneur de visualisation
const dataPreview = document.getElementById('data-preview'); // Récupère l'aperçu des données
const loader = document.getElementById('loader'); // Récupère l'indicateur de chargement
const calculateStatsBtn = document.getElementById('calculate-stats-btn'); // Récupère le bouton de calcul des statistiques
const displayDataBtn = document.getElementById('display-data-btn'); // Récupère le bouton d'affichage des données
const generateVizBtn = document.getElementById('generate-viz-btn'); // Récupère le bouton de génération de visualisation
const vizTypeSelect = document.getElementById('viz-type'); // Récupère le sélecteur de type de visualisation
const noDataMessage = document.getElementById('no-data-message'); // Récupère le message "Aucune donnée"
const noVizMessage = document.getElementById('no-viz-message'); // Récupère le message "Aucune visualisation"

function showLoader() {
    loader.style.display = 'block'; // Affiche l'indicateur de chargement
}

function hideLoader() {
    loader.style.display = 'none'; // Cache l'indicateur de chargement
}

function handleFileUpload() {
    const file = fileInput.files[0]; // Récupère le fichier sélectionné
    if (!file) {
        alert("Aucun fichier sélectionné.");
        return;
    }

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
        alert("Veuillez sélectionner un fichier CSV valide.");
        return;
    }

    showLoader();

    const formData = new FormData();
    formData.append('csv_file', file); // Ajoute le fichier au formulaire

    fetch('/upload_file/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken') // Ajoute le token CSRF pour la sécurité
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoader();
        if (data.error) {
            alert(data.error);
            return;
        }

        // Mettre à jour les sélecteurs de colonnes
        columnSelect.innerHTML = '<option value="">Sélectionnez une colonne</option>';
        vizColumnSelect.innerHTML = '<option value="">Sélectionnez une colonne</option>';
        data.columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column.name;
            option.textContent = column.name;
            columnSelect.appendChild(option.cloneNode(true));
            vizColumnSelect.appendChild(option);
        });

        // Activer les sélecteurs et les boutons
        columnSelect.disabled = false;
        vizColumnSelect.disabled = false;
        downloadBtn.disabled = false;
        vizTypeSelect.disabled = false;
        generateVizBtn.disabled = false;

        // Afficher l'aperçu des données avec les colonnes dynamiques
        updateDataPreview(data.preview, data.columns.map(column => column.name));

        // Afficher un message de succès
        alert('Fichier CSV importé avec succès !');
    })
    .catch(error => {
        hideLoader();
        alert('Erreur lors de la lecture du fichier CSV : ' + error.message);
    });
}

function updateDataPreview(preview, columns) {
    const tableHead = document.querySelector('.styled-table thead');
    const tableBody = document.querySelector('.styled-table tbody');

    // Mettre à jour les en-têtes du tableau
    tableHead.innerHTML = `
        <tr>
            <th>#</th>
            ${columns.map(column => `<th>${column}</th>`).join('')}
        </tr>
    `;

    // Mettre à jour le corps du tableau
    tableBody.innerHTML = preview;

    // Afficher ou masquer le message "Aucune donnée"
    if (preview.trim() === "") {
        noDataMessage.style.display = 'block';
    } else {
        noDataMessage.style.display = 'none';
    }
}

function handleCalculateStats() {
    const selectedColumn = columnSelect.value;
    if (!selectedColumn) return;

    showLoader();

    const data = { column: selectedColumn };

    const startRow = document.getElementById('start-row').value;
    const endRow = document.getElementById('end-row').value;
    if (startRow && endRow) {
        data.startIndex = startRow;
        data.endIndex = endRow;
    }

    fetch('/get_stats/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoader();
        if (data.error) {
            alert(data.error);
            return;
        }

        // Mettre à jour les statistiques
        statsContainer.innerHTML = '';
        if (data.type === 'numeric') {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${data.mean.toFixed(2)}</div>
                    <div class="stat-label">Moyenne</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.median.toFixed(2)}</div>
                    <div class="stat-label">Médiane</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.std.toFixed(2)}</div>
                    <div class="stat-label">Écart-type</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.min.toFixed(2)}</div>
                    <div class="stat-label">Minimum</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.max.toFixed(2)}</div>
                    <div class="stat-label">Maximum</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.q1.toFixed(2)}</div>
                    <div class="stat-label">Premier quartile (Q1)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.q3.toFixed(2)}</div>
                    <div class="stat-label">Troisième quartile (Q3)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.skewness.toFixed(2)}</div>
                    <div class="stat-label">Asymétrie (Skewness)</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.kurtosis.toFixed(2)}</div>
                    <div class="stat-label">Kurtosis</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.missing_values}</div>
                    <div class="stat-label">Valeurs manquantes</div>
                </div>
            `;
        } else {
            statsContainer.innerHTML = `
                <div class="stat-card">
                    <div class="stat-value">${data.unique_count}</div>
                    <div class="stat-label">Valeurs uniques</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.most_common[0].value}</div>
                    <div class="stat-label">Valeur la plus fréquente</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.most_common[0].count}</div>
                    <div class="stat-label">Fréquence</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${data.missing_values}</div>
                    <div class="stat-label">Valeurs manquantes</div>
                </div>
            `;
        }
    })
    .catch(error => {
        hideLoader();
        alert('Erreur lors de la récupération des statistiques : ' + error.message);
    });
}

function handleDisplayData() {
    const rowIndex = document.getElementById('row-index').value;
    const columnName = document.getElementById('column-name').value;

    if (!rowIndex && !columnName) {
        alert("Veuillez entrer un index de ligne ou un nom de colonne.");
        return;
    }

    showLoader();

    const data = {};
    if (rowIndex) data.rowIndex = rowIndex;
    if (columnName) data.columnName = columnName;

    fetch('/display_data/', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoader();
        if (data.error) {
            alert(data.error);
            return;
        }

        // Afficher les données dans l'aperçu
        const tableBody = document.querySelector('.styled-table tbody');
        if (data.row_data) {
            tableBody.innerHTML = data.row_data;
        } else if (data.column_data) {
            tableBody.innerHTML = data.column_data;
        }

        // Afficher ou masquer le message "Aucune donnée"
        if (tableBody.innerHTML.trim() === "") {
            noDataMessage.style.display = 'block';
        } else {
            noDataMessage.style.display = 'none';
        }
    })
    .catch(error => {
        hideLoader();
        alert('Erreur lors de la récupération des données : ' + error.message);
    });
}

function handleGenerateVisualization() {
    const selectedColumn = vizColumnSelect.value || columnSelect.value; // Utiliser la colonne sélectionnée ou la première colonne par défaut
    const selectedVizType = vizTypeSelect.value;
    if (!selectedColumn || !selectedVizType) return;

    showLoader();

    fetch('/get_visualization/', {
        method: 'POST',
        body: JSON.stringify({ column: selectedColumn, type: selectedVizType }),
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoader();
        if (data.error) {
            alert(data.error);
            return;
        }

        // Mettre à jour la visualisation
        Plotly.newPlot(vizContainer, JSON.parse(data.plot));
        noVizMessage.style.display = 'none';
    })
    .catch(error => {
        hideLoader();
        alert('Erreur lors de la génération de la visualisation : ' + error.message);
        noVizMessage.style.display = 'block';
    });
}

function handleDownload() {
    window.location.href = '/download_csv/'; // Redirige vers l'URL de téléchargement
}

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

// Écouteurs d'événements
uploadBtn.addEventListener('click', handleFileUpload); // Gère l'upload de fichier
calculateStatsBtn.addEventListener('click', handleCalculateStats); // Gère le calcul des statistiques
displayDataBtn.addEventListener('click', handleDisplayData); // Gère l'affichage des données
generateVizBtn.addEventListener('click', handleGenerateVisualization); // Gère la génération de visualisation
downloadBtn.addEventListener('click', handleDownload); // Gère le téléchargement du fichier CSV