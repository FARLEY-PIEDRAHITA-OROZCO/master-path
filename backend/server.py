"""
Dummy backend server - Esta aplicación no necesita backend
Solo existe para satisfacer la configuración de supervisor
"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Esta aplicación es solo frontend, no necesita backend"}

@app.get("/health")
def health():
    return {"status": "ok"}
