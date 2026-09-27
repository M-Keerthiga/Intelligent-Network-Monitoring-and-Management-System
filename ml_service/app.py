from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import numpy as np
from sklearn.ensemble import IsolationForest

app = FastAPI(title="INMMS ML Anomaly Detection Service")

# Initialize and fit a baseline synthetic IsolationForest model
# Normal baseline range: CPU (15-50%), Mem (30-60%), Latency (5-40ms), Loss (0%), Traffic (5-40 MB/s)
np.random.seed(42)
normal_samples = np.column_stack([
    np.random.uniform(15, 50, 500),   # cpu
    np.random.uniform(30, 60, 500),   # memory
    np.random.uniform(5, 40, 500),    # latency
    np.random.uniform(0, 1, 500),     # packet loss
    np.random.uniform(5, 40, 500)     # traffic
])

model = IsolationForest(contamination=0.05, random_state=42)
model.fit(normal_samples)

class MetricInput(BaseModel):
    cpu: float
    memory: float
    latency: float
    packet_loss: float
    traffic: float

@app.get("/")
def health_check():
    return {"status": "ONLINE", "model": "scikit-learn IsolationForest", "service": "INMMS ML Engine"}

@app.post("/predict")
def predict_anomaly(metrics: MetricInput):
    sample = np.array([[
        metrics.cpu,
        metrics.memory,
        metrics.latency,
        metrics.packet_loss,
        metrics.traffic
    ]])

    pred = model.predict(sample)[0] # 1 for inlier (normal), -1 for outlier (anomaly)
    score = float(model.score_samples(sample)[0])

    is_anomaly = bool(pred == -1)

    return {
        "is_anomaly": is_anomaly,
        "anomaly_score": round(score, 4),
        "prediction": "ANOMALY" if is_anomaly else "NORMAL"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=5000)
