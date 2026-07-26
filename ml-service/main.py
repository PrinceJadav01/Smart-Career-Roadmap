from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import joblib
import os

app = FastAPI(title="SkillSathi ML Service")

# Allow requests from frontend and ASP.NET backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model and targets globally
MODEL_PATH = "model.pkl"
TARGET_COLS_PATH = "target_cols.pkl"

model = None
target_cols = None

ALL_SKILLS = [
    "HTML & CSS", "JavaScript", "React", "Node.js", "Python", "SQL", "C#",
    "Docker", "AWS", "Git", "Kubernetes", "Cybersecurity Basics", "Figma",
    "UX Research", "Agile & Scrum", "Product Management", "Technical Writing",
    "Business Analysis", "Blockchain & Solidity", "Data Visualization",
    "QA & Testing", "SEO & Marketing", "IT Support & Networking",
    "Mobile Dev (iOS/Android)"
]

# Role requirements mapping (same as generate_dataset.py)
ROLES = {
    "Frontend Developer": {"HTML & CSS": 5, "JavaScript": 4, "React": 4, "Git": 3},
    "Backend Developer": {"Node.js": 4, "Python": 3, "SQL": 4, "Git": 3, "Docker": 2},
    "Full Stack Developer": {"HTML & CSS": 4, "JavaScript": 4, "React": 3, "Node.js": 4, "SQL": 3, "Git": 3},
    "Data Scientist": {"Python": 5, "SQL": 4, "Data Visualization": 4, "AWS": 2},
    "DevOps Engineer": {"Docker": 5, "AWS": 4, "Git": 4, "Python": 3, "Kubernetes": 4},
    "Cloud Architect": {"AWS": 5, "Docker": 4, "Kubernetes": 4, "Python": 3, "Git": 3},
    "Cybersecurity Analyst": {"Cybersecurity Basics": 5, "Python": 4, "IT Support & Networking": 3, "SQL": 2},
    "Mobile App Developer": {"Mobile Dev (iOS/Android)": 5, "JavaScript": 4, "React": 4, "Git": 3},
    "UI/UX Designer": {"Figma": 5, "UX Research": 4, "HTML & CSS": 3},
    "Product Manager": {"Product Management": 5, "Agile & Scrum": 4, "Business Analysis": 3, "UX Research": 2},
    "Scrum Master": {"Agile & Scrum": 5, "Product Management": 3, "Business Analysis": 2},
    "Technical Writer": {"Technical Writing": 5, "HTML & CSS": 3, "Git": 3},
    "Business Analyst": {"Business Analysis": 5, "Data Visualization": 4, "SQL": 3, "Agile & Scrum": 3},
    "IT Support Specialist": {"IT Support & Networking": 5, "Cybersecurity Basics": 3, "SQL": 2},
    "Blockchain Developer": {"Blockchain & Solidity": 5, "JavaScript": 4, "Python": 3, "Git": 3},
    "Data Analyst": {"SQL": 5, "Data Visualization": 5, "Python": 4, "Business Analysis": 3},
    "QA Engineer": {"QA & Testing": 5, "Python": 3, "JavaScript": 3, "Git": 3, "Agile & Scrum": 2},
    "Machine Learning Engineer": {"Python": 5, "SQL": 4, "Data Visualization": 3, "AWS": 3},
    "Digital Marketing Specialist": {"SEO & Marketing": 5, "Data Visualization": 3, "HTML & CSS": 2}
}

# Courses catalog (same as generate_dataset.py)
COURSES = [
    {"id": 1, "title": "HTML & CSS Basics", "skill": "HTML & CSS", "target_level": 2, "url": "https://www.youtube.com/watch?v=mU6anWqZJcc", "platform": "YouTube", "duration": "6 hrs", "cost": "Free"},
    {"id": 2, "title": "Advanced CSS & Tailwind", "skill": "HTML & CSS", "target_level": 5, "url": "https://www.youtube.com/watch?v=UBOj6rqRUME", "platform": "YouTube", "duration": "4 hrs", "cost": "Free"},
    {"id": 3, "title": "JavaScript Fundamentals", "skill": "JavaScript", "target_level": 3, "url": "https://www.youtube.com/watch?v=W6NZfCO5SIk", "platform": "YouTube", "duration": "1 hr", "cost": "Free"},
    {"id": 4, "title": "Modern JS (ES6+)", "skill": "JavaScript", "target_level": 5, "url": "https://www.udemy.com/course/the-complete-javascript-course/", "platform": "Udemy", "duration": "68 hrs", "cost": "Paid"},
    {"id": 5, "title": "React for Beginners", "skill": "React", "target_level": 3, "url": "https://www.youtube.com/watch?v=SqcY0GlETPk", "platform": "YouTube", "duration": "3 hrs", "cost": "Free"},
    {"id": 6, "title": "Advanced React Patterns", "skill": "React", "target_level": 5, "url": "https://react.dev/learn", "platform": "Official Docs", "duration": "Self-paced", "cost": "Free"},
    {"id": 7, "title": "Node.js & Express API", "skill": "Node.js", "target_level": 4, "url": "https://www.youtube.com/watch?v=TlB_eWDSMt4", "platform": "YouTube", "duration": "10 hrs", "cost": "Free"},
    {"id": 8, "title": "Python Bootcamp", "skill": "Python", "target_level": 3, "url": "https://www.youtube.com/watch?v=_uQrJ0TkZlc", "platform": "YouTube", "duration": "6 hrs", "cost": "Free"},
    {"id": 9, "title": "Data Science with Python", "skill": "Python", "target_level": 5, "url": "https://www.coursera.org/specializations/data-science-python", "platform": "Coursera", "duration": "5 months", "cost": "Free Audit"},
    {"id": 10, "title": "PostgreSQL Mastery", "skill": "SQL", "target_level": 5, "url": "https://www.youtube.com/watch?v=qw5y87951cf", "platform": "YouTube", "duration": "4 hrs", "cost": "Free"},
    {"id": 11, "title": "C# Masterclass", "skill": "C#", "target_level": 4, "url": "https://www.youtube.com/watch?v=GhQdlIFylQ8", "platform": "YouTube", "duration": "4 hrs", "cost": "Free"},
    {"id": 12, "title": "Docker Complete Guide", "skill": "Docker", "target_level": 5, "url": "https://www.youtube.com/watch?v=fqMOX6JJhGo", "platform": "YouTube", "duration": "6 hrs", "cost": "Free"},
    {"id": 13, "title": "AWS Cloud Practitioner", "skill": "AWS", "target_level": 3, "url": "https://www.youtube.com/watch?v=SOTamWNgDKc", "platform": "YouTube", "duration": "13 hrs", "cost": "Free"},
    {"id": 14, "title": "AWS Solutions Architect", "skill": "AWS", "target_level": 5, "url": "https://www.udemy.com/course/aws-certified-solutions-architect-associate/", "platform": "Udemy", "duration": "26 hrs", "cost": "Paid"},
    {"id": 15, "title": "Git & GitHub Crash Course", "skill": "Git", "target_level": 4, "url": "https://www.youtube.com/watch?v=RGOj5yH7evk", "platform": "YouTube", "duration": "2 hrs", "cost": "Free"},
    {"id": 16, "title": "Kubernetes in Practice", "skill": "Kubernetes", "target_level": 5, "url": "https://www.youtube.com/watch?v=X48VuDVv0do", "platform": "YouTube", "duration": "4 hrs", "cost": "Free"},
    {"id": 17, "title": "Cybersecurity Fundamentals", "skill": "Cybersecurity Basics", "target_level": 5, "url": "https://www.coursera.org/specializations/intro-cyber-security", "platform": "Coursera", "duration": "4 months", "cost": "Free Audit"},
    {"id": 18, "title": "UI Design with Figma", "skill": "Figma", "target_level": 5, "url": "https://www.youtube.com/watch?v=FTFaQWZBqQ8", "platform": "YouTube", "duration": "12 hrs", "cost": "Free"},
    {"id": 19, "title": "UX Research Methods", "skill": "UX Research", "target_level": 4, "url": "https://www.coursera.org/learn/ux-research-methods", "platform": "Coursera", "duration": "4 weeks", "cost": "Free Audit"},
    {"id": 20, "title": "Agile & Scrum Mastery", "skill": "Agile & Scrum", "target_level": 5, "url": "https://www.youtube.com/watch?v=SWdlRnFhIag", "platform": "YouTube", "duration": "2 hrs", "cost": "Free"},
    {"id": 21, "title": "Product Management 101", "skill": "Product Management", "target_level": 5, "url": "https://www.coursera.org/learn/digital-product-management", "platform": "Coursera", "duration": "4 weeks", "cost": "Free Audit"},
    {"id": 22, "title": "Technical Writing Guide", "skill": "Technical Writing", "target_level": 5, "url": "https://developers.google.com/tech-writing", "platform": "Google Docs", "duration": "Self-paced", "cost": "Free"},
    {"id": 23, "title": "Business Analysis Core", "skill": "Business Analysis", "target_level": 5, "url": "https://www.coursera.org/learn/business-analysis-process", "platform": "Coursera", "duration": "4 weeks", "cost": "Free Audit"},
    {"id": 24, "title": "Blockchain & Solidity", "skill": "Blockchain & Solidity", "target_level": 5, "url": "https://www.youtube.com/watch?v=M576WGiDBdQ", "platform": "YouTube", "duration": "16 hrs", "cost": "Free"},
    {"id": 25, "title": "Data Visualization with Tableau", "skill": "Data Visualization", "target_level": 5, "url": "https://www.youtube.com/watch?v=TPMlZxRRaBQ", "platform": "YouTube", "duration": "8 hrs", "cost": "Free"},
    {"id": 26, "title": "Automated QA Testing", "skill": "QA & Testing", "target_level": 5, "url": "https://www.youtube.com/watch?v=VVUbLZaWEGQ", "platform": "YouTube", "duration": "5 hrs", "cost": "Free"},
    {"id": 27, "title": "SEO & Digital Marketing", "skill": "SEO & Marketing", "target_level": 5, "url": "https://www.youtube.com/watch?v=n80kSR0z1Pc", "platform": "YouTube", "duration": "7 hrs", "cost": "Free"},
    {"id": 28, "title": "IT Support & Networking", "skill": "IT Support & Networking", "target_level": 5, "url": "https://www.coursera.org/professional-certificates/google-it-support", "platform": "Coursera", "duration": "6 months", "cost": "Free Audit"},
    {"id": 29, "title": "Mobile App Dev (React Native)", "skill": "Mobile Dev (iOS/Android)", "target_level": 5, "url": "https://www.youtube.com/watch?v=0-S5a0eXPoc", "platform": "YouTube", "duration": "8 hrs", "cost": "Free"}
]

TRENDING_ROLES = ["Full Stack Developer", "Data Scientist", "Cloud Architect", "Cybersecurity Analyst", "Product Manager"]

@app.on_event("startup")
def load_model():
    global model, target_cols
    if os.path.exists(MODEL_PATH) and os.path.exists(TARGET_COLS_PATH):
        model = joblib.load(MODEL_PATH)
        target_cols = joblib.load(TARGET_COLS_PATH)
        print("Model loaded successfully.")
    else:
        print("Warning: Model files not found. Please train the model first.")

# ── Request/Response Models ──────────────────────────────────

class PredictionRequest(BaseModel):
    target_role: str
    skills: dict  # e.g. {"HTML & CSS": 2, "JavaScript": 1, ...}

class SuggestRolesRequest(BaseModel):
    skills: dict  # e.g. {"HTML & CSS": 3, "Python": 2}

# ── /suggest-roles — Suggest best career roles based on user skills ──

@app.post("/suggest-roles")
def suggest_roles(request: SuggestRolesRequest):
    user_skills = request.skills  # {skill_name: level}

    # If user provided no skills or all zeros, return trending roles
    if not user_skills or all(v == 0 for v in user_skills.values()):
        results = []
        for role_name in TRENDING_ROLES:
            reqs = ROLES.get(role_name, {})
            results.append({
                "role": role_name,
                "match_percent": 0,
                "demand": _get_demand(role_name),
                "salary_range": _get_salary(role_name),
                "missing_skills": list(reqs.keys()),
                "is_trending": True
            })
        return {"suggested_roles": results, "source": "trending"}

    # Calculate match score for each role
    scored_roles = []
    for role_name, requirements in ROLES.items():
        total_weight = sum(requirements.values())
        user_score = 0
        missing = []

        for skill, required_level in requirements.items():
            user_level = user_skills.get(skill, 0)
            if user_level >= required_level:
                user_score += required_level
            elif user_level > 0:
                user_score += user_level
                missing.append(skill)
            else:
                missing.append(skill)

        match_pct = round((user_score / total_weight) * 100) if total_weight > 0 else 0

        scored_roles.append({
            "role": role_name,
            "match_percent": match_pct,
            "demand": _get_demand(role_name),
            "salary_range": _get_salary(role_name),
            "missing_skills": missing,
            "is_trending": role_name in TRENDING_ROLES
        })

    # Sort by match_percent descending, take top 5
    scored_roles.sort(key=lambda x: x["match_percent"], reverse=True)
    return {"suggested_roles": scored_roles[:5], "source": "ml_matched"}

# ── /predict-path — Predict learning path with full course details ──

@app.post("/predict-path")
def predict_path(request: PredictionRequest):
    if model is None:
        return {"error": "Model not loaded."}

    # Format input into a pandas DataFrame row matching the training data feature columns
    row_data = {"target_role": request.target_role}

    for skill in ALL_SKILLS:
        row_data[f"skill_{skill}"] = request.skills.get(skill, 0)

    df = pd.DataFrame([row_data])

    # Predict
    predictions = model.predict(df)[0]

    # Map predictions (1s) to full course details
    recommended_courses = []
    for col_name, pred_val in zip(target_cols, predictions):
        if pred_val == 1:
            course_id = int(col_name.replace("course_", ""))
            # Find full course info
            course_info = next((c for c in COURSES if c["id"] == course_id), None)
            if course_info:
                recommended_courses.append({
                    "id": course_info["id"],
                    "title": course_info["title"],
                    "skill": course_info["skill"],
                    "target_level": course_info["target_level"],
                    "url": course_info["url"],
                    "platform": course_info["platform"],
                    "duration": course_info["duration"],
                    "cost": course_info["cost"]
                })

    # Also compute skill gaps for context
    role_reqs = ROLES.get(request.target_role, {})
    skill_gaps = []
    for skill_name, required_level in role_reqs.items():
        current_level = request.skills.get(skill_name, 0)
        if current_level < required_level:
            skill_gaps.append({
                "skill": skill_name,
                "current_level": current_level,
                "required_level": required_level,
                "gap": required_level - current_level
            })

    return {
        "target_role": request.target_role,
        "recommended_courses": recommended_courses,
        "skill_gaps": skill_gaps,
        "total_courses": len(recommended_courses)
    }

# ── Helper functions ──

def _get_demand(role_name):
    demand_map = {
        "Frontend Developer": "High Demand", "Backend Developer": "Critical",
        "Full Stack Developer": "Critical", "Data Scientist": "High Demand",
        "DevOps Engineer": "Critical", "Cloud Architect": "Critical",
        "Cybersecurity Analyst": "High Demand", "Mobile App Developer": "High Demand",
        "UI/UX Designer": "High Demand", "Product Manager": "High Demand",
        "Scrum Master": "Average", "Technical Writer": "Average",
        "Business Analyst": "High Demand", "IT Support Specialist": "Average",
        "Blockchain Developer": "High Demand", "Data Analyst": "High Demand",
        "QA Engineer": "Average", "Machine Learning Engineer": "High Demand",
        "Digital Marketing Specialist": "High Demand"
    }
    return demand_map.get(role_name, "Average")

def _get_salary(role_name):
    salary_map = {
        "Frontend Developer": "₹6-18 LPA", "Backend Developer": "₹8-22 LPA",
        "Full Stack Developer": "₹10-25 LPA", "Data Scientist": "₹15-30 LPA",
        "DevOps Engineer": "₹15-28 LPA", "Cloud Architect": "₹18-35 LPA",
        "Cybersecurity Analyst": "₹10-25 LPA", "Mobile App Developer": "₹8-20 LPA",
        "UI/UX Designer": "₹6-18 LPA", "Product Manager": "₹15-35 LPA",
        "Scrum Master": "₹12-24 LPA", "Technical Writer": "₹6-15 LPA",
        "Business Analyst": "₹8-20 LPA", "IT Support Specialist": "₹3-8 LPA",
        "Blockchain Developer": "₹15-30 LPA", "Data Analyst": "₹6-16 LPA",
        "QA Engineer": "₹6-15 LPA", "Machine Learning Engineer": "₹12-28 LPA",
        "Digital Marketing Specialist": "₹5-12 LPA"
    }
    return salary_map.get(role_name, "₹5-15 LPA")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
