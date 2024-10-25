from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Global variable to store the latest extracted text
latest_extracted_text = ""

class TextData(BaseModel):
    text: str

@app.post("/receive_text")
async def receive_text(data: TextData):
    global latest_extracted_text  # Access the global variable
    latest_extracted_text = data.text  # Store the extracted text
    
    # Return a JSON response with the received text message
    return {
        "status": "success",
        "message": "Text received successfully",
        "received_text": latest_extracted_text  # Include the text in the response
    }

@app.get("/get_latest_text")
async def get_latest_text():
    # Endpoint to retrieve the latest extracted text
    return {
        "status": "success",
        "text": latest_extracted_text
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
