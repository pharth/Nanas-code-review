from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import openai
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import re  # Import regex for robust parsing

load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set")

# Initialize LangChain ChatOpenAI model globally
llm = ChatOpenAI(openai_api_key=openai_api_key, model="gpt-4")

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
        raise HTTPException(status_code=400, detail="No data received yet for comparison")

    prompt_template = PromptTemplate(
        template="Solve the following question in {coding_language}: {question}",
        input_variables=["question", "coding_language"]
    )

    try:
        # Generate GPT-based solution
        generated_solution = (prompt_template | llm).invoke({
            "question": latest_extracted_question,
            "coding_language": latest_extracted_program_type
        }).content

        # Comparison prompt to extract both score and hint
        comparison_prompt = PromptTemplate(
            template=(
                "Given the question: \"{question}\" in the language \"{coding_language}\", compare the two solutions "
                "below and provide:\n1. A similarity score out of 10.\n2. A hint to improve Solution 2 based on best "
                "practices or optimization strategies.\n\n"
                "Solution 1 (Generated): {generated_solution}\n\n"
                "Solution 2 (User-provided): {user_solution}\n\n"
                "Response Format:\nSimilarity Score: <score>/10\nHint: <hint>"
            ),
            input_variables=["question", "coding_language", "generated_solution", "user_solution"]
        )

        # Run the comparison prompt
        evaluation_result = (comparison_prompt | llm).invoke({
            "question": latest_extracted_question,
            "coding_language": latest_extracted_program_type,
            "generated_solution": generated_solution,
            "user_solution": latest_extracted_answer
        }).content

        # Use regex to parse the result more robustly
        similarity_score_match = re.search(r"Similarity Score:\s*(\d+)/10", evaluation_result)
        hint_match = re.search(r"Hint:\s*(.*)", evaluation_result)

        similarity_score = similarity_score_match.group(1) if similarity_score_match else "N/A"
        hint = hint_match.group(1) if hint_match else "Hint not found."

        return {
            "generated_solution": generated_solution,
            "user_solution": latest_extracted_answer,
            "similarity_score": similarity_score,
            "hint": hint
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing solutions: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
