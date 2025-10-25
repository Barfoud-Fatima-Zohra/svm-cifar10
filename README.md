# SVM CIFAR-10 Classification

Petit projet avec un backend Flask et un frontend Next.js pour classer des images CIFAR-10 à l'aide d'un modèle SVM (scikit-learn).

### Web Interface
![Main Interface](/assets/website-screen.png)
*Main classification interface with drag-and-drop upload*

### Classification Results
![Results](/assets/website-screen-result.png)
*Real-time classification results with confidence scores*

## Contenu du dépôt
- `backend/app.py` : application Flask. Redirige `/` vers le frontend et expose `/predict` pour l'inférence.
- `backend/train_model.py` : script pour entraîner un SVM CIFAR‑10 et sauvegarder le modèle avec `joblib`.
- `backend/svm_model_cifar10.pkl` (ou variante comme `svm_model_cifar10_rbf.pkl`) : modèle pré‑entraîné si présent.
- `backend/requirements.txt` : dépendances Python du backend.
- `backend/Procfile`, `backend/render.yaml`, `backend/Dockerfile` : fichiers de déploiement.
- `frontend/` : application Next.js (interface web) servant l'upload d'image et l'appel de l'API backend.

## Prérequis
- Python 3.10 ou 3.11 recommandé
- Windows PowerShell (les commandes ci‑dessous sont pour PowerShell)
- Node.js 18+ pour le frontend

## Installation et exécution (localement, PowerShell)


1. Backend : créez et activez un environnement virtuel puis installez les deps :

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
cd ./backend
python -m pip install --upgrade pip
pip install -r requirements.txt
```

2. Frontend : installez les dépendances et lancez le serveur de dev (dans un autre terminal) :

```powershell
cd .\frontend
npm install
npm run dev
```

3. Lancer le backend Flask (utilise `svm_model_cifar10.pkl` par défaut si présent) :

```powershell
Set-Location ..\backend
$env:FRONTEND_URL='http://localhost:3000'
# Optionnel si le nom du fichier modèle diffère
# $env:MODEL_PATH='svm_model_cifar10_rbf.pkl'
python app.py
```

Ouvrez le frontend sur `http://localhost:3000`. Le backend écoute sur `http://127.0.0.1:5000` pour l'API `/predict`.

## Ré-entraîner le modèle (optionnel)
Si vous voulez (re)générer un modèle SVM :

```powershell
cd ./backend
python train_model.py
```
