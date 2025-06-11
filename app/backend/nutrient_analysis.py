# app/backend/nutrient_analysis.py

from typing import Dict, List, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
from dotenv import load_dotenv
import openai
import uvicorn

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

class UserResponse(BaseModel):
    question: str
    answer: str

class NutrientAnalysis(BaseModel):
    responses: List[UserResponse]
    additional_info: Optional[str] = None

class NutrientAnalyzer:
    def __init__(self):
        self.base_nutrients = {
            "Vitamin D": {"amount": 0, "unit": "µg", "rdi": 100, "description": "Important for immune system and bone health"},
            "Vitamin B12": {"amount": 0, "unit": "µg", "rdi": 100, "description": "Essential for nerve function and energy"},
            "Iron": {"amount": 0, "unit": "mg", "rdi": 100, "description": "Critical for oxygen transport and energy"},
            "Magnesium": {"amount": 0, "unit": "mg", "rdi": 100, "description": "Important for muscle function and stress management"},
            "Zinc": {"amount": 0, "unit": "mg", "rdi": 100, "description": "Key for immune system and wound healing"},
            "Omega-3": {"amount": 0, "unit": "g", "rdi": 100, "description": "Essential for brain health and inflammation control"},
            "Vitamin C": {"amount": 0, "unit": "mg", "rdi": 100, "description": "Important for immune system and collagen production"},
            "Calcium": {"amount": 0, "unit": "mg", "rdi": 100, "description": "Critical for bone health and muscle function"}
        }

        self.symptom_nutrient_map = {
            "fatigue": ["Iron", "Vitamin B12", "Vitamin D"],
            "muscle_cramps": ["Magnesium", "Calcium"],
            "poor_immune": ["Vitamin D", "Zinc", "Vitamin C"],
            "dry_skin": ["Omega-3", "Vitamin D"],
            "mood_issues": ["Omega-3", "Vitamin D", "Magnesium"],
            "bone_pain": ["Vitamin D", "Calcium"],
            "hair_loss": ["Iron", "Zinc"],
            "wound_healing": ["Zinc", "Vitamin C"],
            "brain_fog": ["Omega-3", "Vitamin B12"],
            "anxiety": ["Magnesium", "Omega-3"],
            "depression": ["Omega-3", "Vitamin D", "Vitamin B12"],
            "insomnia": ["Magnesium", "Vitamin D"],
            "joint_pain": ["Omega-3", "Vitamin D"],
            "digestive_issues": ["Magnesium", "Zinc"]
        }

    def analyze_responses(self, user_responses: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyserar användarens svar och bedömer näringsbrister
        """
        nutrients = self.base_nutrients.copy()
        
        # Analysera symptom
        if "symptoms" in user_responses:
            for symptom in user_responses["symptoms"]:
                if symptom in self.symptom_nutrient_map:
                    for nutrient in self.symptom_nutrient_map[symptom]:
                        nutrients[nutrient]["rdi"] -= 10

        # Analysera livsstil
        if "diet" in user_responses:
            diet = user_responses["diet"].lower()
            if "vegetarian" in diet:
                nutrients["Vitamin B12"]["rdi"] -= 20
                nutrients["Iron"]["rdi"] -= 15
            if "vegan" in diet:
                nutrients["Vitamin B12"]["rdi"] -= 30
                nutrients["Iron"]["rdi"] -= 20
                nutrients["Calcium"]["rdi"] -= 15
            if "low_fat" in diet:
                nutrients["Omega-3"]["rdi"] -= 20
            if "low_carb" in diet:
                nutrients["Magnesium"]["rdi"] -= 15

        # Analysera ålder
        if "age" in user_responses:
            age = int(user_responses["age"])
            if age > 50:
                nutrients["Vitamin D"]["rdi"] -= 20
                nutrients["Calcium"]["rdi"] -= 15
            if age > 70:
                nutrients["Vitamin B12"]["rdi"] -= 15

        # Analysera kön
        if "gender" in user_responses:
            if user_responses["gender"].lower() == "female":
                nutrients["Iron"]["rdi"] -= 20
                nutrients["Calcium"]["rdi"] -= 10

        # Beräkna faktiska värden
        for nutrient in nutrients:
            rdi = nutrients[nutrient]["rdi"]
            if rdi < 70:
                nutrients[nutrient]["amount"] = 0
                nutrients[nutrient]["status"] = "deficient"
            elif rdi < 85:
                nutrients[nutrient]["amount"] = 50
                nutrients[nutrient]["status"] = "low"
            else:
                nutrients[nutrient]["amount"] = 100
                nutrients[nutrient]["status"] = "normal"

        return nutrients

    def generate_recommendations(self, nutrients: Dict[str, Any]) -> List[str]:
        """
        Genererar rekommendationer baserat på näringsanalysen
        """
        recommendations = []
        
        for nutrient, data in nutrients.items():
            if data["status"] in ["deficient", "low"]:
                recommendations.append({
                    "nutrient": nutrient,
                    "status": data["status"],
                    "description": data["description"],
                    "recommendation": f"Consider increasing intake of {nutrient} through diet or supplements"
                })
        
        return recommendations

# Initialize the analyzer
analyzer = NutrientAnalyzer()

@app.get("/")
async def root():
    return {"message": "Welcome to the Nutrient Analysis API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/analyze")
async def analyze_nutrients(analysis: NutrientAnalysis):
    try:
        # Your existing analysis logic here
        return {"status": "success", "message": "Analysis completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)