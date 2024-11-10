# Nana-s-Code-Review

Our Dear Grandma helps us crack those insaneee DSA rounds with some small amounts of motivational push
-------------------------------------------------------------------------------------------------------

Features

	•	Extracts text content from supported webpages.
	•	Sends the extracted data to a local server for processing.
	•	Displays an image based on the similarity score returned by the server.
	•	Allows toggling the image visibility through a button.

Requirements

	•	Google Chrome (or a Chromium-based browser)
	•	Local Server: A local server running on http://localhost:8080 (you’ll need to start this server manually).
	•	Gemini API Key: Required for authentication when sending data to the Gemini API.

Installation and Setup

Step 1: Load the Extension in Chrome

	1.	Download or clone this repository to your local machine.
	2.	Open Chrome and navigate to chrome://extensions/.
	3.	Enable Developer mode by toggling the switch in the top right corner.
	4.	Click Load unpacked and select the directory containing this project.

Step 2: Add Your Gemini API Key

The extension requires a Gemini API key for certain features to work. You will need to insert your Gemini API key in the extension’s configuration.
	1.	Open the project folder and locate popup.js.
	2.	Add your Gemini API key to the appropriate location in popup.js where the API call is configured.
	3.	Save the file after making this change.

Step 3: Start the Local Server

The extension relies on a local server for processing the extracted data and calculating the similarity score.
	1.	Make sure you have the server code ready (not provided in this repo) and that it listens on http://localhost:8080.
	2.	Start the server.

 Step 4: Use the Extension

	1.	Go to any supported webpage (e.g., LeetCode) where the extension will run.
	2.	The extension will automatically extract content and send it to the local server for processing.
	3.	Based on the similarity score returned, an image will be displayed on the page. You can toggle the image visibility using the Toggle Image button.
