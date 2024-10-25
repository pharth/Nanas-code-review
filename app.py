from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import openai
from langchain.chat_models import ChatOpenAI  # Use ChatOpenAI for chat models
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain

# Initialize FastAPI app
app = FastAPI()

# Set OpenAI API Key (replace with your actual key or load from environment)
openai.api_key = os.getenv("OPENAI_API_KEY")

print(openai.api_key)


# Define the input model
class PromptRequest(BaseModel):
    question: str
    coding_language: str

# FastAPI endpoint to generate solution
@app.post("/get_solution")
async def get_solution(request: PromptRequest):
    # Construct the prompt template
    prompt_template = PromptTemplate(
        template="Solve the following question in {coding_language}: {question}",
        input_variables=["question", "coding_language"]
    )

    # Initialize LangChain ChatOpenAI model
    llm = ChatOpenAI(openai_api_key=os.getenv("OPENAI_API_KEY"), model="gpt-4")  # Use gpt-4 or any other available chat model
    chain = LLMChain(llm=llm, prompt=prompt_template)

    # Generate response
    try:
        result = chain.run({"question": request.question, "coding_language": request.coding_language})
        return {"solution": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Run with uvicorn: uvicorn getsolution:app --reload
