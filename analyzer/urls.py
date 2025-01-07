from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),  # Page d'accueil
    path('index/', views.index, name='index'),  # Page principale après connexion
    path('signup/', views.signup, name='signup'),  # Inscription
    path('signin/', views.signin, name='signin'),  # Connexion
    path('logout/', views.logout_view, name='logout'),  # Déconnexion
    path('upload_file/', views.upload_file, name='upload_file'),  # Upload de fichier CSV
    path('display_data/', views.display_data, name='display_data'),  # Affichage des données
    path('get_stats/', views.get_stats, name='get_stats'),  # Statistiques
    path('get_visualization/', views.get_visualization, name='get_visualization'),  # Visualisations
    path('download_csv/', views.download_csv, name='download_csv'),  # Télécharger le CSV
    path('download_selection/', views.download_selection, name='download_selection'),  # Télécharger une sélection
]