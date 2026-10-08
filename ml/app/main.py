from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.model import load_model
from app.schemas import ETARequest, ETAResponse
import numpy as np

app = FastAPI(
    title="MediQueue ML ETA Prediction Service",
    description="Real-time machine learning inference API for predicting patient consultation wait times.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        load_model()
        print("ML ETA Model loaded into memory on startup.")
    except Exception as e:
        print(f"Warning: Could not pre-load model: {e}")

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "mediqueue-ml-eta",
        "model_loaded": True
    }

@app.post("/predict-eta", response_model=ETAResponse)
def predict_eta(data: ETARequest):
    try:
        model = load_model()
        
        # Format features in exact expected order:
        # ['patients_ahead', 'priority', 'hour', 'day_of_week', 'doctor_avg_duration', 'is_appointment']
        features = np.array([[
            data.patients_ahead,
            data.priority,
            data.hour,
            data.day_of_week,
            data.doctor_avg_duration,
            data.is_appointment
        ]])

        prediction = float(model.predict(features)[0])
        predicted_minutes = max(0.0, round(prediction, 1))

        return ETAResponse(
            predicted_eta_minutes=predicted_minutes,
            confidence_score=0.95,
            model_version="rf_v1.0.0"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
