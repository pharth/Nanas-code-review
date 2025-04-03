(function() {
    // Check if the script has already run
    if (window.hasFixyRun) {
        console.log("Fixy content script has already run, skipping initialization.");
        return;
    }
    window.hasFixyRun = true;
    console.log("Initializing Fixy content script.");

    // Function for webpage data extraction
    function extractDivContent() {
        const element = document.querySelector('.view-lines.monaco-mouse-cursor-text');
        const element_q = document.querySelector('.elfjS');
        const pythonButton = document.querySelector(
            'button.rounded.items-center.whitespace-nowrap.focus\\:outline-none.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.dark\\:text-text-secondary.active\\:bg-transparent.dark\\:active\\:bg-dark-transparent.hover\\:bg-fill-secondary.dark\\:hover\\:bg-fill-secondary.px-1\\.5.py-0\\.5.text-sm.font-normal.group'
        );

        return {
            question: element_q ? element_q.innerText.trim() : "Question element not found.",
            answer: element ? element.innerText.trim() : "Answer element not found.",
            program_type: pythonButton ? pythonButton.textContent.trim() : "Program type element not found."
        };
    }

    // Function to extract content and send to background script
    function autoExtractText() {
        const extractedData = extractDivContent();

        if (
            extractedData &&
            extractedData.question !== "Question element not found." &&
            extractedData.answer !== "Answer element not found." &&
            extractedData.program_type !== "Program type element not found."
        ) {
            console.log("Extracted Data:", extractedData);

            // Log the time when the message is sent
            console.log("Sending data to background script at:", new Date().toLocaleTimeString());

            // Try to send extracted data to the background script
            chrome.runtime.sendMessage({ action: 'processData', data: extractedData }, response => {
                if (chrome.runtime.lastError) {
                    console.error("Error sending message:", chrome.runtime.lastError.message);
                } else {
                    console.log("Message sent successfully:", response);
                }
            });
        } else {
            console.log("Incomplete data extracted, not sending to background script.");
        }
    }

    // Listener for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.similarityScore !== undefined) {
            console.log("Received similarity score:", request.similarityScore);
            // Display the image based on the similarity score
            displayImageBasedOnScore(request.similarityScore);
        } else {
            console.log("Received message without similarityScore:", request);
        }
    });

    // Image display logic
    function displayImageBasedOnScore(similarityScore) {
        console.log("Raw similarityScore received:", similarityScore);

        // Handle undefined or null similarityScore
        if (similarityScore === undefined || similarityScore === null || similarityScore === "") {
            similarityScore = "N/A";
        }

        let imageIndex = parseInt(similarityScore, 10);

        console.log("Parsed imageIndex:", imageIndex);

        if (!isNaN(imageIndex) && imageIndex >= 1 && imageIndex <= 5) {
            // Valid imageIndex between 1 and 5, do nothing
            console.log("Valid imageIndex:", imageIndex);
        } else {
            imageIndex = 6; // Use image6.png for invalid similarityScore
            console.log("Invalid similarityScore, defaulting imageIndex to 6");
        }

        // Create image container if it doesn't exist
        let imageContainer = document.getElementById("imageContainer");
        if (!imageContainer) {
            imageContainer = document.createElement("div");
            imageContainer.id = "imageContainer";
            document.body.appendChild(imageContainer);

            // Create toggle button
            const toggleButton = document.createElement("button");
            toggleButton.id = "imageToggleButton";
            toggleButton.innerText = "Toggle Image";
            imageContainer.appendChild(toggleButton);

            // Create image element
            const resultImage = document.createElement("img");
            resultImage.id = "resultImage";
            imageContainer.appendChild(resultImage);

            // Toggle button click handler
            let imageVisible = true;
            toggleButton.addEventListener("click", () => {
                imageVisible = !imageVisible;
                resultImage.style.visibility = imageVisible ? "visible" : "hidden"; // Toggle visibility
            });
        }

        // Update the image source based on the imageIndex
        const resultImage = document.getElementById("resultImage");
        const imagePath = chrome.runtime.getURL(`image${imageIndex}.png`);
        console.log(`chrome.runtime.getURL('image${imageIndex}.png') returned:`, imagePath);
        resultImage.src = imagePath;
    }

    // Start the periodic data extraction
    setInterval(autoExtractText, 4000);
    // Run it immediately once
    autoExtractText();

})();
