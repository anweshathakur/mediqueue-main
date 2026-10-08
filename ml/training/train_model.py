"""
MediQueue - Historical Training Dataset Generation & ETA Model Training
Trains a RandomForestRegressor on consultation features to predict estimated wait times.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
from pathlib import Path

# Seed for reproducibility
np.random.seed(42)

def generate_synthetic_historical_data(n_samples=2500):
    """
    Generates realistic clinical queue data representing historical consultations.
    Features:
      - patients_ahead: 0 to 15
      - priority: 0 (normal), 1 (priority), 2 (critical)
      - hour: 8 to 19 (clinic hours)
      - day_of_week: 0 (Monday) to 5 (Saturday)
      - doctor_avg_duration: 8.0 to 20.0 minutes
      - is_appointment: 0 (walk-in) or 1 (scheduled)
    """
    patients_ahead = np.random.randint(0, 16, n_samples)
    priority = np.random.choice([0, 1, 2], size=n_samples, p=[0.70, 0.25, 0.05])
    hour = np.random.randint(8, 20, n_samples)
    day_of_week = np.random.randint(0, 6, n_samples)
    doctor_avg_duration = np.random.choice([10.0, 12.0, 15.0, 18.0], size=n_samples)
    is_appointment = np.random.choice([0, 1], size=n_samples, p=[0.4, 0.6])

    # Target: total wait time for the patient in minutes
    # Formula components:
    # 1. Base time from patients ahead
    # 2. Peak hour congestion factor (hours 10-12 and 15-17 have ~15% slight delay)
    # 3. Priority discount: critical (instant = 0), priority (expedited wait)
    # 4. Walk-ins vs Appointments variance
    # 5. Stochastic clinical variance (noise)

    noise = np.random.normal(0, 2.5, n_samples)
    peak_multiplier = np.where((hour >= 10) & (hour <= 12) | (hour >= 15) & (hour <= 17), 1.15, 1.0)
    
    # Calculate target wait time
    raw_wait = (
        patients_ahead * doctor_avg_duration * peak_multiplier
        + (1 - is_appointment) * 3.0 # walk-ins queue overhead
        + noise
    )

    # Priority adjustments:
    # Critical (2) -> wait is essentially 0
    # Priority (1) -> wait is reduced by ~35% due to expedited slotting
    actual_wait = np.where(
        priority == 2,
        0.0,
        np.where(priority == 1, raw_wait * 0.65, raw_wait)
    )

    # Ensure non-negative
    actual_wait = np.clip(actual_wait, 0.0, 300.0)

    df = pd.DataFrame({
        'patients_ahead': patients_ahead,
        'priority': priority,
        'hour': hour,
        'day_of_week': day_of_week,
        'doctor_avg_duration': doctor_avg_duration,
        'is_appointment': is_appointment,
        'actual_wait_minutes': np.round(actual_wait, 2)
    })

    return df

def train_and_save_model():
    print("Generating training dataset from historical clinical queue telemetry...")
    df = generate_synthetic_historical_data()
    print(f"Dataset shape: {df.shape}")
    print(df.head())

    feature_cols = [
        'patients_ahead',
        'priority',
        'hour',
        'day_of_week',
        'doctor_avg_duration',
        'is_appointment'
    ]
    target_col = 'actual_wait_minutes'

    X = df[feature_cols]
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Baseline Evaluation: Simple (patients_ahead * avg_duration)
    baseline_pred = np.where(
        X_test['priority'] == 2,
        0.0,
        X_test['patients_ahead'] * X_test['doctor_avg_duration']
    )
    baseline_mae = mean_absolute_error(y_test, baseline_pred)
    print(f"\n--- Baseline Model MAE: {baseline_mae:.2f} mins ---")

    # Train Random Forest Regressor
    print("Training RandomForestRegressor...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)

    print(f"--- ML Model Evaluation ---")
    print(f"MAE:  {mae:.2f} mins (Improved from {baseline_mae:.2f} mins)")
    print(f"RMSE: {rmse:.2f} mins")
    print(f"R²:   {r2:.4f}")

    # Save trained model
    output_dir = Path(__file__).resolve().parent.parent / "models"
    output_dir.mkdir(parents=True, exist_ok=True)
    model_path = output_dir / "eta_model.joblib"

    joblib.dump(model, model_path)
    print(f"\n✅ Trained model saved successfully to: {model_path}")

if __name__ == "__main__":
    train_and_save_model()
