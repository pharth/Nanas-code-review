document.addEventListener("DOMContentLoaded", () => {
  let extractedData = { question: "", answer: "", program_type: "" };

  function autoExtractText() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: extractDivContent
      }, (results) => {
        if (results && results[0] && results[0].result) {
          extractedData = results[0].result;
          document.getElementById("greeting").innerText = 
            `Question: ${extractedData.question}\nAnswer: ${extractedData.answer}\nProgram Type: ${extractedData.program_type}`;
          
          sendToFastAPIServer(extractedData);
        } else {
          document.getElementById("greeting").innerText = "Could not extract content.";
        }
      });
    });
  }

  autoExtractText();
  setInterval(autoExtractText, 10000);

  function sendToFastAPIServer(data) {
    fetch('http://localhost:8080/receive_text', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(serverResponse => {
      console.log("Response from /receive_text:", serverResponse);
      
      // Pass the extracted data to callCompareSolution
      callCompareSolution(data.question, data.program_type, data.answer);
    })
    .catch(error => console.error("Error sending data to server:", error));
  }

  function callCompareSolution(question, program_type, user_solution) {
    const requestData = {
      question: question,
      coding_language: program_type,
      my_solution: user_solution
    };

    fetch('http://localhost:8080/compare_solution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(compareResponse => {
      console.log("Response from /compare_solution:", compareResponse);

      // Display the question, answer, program type, similarity score, and hint
      document.getElementById("greeting").innerText = 
        `Question: ${question}\n` +
        `Your Answer: ${user_solution}\n` +
        `Program Type: ${program_type}\n\n` +
        `Similarity Score: ${compareResponse.similarity_score}\n` +
        `Hint: ${compareResponse.hint}`;
    })
    .catch(error => console.error("Error comparing solution:", error));
  }
});

// This function runs in the context of the webpage to extract data
function extractDivContent() {
  const element = document.querySelector('.view-lines.monaco-mouse-cursor-text');
  const element_q = document.querySelector('.elfjS');
  const pythonButton = document.querySelector('.rounded.items-center.whitespace-nowrap.focus\\:outline-none.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.dark\\:text-text-secondary.active\\:bg-transparent.dark\\:active\\:bg-dark-transparent.hover\\:bg-fill-secondary.dark\\:hover\\:bg-fill-secondary.px-1\\.5.py-0\\.5.text-sm.font-normal.group');

  return {
    question: element_q ? element_q.innerText.trim() : "Question element not found.",
    answer: element ? element.innerText.trim() : "Answer element not found.",
    program_type: pythonButton ? pythonButton.textContent.trim() : "Program type element not found."
  };
}
