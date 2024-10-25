from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import openai
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv

# Initialize FastAPI app
app = FastAPI()

# Set OpenAI API Key from environment
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable not set")

# Initialize LangChain ChatOpenAI model globally
llm = ChatOpenAI(openai_api_key=openai_api_key, model="gpt-4")

# Define request models
class PromptRequest(BaseModel):
    question: str
    coding_language: str

class CompareRequest(BaseModel):
    question: str
    coding_language: str
    my_solution: str

# Endpoint to generate solution
@app.post("/get_solution")
async def get_solution(request: PromptRequest):
    prompt_template = PromptTemplate(
        template="Solve the following question in {coding_language}: {question}",
        input_variables=["question", "coding_language"]
    )

    try:
        result = (prompt_template | llm).invoke({
            "question": request.question,
            "coding_language": request.coding_language
        }).content  # Extract content from AIMessage object

        return {"solution": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating solution: {e}")

# Endpoint to compare solutions with separate similarity score and hint
@app.post("/compare_solution")
async def compare_solution(request: CompareRequest):
    # Generate GPT solution using the same template
    prompt_template = PromptTemplate(
        template="Solve the following question in {coding_language}: {question}",
        input_variables=["question", "coding_language"]
    )

    try:
        # Generate GPT-based solution
        generated_solution = (prompt_template | llm).invoke({
            "question": request.question,
            "coding_language": request.coding_language
        }).content  # Extract content from AIMessage object

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
            "question": request.question,
            "coding_language": request.coding_language,
            "generated_solution": generated_solution,
            "user_solution": request.my_solution
        }).content  # Extract content from AIMessage object

        # Parse the result to extract similarity score and hint
        lines = evaluation_result.split('\n')
        similarity_score = lines[0].split(": ")[1].strip()
        hint = lines[1].split(": ", 1)[1].strip()

        return {
            "generated_solution": generated_solution,
            "user_solution": request.my_solution,
            "similarity_score": similarity_score,
            "hint": hint
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing solutions: {e}")

# Run with uvicorn: uvicorn script_name:app --reload
