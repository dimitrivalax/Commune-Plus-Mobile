#!/usr/bin/env python3
"""
Script pour générer les icônes Android à partir d'une icône source
"""
import os
import sys
from PIL import Image

# Tailles des icônes Android pour chaque densité
ANDROID_ICON_SIZES = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

# Couleur de fond (couleur primaire du projet #2563eb)
BACKGROUND_COLOR = (37, 99, 235, 255)  # RGBA

def generate_android_icons():
    # Chemin de l'icône source
    script_dir = os.path.dirname(os.path.abspath(__file__))
    source_icon = os.path.join(script_dir, 'public', 'assets', 'logo.png')
    android_res_path = os.path.join(script_dir, 'android', 'app', 'src', 'main', 'res')
    
    # Vérifier que l'icône source existe
    if not os.path.exists(source_icon):
        print(f"Erreur: L'icône source {source_icon} n'existe pas")
        sys.exit(1)
    
    # Charger l'icône source
    print('Chargement de l\'icône source...')
    try:
        source_image = Image.open(source_icon)
        # Convertir en RGBA si nécessaire
        if source_image.mode != 'RGBA':
            source_image = source_image.convert('RGBA')
        print(f'✓ Icône source chargée: {source_image.size[0]}x{source_image.size[1]}')
    except Exception as e:
        print(f'Erreur lors du chargement de l\'icône: {e}')
        sys.exit(1)
    
    # Créer la structure de dossiers
    print('\nCréation de la structure de dossiers Android...')
    for density in ANDROID_ICON_SIZES.keys():
        dir_path = os.path.join(android_res_path, density)
        os.makedirs(dir_path, exist_ok=True)
        print(f'✓ Créé: {dir_path}')
    
    # Générer les icônes pour chaque densité
    print('\nGénération des icônes Android...')
    for density, size in ANDROID_ICON_SIZES.items():
        output_path = os.path.join(android_res_path, density, 'ic_launcher.png')
        
        # Redimensionner l'image en conservant les proportions
        resized = source_image.copy()
        resized.thumbnail((size, size), Image.Resampling.LANCZOS)
        
        # Créer une nouvelle image avec fond transparent
        icon = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        
        # Centrer l'image redimensionnée
        x = (size - resized.size[0]) // 2
        y = (size - resized.size[1]) // 2
        icon.paste(resized, (x, y), resized)
        
        # Sauvegarder
        icon.save(output_path, 'PNG')
        print(f'✓ Généré: {output_path} ({size}x{size})')
    
    # Générer aussi ic_launcher_foreground.png et ic_launcher_background.png pour Android 8.0+
    # (Adaptive icons)
    print('\nGénération des icônes adaptatives (Android 8.0+)...')
    for density, size in ANDROID_ICON_SIZES.items():
        # Foreground (l'icône elle-même)
        foreground_path = os.path.join(android_res_path, density, 'ic_launcher_foreground.png')
        resized = source_image.copy()
        resized.thumbnail((size, size), Image.Resampling.LANCZOS)
        foreground = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        x = (size - resized.size[0]) // 2
        y = (size - resized.size[1]) // 2
        foreground.paste(resized, (x, y), resized)
        foreground.save(foreground_path, 'PNG')
        
        # Background (fond uni - utilise la couleur primaire du projet)
        background_path = os.path.join(android_res_path, density, 'ic_launcher_background.png')
        background = Image.new('RGBA', (size, size), BACKGROUND_COLOR)
        background.save(background_path, 'PNG')
        
        print(f'✓ Généré: {foreground_path} et {background_path} ({size}x{size})')
    
    print('\n✅ Toutes les icônes Android ont été générées avec succès!')
    print('\nNote: Si le dossier android n\'existe pas encore, exécutez:')
    print('  npx cap add android')
    print('Puis copiez les icônes générées dans android/app/src/main/res/')

if __name__ == '__main__':
    generate_android_icons()

