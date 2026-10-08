import joblib
from pathlib import Path
import os

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "eta_model.joblib"

class ModelContainer:
    _instance = None
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            if not MODEL_PATH.exists():
                raise FileNotFoundError(f"Trained model not found at {MODEL_PATH}. Run training first.")
            cls._model = joblib.load(MODEL_PATH)
            print(f"Loaded ML ETA model from {MODEL_PATH}")
        return cls._model

# Lazy singleton
def load_model():
    return ModelContainer.get_model()
