// background.js

// Listener for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'processData') {
      const data = message.data;
  
      // Add a 2-second delay before processing
      setTimeout(() => {
        // First API call to /receive_text
        fetch('http://localhost:8080/receive_text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
          .then(response => response.json())
          .then(serverResponse => {
            console.log("Response from /receive_text:", serverResponse);
  
            // Second API call to /compare_solution
            const requestData = {
              question: data.question,
              coding_language: data.program_type,
              my_solution: data.answer
            };
  
            return fetch('http://localhost:8080/compare_solution', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(requestData)
            });
          })
          .then(response => response.json())
          .then(compareResponse => {
            console.log("Response from /compare_solution:", compareResponse);
  
            // Send the similarity score back to the content script
            chrome.tabs.sendMessage(sender.tab.id, { similarityScore: compareResponse.similarity_score });
          })
          .catch(error => console.error("Error in API calls:", error));
      }, 2000); // 2000 milliseconds = 2 seconds
  
      // Keep the message channel open for asynchronous response
      return true;
    }
  });