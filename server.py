from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
import google.generativeai as genai
from dotenv import load_dotenv
import re

# Remove __pycache__ directory if it exists
pycache_dir = os.path.join(os.path.dirname(__file__), '__pycache__')
if os.path.exists(pycache_dir):
    shutil.rmtree(pycache_dir)

# Load environment variables
load_dotenv()
gemini_api_key = os.getenv("GEMINI_API_KEY")

if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set")

# Configure the Gemini API key
genai.configure(api_key=gemini_api_key)

# Initialize the Generative Model
model = genai.GenerativeModel("gemini-1.5-flash")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to store the latest extracted question, answer, and program type
latest_extracted_question = ""
latest_extracted_answer = ""
latest_extracted_program_type = ""


class ExtractedData(BaseModel):
    question: str
    answer: str
    program_type: str


@app.post("/receive_text")
async def receive_text(data: ExtractedData):
    global latest_extracted_question, latest_extracted_answer, latest_extracted_program_type
    latest_extracted_question = data.question
    latest_extracted_answer = data.answer
    latest_extracted_program_type = data.program_type

    return {
        "status": "success",
        "message": "Text received successfully",
        "received_question": latest_extracted_question,
        "received_answer": latest_extracted_answer,
        "received_program_type": latest_extracted_program_type
    }


@app.post("/compare_solution")
async def compare_solution():
    global latest_extracted_question, latest_extracted_answer, latest_extracted_program_type
    if not (latest_extracted_question and latest_extracted_answer and latest_extracted_program_type):
        raise HTTPException(
            status_code=400, detail="No data received yet for comparison")

    # Prompt to generate the solution based on the question and coding language
    generation_prompt = f"Solve the following question in {
        latest_extracted_program_type}: {latest_extracted_question}"

    try:
        # Generate a solution using the GenerativeModel
        generation_response = model.generate_content(generation_prompt)
        generated_solution = generation_response.text

        # Comparison prompt
        comparison_prompt = (
            f"Given the question: \"{latest_extracted_question}\" in the language \"{
                latest_extracted_program_type}\", "
            f"compare the two solutions below and provide:\n"
            f"1. A similarity score out of 5.\n"
            f"2. A hint to improve Solution 2 based on best practices or optimization strategies.\n\n"
            f"Solution 1 (Generated): {generated_solution}\n\n"
            f"Solution 2 (User-provided): {latest_extracted_answer}\n\n"
            f"Response Format:\nSimilarity Score: <score>/5\nHint: <hint>"
        )

        # Generate comparison evaluation using the GenerativeModel
        evaluation_response = model.generate_content(comparison_prompt)
        evaluation_result = evaluation_response.text

        # Parse similarity score and hint
        similarity_score_match = re.search(
            r"Similarity Score:\s*(\d+)/5", evaluation_result)
        hint_match = re.search(r"Hint:\s*(.*)", evaluation_result)

        similarity_score = similarity_score_match.group(
            1) if similarity_score_match else "6"
        hint = hint_match.group(1) if hint_match else "Hint not found."

        return {
            "generated_solution": generated_solution,
            "user_solution": latest_extracted_answer,
            "similarity_score": similarity_score,
            "hint": hint
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error comparing solutions: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
