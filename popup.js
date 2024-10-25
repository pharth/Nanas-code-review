document.addEventListener("DOMContentLoaded", () => {
  // Get the button by ID
  const button = document.getElementById("extractButton");

  // Add a click event listener to the button
  button.addEventListener("click", () => {
    // Get the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      // Use the chrome.scripting API to execute a function on the active tab
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: extractDivContent  // Function to run in the context of the webpage
      }, (results) => {
        // Check if results were returned
        if (results && results[0] && results[0].result) {
          // Display the extracted text in the popup
          document.getElementById("greeting").innerText = results[0].result;
        } else {
          // If no result, show a fallback message
          document.getElementById("greeting").innerText = "Could not extract content.";
        }
      });
    });
  });
});

// This function runs in the context of the webpage
function extractDivContent() {
  // Select the div with class "view-lines monaco-mouse-cursor-text"
  const element = document.querySelector('.view-lines.monaco-mouse-cursor-text');

  // Check if the element exists
  if (element) {
    // Get the text content of the element (this will extract all text inside the <div>)
    return element.innerText.trim();
  } else {
    return "Element not found.";
  }
}
