# ML Service

Machine learning layer for **MediQueue**, focused on predicting patient waiting time and improving real-time ETA estimation.

## What it does

The ML pipeline:

```text
Historical Queue Data
        ↓
Data Preparation
        ↓
Feature Engineering
        ↓
Model Training
        ↓
Evaluation
        ↓
Saved ETA Model
        ↓
FastAPI Prediction Service
```

The trained model will be exposed through:

```text
POST /predict-eta
```

The Node.js backend can query this endpoint whenever it needs an updated patient ETA.

## Structure

```text
ml/
├── app/
│   ├── main.py
│   ├── model.py
│   └── schemas.py
│
├── models/
│   └── eta_model.joblib
│
├── notebooks/
│   └── training.ipynb
│
├── requirements.txt
└── README.md
```

## Stack

* Python
* Pandas
* Scikit-learn
* Joblib
* FastAPI
* Uvicorn

## Running the ML Service

Create and activate a virtual environment:

```bash
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn app.main:app --reload --port 8000
```

API:

```text
http://localhost:8000
```

Interactive API documentation:

```text
http://localhost:8000/docs
```

## Prediction Flow

```text
React
  ↓
Node.js Backend
  ↓
POST /predict-eta
  ↓
FastAPI
  ↓
ETA Model
  ↓
Predicted Waiting Time
  ↓
Node.js
  ↓
Patient
```

The ML service is intentionally kept separate from the main Node.js backend so that the prediction model can be developed, evaluated, and updated independently.

Available next action: Create a downloadable DOCX file here in this chat containing the editable prose above
