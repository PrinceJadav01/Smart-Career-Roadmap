import pandas as pd
import numpy as np
import random

# Define all possible skills in our platform
SKILLS = ["HTML & CSS", "JavaScript", "React", "Node.js", "Python", "SQL", "C#", "Docker", "AWS", "Git", "Kubernetes", "Cybersecurity Basics", "Figma", "UX Research", "Agile & Scrum", "Product Management", "Technical Writing", "Business Analysis", "Blockchain & Solidity", "Data Visualization", "QA & Testing", "SEO & Marketing", "IT Support & Networking", "Mobile Dev (iOS/Android)"]

# Define roles and their required skill levels (0-5)
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
    "Digital Marketing Specialist": {"SEO & Marketing": 5, "Data Visualization": 3, "HTML & CSS": 2}
}

# Define available courses (resources) and what skill they teach (and up to what level)
COURSES = [
    {"id": 1, "title": "HTML & CSS Basics", "skill": "HTML & CSS", "target_level": 2},
    {"id": 2, "title": "Advanced CSS & Tailwind", "skill": "HTML & CSS", "target_level": 5},
    {"id": 3, "title": "JavaScript Fundamentals", "skill": "JavaScript", "target_level": 3},
    {"id": 4, "title": "Modern JS (ES6+)", "skill": "JavaScript", "target_level": 5},
    {"id": 5, "title": "React for Beginners", "skill": "React", "target_level": 3},
    {"id": 6, "title": "Advanced React Patterns", "skill": "React", "target_level": 5},
    {"id": 7, "title": "Node.js & Express API", "skill": "Node.js", "target_level": 4},
    {"id": 8, "title": "Python Bootcamp", "skill": "Python", "target_level": 3},
    {"id": 9, "title": "Data Science with Python", "skill": "Python", "target_level": 5},
    {"id": 10, "title": "PostgreSQL Mastery", "skill": "SQL", "target_level": 5},
    {"id": 11, "title": "C# Masterclass", "skill": "C#", "target_level": 4},
    {"id": 12, "title": "Docker Complete Guide", "skill": "Docker", "target_level": 5},
    {"id": 13, "title": "AWS Cloud Practitioner", "skill": "AWS", "target_level": 3},
    {"id": 14, "title": "AWS Solutions Architect", "skill": "AWS", "target_level": 5},
    {"id": 15, "title": "Git & GitHub Crash Course", "skill": "Git", "target_level": 4},
    {"id": 16, "title": "Kubernetes in Practice", "skill": "Kubernetes", "target_level": 5},
    {"id": 17, "title": "Cybersecurity Fundamentals", "skill": "Cybersecurity Basics", "target_level": 5},
    {"id": 18, "title": "UI Design with Figma", "skill": "Figma", "target_level": 5},
    {"id": 19, "title": "UX Research Methods", "skill": "UX Research", "target_level": 4},
    {"id": 20, "title": "Agile & Scrum Mastery", "skill": "Agile & Scrum", "target_level": 5},
    {"id": 21, "title": "Product Management 101", "skill": "Product Management", "target_level": 5},
    {"id": 22, "title": "Technical Writing Guide", "skill": "Technical Writing", "target_level": 5},
    {"id": 23, "title": "Business Analysis Core", "skill": "Business Analysis", "target_level": 5},
    {"id": 24, "title": "Blockchain & Solidity", "skill": "Blockchain & Solidity", "target_level": 5},
    {"id": 25, "title": "Data Visualization with Tableau", "skill": "Data Visualization", "target_level": 5},
    {"id": 26, "title": "Automated QA Testing", "skill": "QA & Testing", "target_level": 5},
    {"id": 27, "title": "SEO & Digital Marketing", "skill": "SEO & Marketing", "target_level": 5},
    {"id": 28, "title": "IT Support & Networking", "skill": "IT Support & Networking", "target_level": 5},
    {"id": 29, "title": "Mobile App Dev (React Native)", "skill": "Mobile Dev (iOS/Android)", "target_level": 5}
]

def generate_user_data(num_samples=2000):
    data = []
    
    for _ in range(num_samples):
        # Pick a random target role
        target_role = random.choice(list(ROLES.keys()))
        
        # Generate random current skill levels for the user (mostly low to medium)
        current_skills = {skill: random.randint(0, 3) for skill in SKILLS}
        
        # Occasionally give a user high skills
        if random.random() > 0.8:
            for skill in random.sample(SKILLS, 2):
                current_skills[skill] = random.randint(3, 5)
                
        # Determine which courses this user needs based on their target role and current skills
        required_courses = {f"course_{c['id']}": 0 for c in COURSES}
        
        role_reqs = ROLES[target_role]
        for skill, required_level in role_reqs.items():
            user_level = current_skills[skill]
            if user_level < required_level:
                # User needs courses for this skill
                for course in COURSES:
                    if course["skill"] == skill:
                        # If the course target level is greater than user's current level, they need it
                        if course["target_level"] > user_level:
                            required_courses[f"course_{course['id']}"] = 1
                            
        # Create row
        row = {"target_role": target_role}
        for skill, level in current_skills.items():
            row[f"skill_{skill}"] = level
            
        row.update(required_courses)
        data.append(row)
        
    return pd.DataFrame(data)

if __name__ == "__main__":
    df = generate_user_data(5000)
    df.to_csv("dataset.csv", index=False)
    print("Generated dataset.csv with 5000 records.")
