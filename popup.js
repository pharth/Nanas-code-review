document.addEventListener("DOMContentLoaded", () => {
  let extractedData = { question: "", answer: "" };  // Variable to store extracted question and answer

  function autoExtractText() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: extractDivContent
      }, (results) => {
        if (results && results[0] && results[0].result) {
          extractedData = results[0].result;  // Store the extracted data
          document.getElementById("greeting").innerText = `Question: ${extractedData.question}\nAnswer: ${extractedData.answer}`;
          
          // Send the extracted data to the Python server
          sendToFastAPIServer(extractedData);
        } else {
          document.getElementById("greeting").innerText = "Could not extract content.";
        }
      });
    });
  }

  // Call the function immediately on page load
  autoExtractText();

  // Set up an interval to extract text every 5 seconds
  setInterval(autoExtractText, 5000);

  function sendToFastAPIServer(data) {
    // Send the extracted data to the FastAPI server
    fetch('http://localhost:8080/receive_text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)  // Send the object directly
    })
    .then(response => response.json())
    .then(data => console.log("Response from server:", data))
    .catch(error => console.error("Error sending data to server:", error));
  }
});

// This function runs in the context of the webpage
function extractDivContent() {
  const element = document.querySelector('.view-lines.monaco-mouse-cursor-text');
  const element_q = document.querySelector('.elfjS');

  // Create an object to hold the extracted question and answer
  const extractedData = {
    question: "",
    answer: ""
  };

  // Check if the question element exists and assign its text
  if (element_q) {
    extractedData.question = element_q.innerText.trim();
  } else {
    extractedData.question = "Question element not found.";
  }

  // Check if the answer element exists and assign its text
  if (element) {
    extractedData.answer = element.innerText.trim();
  } else {
    extractedData.answer = "Answer element not found.";
  }

  // Return the object containing both question and answer
  return extractedData;
}
