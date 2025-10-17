import io
import logging
import os

import numpy as np
from flask import Flask, jsonify, redirect, request
from flask_cors import CORS
from PIL import Image
import joblib

app = Flask(__name__)

# --- CORS ---
frontend_origins = os.environ.get('FRONTEND_URLS')
if frontend_origins:
    try:
        origins = [u.strip() for u in frontend_origins.split(',') if u.strip()]
    except Exception:
        origins = ["http://localhost:3000", "http://localhost:3001"]
else:
    origins = ["http://localhost:3000", "http://localhost:3001"]
CORS(app, origins=origins)

# --- Config ---
app.config['MAX_CONTENT_LENGTH'] = 4 * 1024 * 1024
logging.basicConfig(level=logging.INFO)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# --- Model loading ---
model = None
def load_model_if_needed():
    global model
    if model is not None:
        return
    try:
        model_path = os.environ.get('MODEL_PATH', 'svm_model_cifar10.pkl')
        model = joblib.load(model_path)
        logging.info(f"Model loaded successfully from {model_path}.")
    except Exception as e:
        logging.error(f"Failed to load model: {e}")
        model = None

# --- Helper ---
def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# --- Routes ---
@app.route('/')
def home():
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    return redirect(frontend_url, code=302)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            load_model_if_needed()
        if model is None:
            return jsonify({'error': 'Model not available'}), 503

        if 'file' not in request.files:
            return jsonify({'error': 'No file part in the request'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if not allowed_file(file.filename):
            return jsonify({'error': 'File extension not allowed'}), 400

        # --- Image preprocessing ---
        img = Image.open(file.stream).convert("RGB").resize((32, 32))
        img_array = np.array(img) / 255.0
        img_array = img_array.reshape(1, -1)

        # --- Prediction ---
        prediction = model.predict(img_array)
        predicted_class = int(prediction[0])

        class_names = { 0: 'airplane', 1: 'automobile', 2: 'bird', 3: 'cat', 4: 'deer', 5: 'dog', 6: 'frog', 7: 'horse', 8: 'ship', 9: 'truck' }

        return jsonify({'prediction': class_names.get(predicted_class, 'Inconnu')})

    except Exception as e:
        logging.exception('Error during prediction')
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'model_loaded': model is not None})

if __name__ == "__main__":
    port = int(os.environ.get('PORT', 5000))
    debug_env = os.environ.get('FLASK_DEBUG', 'false').lower()
    debug = debug_env in ('1', 'true', 'yes')
    app.run(host='0.0.0.0', port=port, debug=debug)
