// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      if (request.similarityScore !== undefined) {
        console.log("Received similarity score:", request.similarityScore);
        // Display the image based on the similarity score
        displayImageBasedOnScore(request.similarityScore);
      }
      sendResponse({ status: "Similarity score received" });
    }
  );
  
  function displayImageBasedOnScore(similarityScore) {
    // Map similarity scores to image indices
    let imageIndex = 0;
  
    // Assuming similarityScore is between 0 and 100
    // Adjust the ranges and image indices as needed
    if (similarityScore == 0) {
      imageIndex = 0; // image0.png
    } else if (similarityScore == 1) {
      imageIndex = 1; // image1.png
    } else if (similarityScore == 2) {
      imageIndex = 2; // image2.png
    } else if (similarityScore == 3) {
      imageIndex = 3; // image3.png
    } else if (similarityScore == 4) {
      imageIndex = 4; // image4.png
    } else {
      imageIndex = 5; // image5.png (default or error image)
    }
  
    // Create image container if it doesn't exist
    let imageContainer = document.getElementById("imageContainer");
    if (!imageContainer) {
      imageContainer = document.createElement("div");
      imageContainer.id = "imageContainer";
      imageContainer.style.position = "fixed";
      imageContainer.style.top = "10px";
      imageContainer.style.right = "10px";
      imageContainer.style.zIndex = "9999";
      imageContainer.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
      imageContainer.style.padding = "10px";
      imageContainer.style.borderRadius = "8px";
      document.body.appendChild(imageContainer);
  
      // Create image element
      const resultImage = document.createElement("img");
      resultImage.id = "resultImage";
      resultImage.style.width = "300px";
      resultImage.style.height = "200px";
      resultImage.style.borderRadius = "8px";
      resultImage.style.display = "block";
      resultImage.style.marginBottom = "10px";
      imageContainer.appendChild(resultImage);
  
      // Create toggle button
      const toggleButton = document.createElement("button");
      toggleButton.id = "imageToggleButton";
      toggleButton.innerText = "Toggle Image";
      toggleButton.style.padding = "10px";
      toggleButton.style.borderRadius = "5px";
      toggleButton.style.cursor = "pointer";
      toggleButton.style.marginBottom = "10px";
      imageContainer.appendChild(toggleButton);
  
      // Toggle button click handler
      let imageVisible = true;
      toggleButton.addEventListener("click", () => {
        imageVisible = !imageVisible;
        resultImage.style.display = imageVisible ? "block" : "none";
      });
    }
  
    // Update the image source based on the similarity score
    const resultImage = document.getElementById("resultImage");
    const imagePath = chrome.runtime.getURL(`image${imageIndex}.png`);
    console.log(`Displaying image: ${imagePath}`);
    resultImage.src = imagePath;
  }
