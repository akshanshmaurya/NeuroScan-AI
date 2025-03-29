from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import base64
import os

app = Flask(__name__)
# Configure CORS to accept requests from frontend
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],  # Add your frontend URL
        "methods": ["POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Load the model with absolute path resolution
model = None
try:
    model_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'Brain_Tumour_Detection_Model1.h5')
    model = tf.keras.models.load_model(model_path, compile=False)
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    print(f"Model loaded successfully from {model_path}")
except Exception as e:
    print(f"Error loading model: {str(e)}")
    raise

classes = ["Glioma", "Pituitary Tumor", "No Tumor", "Meningioma"]

def preprocess_image(image_data):
    try:
        # Remove header from base64 if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode and process image
        img_bytes = base64.b64decode(image_data)
        img = Image.open(io.BytesIO(img_bytes))
        img = img.convert('RGB')  # Convert to RGB
        img = img.resize((224, 224), Image.Resampling.LANCZOS)
        
        # Convert to array and normalize
        img_array = np.array(img, dtype=np.float32)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        print(f"Preprocessing error: {str(e)}")
        raise ValueError(f"Failed to process image: {str(e)}")

@app.route('/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not initialized'}), 500
    
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({'error': 'No image data provided'}), 400

        # Process image and make prediction
        processed_image = preprocess_image(data['image'])
        predictions = model.predict(processed_image, verbose=0)
        
        result = {
            'prediction': classes[np.argmax(predictions[0])],
            'confidence': float(np.max(predictions[0]))
        }
        
        return jsonify(result)
    except Exception as e:
        print(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)