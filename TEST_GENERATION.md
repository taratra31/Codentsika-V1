# 🧪 Guide de Test - Générateur de Projets

## ✅ Améliorations appliquées

### Backend (`aibackend.py`)
1. ✅ **Logs améliorés**: Affichage détaillé de chaque étape avec émojis
2. ✅ **Limitation des fichiers**: Maximum 15 fichiers pour éviter les timeouts
3. ✅ **Validation JSON**: Vérification que le résultat est sérialisable
4. ✅ **Gestion d'erreurs renforcée**: Traceback complet en cas d'erreur
5. ✅ **Timeout LLM**: 600 secondes (10 minutes) par appel

### Frontend (`BackendStudio.tsx` & `Projects.tsx`)
1. ✅ **Progression jusqu'à 100%**: Plus de blocage à 99%
2. ✅ **Timeout de 10 minutes**: AbortController pour éviter les attentes infinies
3. ✅ **Logs console**: Suivi détaillé de la génération
4. ✅ **Messages d'erreur améliorés**: Erreurs spécifiques et claires

---

## 🚀 Comment tester

### 1. Démarrer le backend
```bash
cd backend
source venv/bin/activate  # ou venv\Scripts\activate sur Windows
python main.py
```

**Attendez de voir:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### 2. Démarrer le frontend
```bash
cd frontend
npm run dev
```

**Attendez de voir:**
```
VITE ready in XXX ms
Local: http://localhost:5173/
```

### 3. Tester une génération simple

**Option A: Projects (génération simple)**
1. Aller sur http://localhost:5173/dashboard/projects
2. Entrer un prompt simple:
   ```
   API de blog avec articles et commentaires
   ```
3. Choisir `FastAPI`
4. Cliquer sur "Concevoir le Projet"

**Option B: Backend Studio (génération avec schéma)**
1. Aller sur http://localhost:5173/dashboard/backend-studio
2. Entrer un nom de projet: `blog-api`
3. Choisir `FastAPI`
4. Dans l'étape 2, garder les tables par défaut (users, posts)
5. Cliquer sur "Compiler & Scaffolder le Projet"

---

## 📊 Ce que vous devriez voir

### Dans la console du backend:
```
============================================================
🚀 DÉMARRAGE DU PIPELINE DE GÉNÉRATION
============================================================

🚀 Étape 1/5: Génération de l'architecture...
✅ Architecture générée (XXXX chars)

📋 Étape 2/5: Génération de la liste des fichiers...
✅ XX fichiers identifiés

📁 Génération de XX fichiers...
  ✍️ [1/XX] app/main.py... ✅
  ✍️ [2/XX] app/models.py... ✅
  ... (etc)

🔍 Étape 4/5: Vérification finale...
✅ Vérification terminée

📖 Étape 5/5: Génération du README.md...
✅ README généré

============================================================
✅ PIPELINE TERMINÉ: XX fichiers générés
============================================================
✅ Résultat validé et prêt à être envoyé
```

### Dans la console du navigateur (F12):
```
🚀 Démarrage de la génération du projet...
Framework: fastapi
Tables: 2
Relations: 1
📡 Réponse reçue, status: 200
✅ Données reçues: { project_name: "blog-api", files_count: 12 }
```

### Dans l'interface:
1. **Pendant la génération**: Barre de progression 0% → 100%
2. **À 100%**: Message "Projet généré avec succès !"
3. **Après 800ms**: Affichage de l'IDE virtuel avec tous les fichiers

---

## 🐛 Dépannage

### Problème: Backend ne démarre pas
**Solution**: Vérifier que les dépendances sont installées
```bash
cd backend
pip install -r requirements.txt
```

### Problème: "Clé d'API NVIDIA non configurée"
**Solution**: Créer un fichier `.env` dans `backend/`
```env
NVIDIA_API_KEY=votre_clé_ici
NVIDIA_API_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.1-70b-instruct
```

### Problème: Reste bloqué à 99%
**Vérifier dans la console du backend:**
- S'il y a des erreurs LLM
- Si le timeout est atteint (600s = 10 min)
- Si la génération continue ou est bloquée

**Vérifier dans la console du navigateur:**
- S'il y a des erreurs réseau
- Si le timeout frontend (10 min) est atteint

### Problème: "Timeout 10 min"
**Solutions possibles:**
1. Utiliser un prompt plus simple
2. Réduire le nombre de tables dans Backend Studio
3. Choisir FastAPI au lieu de Laravel (plus rapide)
4. Vérifier la vitesse de votre connexion API NVIDIA

### Problème: Erreur JSON parsing
**Dans le backend**, regarder `backend/failed_json.txt` pour voir la réponse brute de l'IA

---

## 💡 Conseils pour une génération réussie

### ✅ BON (rapide, fiable)
- **Prompts courts**: "API de blog avec articles"
- **2-3 tables maximum**: users, posts, comments
- **Relations simples**: 1-2 relations
- **FastAPI**: Plus rapide à générer que Laravel

### ❌ À ÉVITER (lent, risque de timeout)
- **Prompts complexes**: "Système complet de gestion d'entreprise avec..."
- **Trop de tables**: 10+ tables
- **Relations multiples**: 20+ relations
- **Laravel avec Docker + Tests**: Génère beaucoup de fichiers

---

## 📝 Exemples de prompts testés et validés

### Simple (30s - 2min)
```
API de gestion de tâches avec utilisateurs
```

### Moyen (2-4min)
```
API E-commerce avec produits, commandes et panier
```

### Complexe (4-8min) ⚠️
```
Système de réservation de vols avec passagers, escales et tickets
```

---

## 🎯 Indicateurs de succès

✅ **Génération réussie si:**
- La progression atteint 100%
- L'IDE virtuel s'affiche
- Vous pouvez naviguer dans les fichiers
- Le bouton "Télécharger (.ZIP)" fonctionne
- La console backend montre "PIPELINE TERMINÉ"

❌ **Génération échouée si:**
- Reste bloqué à 99% pendant 2+ minutes
- Message d'erreur rouge s'affiche
- Console backend montre "ERREUR CRITIQUE"
- Timeout après 10 minutes

---

## 🔧 Maintenance

Si le problème persiste:

1. **Nettoyer les logs**
```bash
cd backend
rm -f failed_json.txt
```

2. **Redémarrer le backend**
```bash
# Ctrl+C pour arrêter
python main.py
```

3. **Vider le cache du navigateur**
```
Ctrl+Shift+Delete → Cocher "Cache" → Supprimer
```

4. **Tester avec un prompt minimal**
```
API simple avec utilisateurs
```

---

## 📞 Support

Si rien ne fonctionne:
1. Copier les logs de la console backend
2. Copier les logs de la console navigateur (F12)
3. Copier le contenu de `backend/failed_json.txt` (si existe)
4. Noter le prompt utilisé et le framework choisi

Bonne chance! 🚀
