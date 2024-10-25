document.addEventListener("DOMContentLoaded", () => {
  let extractedText = "";  // Variable to store the extracted text

  function autoExtractText() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: extractDivContent
      }, (results) => {
        if (results && results[0] && results[0].result) {
          extractedText = results[0].result;  // Store the extracted text in the variable
          document.getElementById("greeting").innerText = extractedText;
          
          // Send the extracted text to the Python server
          sendToFastAPIServer(extractedText);
        } else {
          document.getElementById("greeting").innerText = "Could not extract content.";
        }
      });
    });
  }

  // Call the function immediately on page load
  autoExtractText();

  // Set up an interval to extract text every 5 seconds
  setInterval(autoExtractText, 1000);

  function sendToFastAPIServer(text) {
    // Send the extracted text to the FastAPI server
    fetch('http://localhost:8080/receive_text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text: text })
    })
    .then(response => response.json())
    .then(data => console.log("Response from server:", data))
    .catch(error => console.error("Error sending data to server:", error));
  }
});

// This function runs in the context of the webpage
function extractDivContent() {
  const element = document.querySelector('.view-lines.monaco-mouse-cursor-text');
  if (element) {
    return element.innerText.trim();
  } else {
    return "Element not found.";
  }
}
