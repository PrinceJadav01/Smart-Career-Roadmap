import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib

def train_and_save_model():
    print("Loading dataset...")
    df = pd.read_csv("dataset.csv")
    
    # Separate features (X) and targets (Y)
    feature_cols = [c for c in df.columns if not c.startswith("course_")]
    target_cols = [c for c in df.columns if c.startswith("course_")]
    
    X = df[feature_cols]
    Y = df[target_cols]
    
    # We need to one-hot encode the categorical 'target_role' column
    print("Building model pipeline...")
    categorical_features = ["target_role"]
    categorical_transformer = OneHotEncoder(handle_unknown="ignore")
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", categorical_transformer, categorical_features)
        ],
        remainder="passthrough" # Keep skill columns as they are numeric
    )
    
    # Use RandomForest which naturally supports multi-output classification
    clf = RandomForestClassifier(n_estimators=50, random_state=42)
    
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", clf)
    ])
    
    print("Training model...")
    pipeline.fit(X, Y)
    
    # Save the pipeline
    joblib.dump(pipeline, "model.pkl")
    
    # Also save the course mapping so the API knows which course ID is which index
    joblib.dump(target_cols, "target_cols.pkl")
    
    print("Model trained and saved to model.pkl successfully.")

if __name__ == "__main__":
    train_and_save_model()
