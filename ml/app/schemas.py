from pydantic import BaseModel, Field
from typing import Optional

class ETARequest(BaseModel):
    patients_ahead: int = Field(..., ge=0, description="Number of patients waiting ahead in the doctor's queue")
    priority: int = Field(0, ge=0, le=2, description="0=normal, 1=priority, 2=critical")
    hour: int = Field(..., ge=0, le=23, description="Hour of the day (0-23)")
    day_of_week: int = Field(..., ge=0, le=6, description="Day of week (0=Mon, 6=Sun)")
    doctor_avg_duration: float = Field(12.0, gt=0, description="Doctor's average consultation duration in minutes")
    is_appointment: int = Field(1, ge=0, le=1, description="1=scheduled appointment, 0=walk-in")

class ETAResponse(BaseModel):
    predicted_eta_minutes: float = Field(..., description="Estimated wait time in minutes")
    confidence_score: float = Field(0.95, description="Model prediction confidence")
    model_version: str = Field("rf_v1.0.0", description="Model architecture version")
