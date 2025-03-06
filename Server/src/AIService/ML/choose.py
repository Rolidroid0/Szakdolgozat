from fastapi import FastAPI
from agents.deep_q_agent import DQNAgent
from pydantic import BaseModel
from typing import List
import numpy as np

app = FastAPI()

input_dim = 105
output_dim = 119001
valid_actions = [0, 2, 3, 5, 7, 8, 11]

state = [0.12, 0.85, 0.43, 0.67, 0.29, 0.91, 0.34, 0.76, 0.58, 0.14, 
 0.37, 0.63, 0.49, 0.21, 0.82, 0.07, 0.95, 0.68, 0.31, 0.44, 
 0.73, 0.26, 0.88, 0.41, 0.53, 0.62, 0.17, 0.78, 0.39, 0.56, 
 0.11, 0.93, 0.48, 0.72, 0.35, 0.64, 0.24, 0.83, 0.19, 0.46, 
 0.71, 0.28, 0.87, 0.33, 0.59, 0.15, 0.81, 0.04, 0.97, 0.69, 
 0.32, 0.45, 0.74, 0.27, 0.89, 0.42, 0.54, 0.61, 0.16, 0.77, 
 0.38, 0.55, 0.13, 0.92, 0.47, 0.75, 0.36, 0.65, 0.25, 0.84, 
 0.18, 0.43, 0.70, 0.22, 0.86, 0.30, 0.52, 0.60, 0.10, 0.79, 
 0.40, 0.57, 0.09, 0.90, 0.50, 0.66, 0.20, 0.80, 0.05, 0.96, 
 0.51, 0.12, 0.41, 0.29, 0.73, 0.33, 0.58, 0.16, 0.82, 0.03, 
 0.98, 0.67, 0.34, 0.48, 0.72]

agent = DQNAgent(input_dim, output_dim)
agent.load_model()

def _flatten_state(state):
        return np.concatenate([
            state["ownership"],
            state["army_counts"],
            state["attackable"],
            [state["is_my_turn"]],
            [state["round_state"]]
        ])

class PredictionRequest(BaseModel):
    state: dict
    valid_actions: List[dict]

@app.post("/predict/")
async def predict(request: PredictionRequest):
    try:
        if not request.state or not request.valid_actions:
            return {"error": "State and valid actions cannot be empty."}

        action = agent.choose_action(_flatten_state(request.state), len(request.valid_actions))
        print(f"Agent chose action: {action}")

        return {"action": action}
    except Exception as e:
         print(f"Error parsing request: {e}")