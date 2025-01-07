from django.shortcuts import render, redirect
from django.http import JsonResponse, HttpResponse
import pandas as pd
import json
import plotly.express as px
import numpy as np
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required

# Vue pour la page d'accueil
def home(request):
    """Affiche la page d'accueil."""
    return render(request, 'analyzer/home.html')

# Vue pour la page principale après connexion
@login_required  # Nécessite que l'utilisateur soit connecté pour accéder à cette vue
def index(request):
    """Affiche la page principale après connexion."""
    return render(request, 'analyzer/index.html')

# Vue pour l'inscription
@csrf_exempt  # Désactive la protection CSRF pour cette vue (nécessaire pour les requêtes AJAX)
def signup(request):
    if request.method == 'POST':
        try:
            # Récupérer les données JSON envoyées par le client
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            confirm_password = data.get('confirm_password')

            # Validation des champs
            if not username or not email or not password or not confirm_password:
                return JsonResponse({'error': 'Tous les champs sont obligatoires.'}, status=400)

            if password != confirm_password:
                return JsonResponse({'error': 'Les mots de passe ne correspondent pas.'}, status=400)

            # Vérifier si le nom d'utilisateur existe déjà
            if User.objects.filter(username=username).exists():
                return JsonResponse({'error': 'Ce nom d\'utilisateur est déjà pris.'}, status=400)

            # Vérifier si l'email existe déjà
            if User.objects.filter(email=email).exists():
                return JsonResponse({'error': 'Cet email est déjà utilisé.'}, status=400)

            # Création de l'utilisateur
            user = User.objects.create_user(username=username, email=email, password=password)
            user.save()

            # Connexion de l'utilisateur après l'inscription
            login(request, user)
            return JsonResponse({'success': 'Inscription réussie !', 'redirect': '/index/'})

        except Exception as e:
            # En cas d'erreur, retourner un message d'erreur
            return JsonResponse({'error': str(e)}, status=500)

    # Si la méthode n'est pas POST, afficher la page d'inscription
    return render(request, 'analyzer/signup.html')

# Vue pour la connexion
@csrf_exempt  # Désactive la protection CSRF pour cette vue
def signin(request):
    if request.method == 'POST':
        try:
            # Récupérer les données JSON envoyées par le client
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            # Authentification de l'utilisateur
            user = authenticate(request, username=username, password=password)

            if user is not None:
                # Si l'authentification réussit, connecter l'utilisateur
                login(request, user)
                return JsonResponse({'success': 'Connexion réussie !', 'redirect': '/index/'})
            else:
                # Si l'authentification échoue, retourner une erreur
                return JsonResponse({'error': 'Nom d\'utilisateur ou mot de passe incorrect.'}, status=400)

        except Exception as e:
            # En cas d'erreur, retourner un message d'erreur
            return JsonResponse({'error': str(e)}, status=500)

    # Si la méthode n'est pas POST, afficher la page de connexion
    return render(request, 'analyzer/signin.html')

# Vue pour la déconnexion
def logout_view(request):
    """Déconnecte l'utilisateur et redirige vers la page d'accueil."""
    logout(request)
    return redirect('home')

# Vue pour l'upload de fichier CSV
@csrf_exempt  # Désactive la protection CSRF pour cette vue
def upload_file(request):
    """Gère l'upload et le traitement initial d'un fichier CSV."""
    if request.method == 'POST' and request.FILES.get('csv_file'):
        try:
            # Récupérer le fichier CSV uploadé
            csv_file = request.FILES['csv_file']
            # Lire le fichier CSV dans un DataFrame pandas
            df = pd.read_csv(csv_file, na_values=['', 'NA', 'null'])
            
            # Nettoyage de base des données : remplacer les infinis par NaN
            df = df.replace([np.inf, -np.inf], np.nan)
            
            # Stocker le DataFrame dans la session Django pour une utilisation ultérieure
            request.session['df_json'] = df.to_json(date_format='iso')
            
            # Générer des métadonnées pour chaque colonne
            columns_meta = []
            for col in df.columns:
                col_type = str(df[col].dtype)  # Type de données de la colonne
                unique_values = df[col].nunique()  # Nombre de valeurs uniques
                missing_values = df[col].isna().sum()  # Nombre de valeurs manquantes
                
                columns_meta.append({
                    'name': col,
                    'type': col_type,
                    'unique_values': int(unique_values),
                    'missing_values': int(missing_values)
                })
            
            # Générer un aperçu des 10 premières lignes du DataFrame au format HTML
            preview = df.head(10).to_html(index=True, header=False)
            
            # Retourner les métadonnées et l'aperçu des données au client
            return JsonResponse({
                'columns': columns_meta,
                'row_count': len(df),
                'preview': preview
            })
        except Exception as e:
            # En cas d'erreur, retourner un message d'erreur
            return JsonResponse({'error': f'Erreur lors du traitement du fichier : {str(e)}'}, status=400)
    # Si aucun fichier n'est uploadé, retourner une erreur
    return JsonResponse({'error': 'Aucun fichier uploadé'}, status=400)

# Vue pour afficher les données spécifiques
@csrf_exempt  # Désactive la protection CSRF pour cette vue
def display_data(request):
    """Affiche des données spécifiques en fonction de la sélection de l'utilisateur."""
    if request.method == 'POST':
        try:
            # Récupérer les données JSON envoyées par le client
            data = json.loads(request.body)
            # Charger le DataFrame à partir de la session Django
            df = pd.read_json(request.session.get('df_json'))
            
            result = {}
            
            # Si l'utilisateur ne spécifie rien, afficher tout le dataset
            if not data.get('rowIndex') and not data.get('startIndex') and not data.get('endIndex') and not data.get('columnName') and not data.get('columnRange'):
                result['dataset'] = df.to_html(index=True)
                return JsonResponse(result)
            
            # Gestion des lignes
            if 'rowIndex' in data:
                row_idx = int(data['rowIndex'])
                if 0 <= row_idx < len(df):
                    # Récupérer la ligne spécifiée et la convertir en HTML
                    result['row_data'] = df.iloc[[row_idx]].to_html(index=True, header=False)
                else:
                    return JsonResponse({'error': 'Index de ligne hors limites'}, status=400)
            
            if 'startIndex' in data and 'endIndex' in data:
                start = max(0, int(data['startIndex']))
                end = min(len(df), int(data['endIndex']) + 1)
                # Récupérer une plage de lignes et la convertir en HTML
                result['range_data'] = df.iloc[start:end].to_html(index=True, header=False)
            
            # Gestion des colonnes
            if 'columnName' in data:
                col = data['columnName']
                if col in df.columns:
                    # Récupérer la colonne spécifiée et la convertir en HTML
                    result['column_data'] = df[col].to_frame().to_html(index=True, header=False)
                else:
                    return JsonResponse({'error': 'Colonne non trouvée'}, status=400)
            
            # Gestion des ranges de colonnes
            if 'columnRange' in data:
                col_start = data['columnRange'].get('start')
                col_end = data['columnRange'].get('end')
                if col_start in df.columns and col_end in df.columns:
                    # Récupérer une plage de colonnes et la convertir en HTML
                    result['column_range_data'] = df.loc[:, col_start:col_end].to_html(index=True, header=False)
                else:
                    return JsonResponse({'error': 'Range de colonnes non trouvé'}, status=400)
            
            # Retourner les résultats au client
            return JsonResponse(result)
            
        except Exception as e:
            # En cas d'erreur, retourner un message d'erreur
            return JsonResponse({'error': str(e)}, status=400)
    # Si la méthode n'est pas POST, retourner une erreur
    return JsonResponse({'error': 'Requête invalide'}, status=400)

# Vue pour obtenir les statistiques
@csrf_exempt  # Désactive la protection CSRF pour cette vue
def get_stats(request):
    """Calcule et retourne une analyse statistique des données sélectionnées."""
    if request.method == 'POST':
        try:
            # Récupérer les données JSON envoyées par le client
            data = json.loads(request.body)
            column = data.get('column')
            # Charger le DataFrame à partir de la session Django
            df = pd.read_json(request.session.get('df_json'))
            
            # Appliquer un filtre sur les lignes si spécifié
            if 'startIndex' in data and 'endIndex' in data:
                start = max(0, int(data['startIndex']))
                end = min(len(df), int(data['endIndex']) + 1)
                df = df.iloc[start:end]
            
            stats = {}
            
            # Vérifier si la colonne est numérique
            if pd.api.types.is_numeric_dtype(df[column]):
                stats = {
                    'type': 'numeric',
                    'mean': float(df[column].mean()),  # Moyenne
                    'median': float(df[column].median()),  # Médiane
                    'std': float(df[column].std()),  # Écart-type
                    'min': float(df[column].min()),  # Minimum
                    'max': float(df[column].max()),  # Maximum
                    'q1': float(df[column].quantile(0.25)),  # Premier quartile
                    'q3': float(df[column].quantile(0.75)),  # Troisième quartile
                    'skewness': float(df[column].skew()),  # Asymétrie
                    'kurtosis': float(df[column].kurtosis()),  # Kurtosis
                    'missing_values': int(df[column].isna().sum())  # Valeurs manquantes
                }
            else:
                # Si la colonne est catégorique, calculer les statistiques appropriées
                value_counts = df[column].value_counts()
                stats = {
                    'type': 'categorical',
                    'unique_count': int(len(value_counts)),  # Nombre de valeurs uniques
                    'most_common': [
                        {'value': str(value), 'count': int(count)}
                        for value, count in value_counts.head(5).items()  # 5 valeurs les plus fréquentes
                    ],
                    'missing_values': int(df[column].isna().sum())  # Valeurs manquantes
                }
            
            # Retourner les statistiques au client
            return JsonResponse(stats)
        except Exception as e:
            # En cas d'erreur, retourner un message d'erreur
            return JsonResponse({'error': str(e)}, status=400)
    # Si la méthode n'est pas POST, retourner une erreur
    return JsonResponse({'error': 'Requête invalide'}, status=400)

# Vue pour générer des visualisations
@csrf_exempt  # Désactive la protection CSRF pour cette vue
def get_visualization(request):
    """Génère et retourne des visualisations interactives des données."""
    if request.method == 'POST':
        try:
            # Récupérer les données JSON envoyées par le client
            data = json.loads(request.body)
            column = data.get('column')
            viz_type = data.get('type')
            # Charger le DataFrame à partir de la session Django
            df = pd.read_json(request.session.get('df_json'))
            
            # Appliquer un filtre sur les lignes si spécifié
            if 'startIndex' in data and 'endIndex' in data:
                start = max(0, int(data['startIndex']))
                end = min(len(df), int(data['endIndex']) + 1)
                df = df.iloc[start:end]
            
            fig = None
            
            # Générer le type de visualisation demandé
            if viz_type == 'histogram':
                if pd.api.types.is_numeric_dtype(df[column]):
                    fig = px.histogram(df, x=column, nbins=30, title=f'Distribution de {column}')
                else:
                    value_counts = df[column].value_counts()
                    fig = px.bar(x=value_counts.index, y=value_counts.values, title=f'Distribution de {column}')
                    
            elif viz_type == 'box':
                if pd.api.types.is_numeric_dtype(df[column]):
                    fig = px.box(df, y=column, title=f'Box Plot de {column}')
                else:
                    return JsonResponse({'error': 'Le box plot nécessite des données numériques'}, status=400)
                    
            elif viz_type == 'scatter':
                if pd.api.types.is_numeric_dtype(df[column]):
                    fig = px.scatter(df, x=df.index, y=column, title=f'Scatter Plot de {column}')
                else:
                    return JsonResponse({'error': 'Le scatter plot nécessite des données numériques'}, status=400)
                    
            elif viz_type == 'time_series':
                if pd.api.types.is_numeric_dtype(df[column]):
                    fig = px.line(df, x=df.index, y=column, title=f'Série temporelle de {column}')
                else:
                    return JsonResponse({'error': 'La série temporelle nécessite des données numériques'}, status=400)
            
            elif viz_type == 'violin':
                if pd.api.types.is_numeric_dtype(df[column]):
                    fig = px.violin(df, y=column, title=f'Violin Plot de {column}')
                else:
                    return JsonResponse({'error': 'Le violin plot nécessite des données numériques'}, status=400)
            
            elif viz_type == 'heatmap':
                if pd.api.types.is_numeric_dtype(df[column]):
                    corr_matrix = df.corr()
                    fig = px.imshow(corr_matrix, title='Heatmap de corrélation')
                else:
                    return JsonResponse({'error': 'La heatmap nécessite des données numériques'}, status=400)
            
            elif viz_type == 'pairplot':
                if pd.api.types.is_numeric_dtype(df[column]):
                    fig = px.scatter_matrix(df, title='Pair Plot')
                else:
                    return JsonResponse({'error': 'Le pair plot nécessite des données numériques'}, status=400)
            
            elif viz_type == 'pie':
                value_counts = df[column].value_counts()
                fig = px.pie(names=value_counts.index, values=value_counts.values, title=f'Diagramme circulaire de {column}')
            
            elif viz_type == 'area':
                if pd.api.types.is_numeric_dtype(df[column]):
                    fig = px.area(df, x=df.index, y=column, title=f'Diagramme en aires de {column}')
                else:
                    return JsonResponse({'error': 'Le diagramme en aires nécessite des données numériques'}, status=400)
            
            elif viz_type == 'density_contour':
                if pd.api.types.is_numeric_dtype(df[column]):
                    fig = px.density_contour(df, x=df.index, y=column, title=f'Contour de densité de {column}')
                else:
                    return JsonResponse({'error': 'Le contour de densité nécessite des données numériques'}, status=400)
            
            if fig is None:
                return JsonResponse({'error': 'Type de visualisation non supporté'}, status=400)
                
            # Convertir la figure Plotly en JSON pour l'envoyer au client
            graph_json = fig.to_json()
            return JsonResponse({'plot': graph_json})
            
        except Exception as e:
            # En cas d'erreur, retourner un message d'erreur
            return JsonResponse({'error': str(e)}, status=400)
    # Si la méthode n'est pas POST, retourner une erreur
    return JsonResponse({'error': 'Requête invalide'}, status=400)

# Vue pour télécharger le fichier CSV
@csrf_exempt  # Désactive la protection CSRF pour cette vue
def download_csv(request):
    """Télécharge le fichier CSV traité."""
    if request.method == 'GET':
        try:
            # Charger le DataFrame à partir de la session Django
            df = pd.read_json(request.session.get('df_json'))
            # Créer une réponse HTTP avec le contenu du fichier CSV
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="processed_data.csv"'
            # Convertir le DataFrame en CSV et l'ajouter à la réponse
            df.to_csv(response, index=False)
            return response
        except Exception as e:
            # En cas d'erreur, retourner un message d'erreur
            return JsonResponse({'error': str(e)}, status=400)
    # Si la méthode n'est pas GET, retourner une erreur
    return JsonResponse({'error': 'Requête invalide'}, status=400)

# Vue pour télécharger une sélection du fichier CSV
@csrf_exempt  # Désactive la protection CSRF pour cette vue
def download_selection(request):
    """Télécharge une sélection spécifique du dataset."""
    if request.method == 'POST':
        try:
            # Récupérer les données JSON envoyées par le client
            data = json.loads(request.body)
            # Charger le DataFrame à partir de la session Django
            df = pd.read_json(request.session.get('df_json'))
            
            # Appliquer un filtre sur les lignes si spécifié
            if 'startIndex' in data and 'endIndex' in data:
                start = max(0, int(data['startIndex']))
                end = min(len(df), int(data['endIndex']) + 1)
                df = df.iloc[start:end]
            
            # Appliquer un filtre sur les colonnes si spécifié
            if 'columnRange' in data:
                col_start = data['columnRange'].get('start')
                col_end = data['columnRange'].get('end')
                if col_start in df.columns and col_end in df.columns:
                    df = df.loc[:, col_start:col_end]
            
            # Créer une réponse HTTP avec le contenu du fichier CSV
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="selected_data.csv"'
            # Convertir le DataFrame en CSV et l'ajouter à la réponse
            df.to_csv(response, index=False)
            return response
        except Exception as e:
            # En cas d'erreur, retourner un message d'erreur
            return JsonResponse({'error': str(e)}, status=400)
    # Si la méthode n'est pas POST, retourner une erreur
    return JsonResponse({'error': 'Requête invalide'}, status=400)