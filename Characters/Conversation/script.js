const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognizer = new speechRecognition();
recognizer.interimResults = false;

//listener for push to talk button
document.getElementById('talk-btn').addEventListener('click', () => {
    const isEnglish = document.getElementById('lang-toggle').checked;
    recognizer.lang = isEnglish ? 'en-US' : 'ar'; // 'en-US' for English, 'ar' for Arabic
    recognizer.start();
});

const urlParams = new URLSearchParams(window.location.search);
const thisCharacter = urlParams.get('character');
const topic = urlParams.get('topic');

console.log('Character:', thisCharacter);
console.log('Topic:', topic);

//Onmount
document.addEventListener('DOMContentLoaded', function() {
    // Example of automatically starting a conversation about a default topic
    initiateConversation();
});

function initiateConversation(initialMessage) {
    fetch('http://localhost:3000/get-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: "Hey" + topic, character: thisCharacter })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error from server:', data.error);
        } else {
            addChatBubble(data.message, 'ai');
            aiSpeak(data.message);
        }
    })
    .catch(error => console.error('Error getting response from AI:', error));
}

//runs when talk button is pressed
recognizer.onresult = function(event) {
    const transcript = event.results[0][0].transcript;
    addChatBubble(transcript, 'user');

    fetch('http://localhost:3000/get-response', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: transcript, character: thisCharacter }) //this is where input goes
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error from server:', data.error);
        } else {
            addChatBubble(data.message, 'ai'); //output
            aiSpeak(data.message); // Automatically speak the AI response
        }
    })
    .catch(error => console.error('Error getting response from AI:', error));
};

recognizer.onspeechend = function() {
    recognizer.stop();
};

recognizer.onerror = function(event) {
    console.error('Speech recognition error:', event.error);
};

function addChatBubble(text, sender, translation = null) {
    const bubble = document.createElement('div');
    bubble.classList.add('chat-bubble', sender);
    bubble.textContent = text;

    bubble.style.cursor = 'pointer';  // Change cursor to indicate clickability
    bubble.onclick = function() {
        openQuestionWindow(text);  // Function to handle the click event
    }

    if (translation) {
        bubble.setAttribute('data-translation', translation); // Storing translation as a data attribute
    }

    document.getElementById('chat-container').appendChild(bubble);
    document.getElementById('chat-container').scrollTop = document.getElementById('chat-container').scrollHeight;
}

document.getElementById('how-do-i-say-btn').addEventListener('click', function() {
    showModal('howDoISayModal');
});

function submitHowDoISay() {
    var input = document.getElementById('howDoISayInput').value.trim();
    var responseElement = document.getElementById('aiResponseHowDoISay');
    var speakButton = document.getElementById('speakButton');
    if (input) {
        console.log("Submitted phrase:", input);

        fetch('http://localhost:3000/how-do-I-say', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ question: input })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error('Error from server:', data.error);
                responseElement.textContent = 'Error: ' + data.error;
                speakButton.style.display = 'none'; // Hide speak button if there's an error
            } else {
                responseElement.textContent = data.message;
                speakButton.style.display = 'inline-block'; // Show speak button when there's valid text
            }
        })
        .catch(error => {
            console.error('Error getting response from AI:', error);
            responseElement.textContent = 'Error getting response from AI.';
            speakButton.style.display = 'none';
        });
    } else {
        alert("Please enter a phrase.");
        speakButton.style.display = 'none';
    }
}

function speakCurrentText() {
    var text = document.getElementById('aiResponseHowDoISay').textContent;
    if (text) {
        aiSpeak(text);
    }
}

function showModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = 'block';
}

function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    var modal = document.getElementById('howDoISayModal');
    if (event.target == modal) {
        closeModal('howDoISayModal');
    }
}



function openQuestionWindow(text) {
    const modal = document.getElementById('questionModal');
    const questionText = document.getElementById('questionText');
    questionText.innerHTML = ''; // Clear previous content

    // Split the text into words
    const words = text.split(' ');

    words.forEach(word => {

        // Determine if the text is Arabic
        const isArabic = /[\u0600-\u06FF]/.test(text);

        // Set the direction based on whether the text is Arabic
        const dir = isArabic ? 'rtl' : 'ltr';
        questionText.setAttribute('dir', dir);
    
        let cleanWord = "";
        // Filter out punctuation from each word
        for (let char of word) {
            if (!['?', '.', ',', ';', '!', '؟', "،"].includes(char)) {
                cleanWord += char;
            }
        }

        if (cleanWord.length > 0) { // Only create a span if the word is not empty after removing punctuation
            const wordSpan = document.createElement('span');
            wordSpan.textContent = cleanWord;
            wordSpan.className = 'tooltip'; // Assign class for tooltip styling
            wordSpan.style.cursor = 'pointer'; // Cursor style

            // Create a tooltip text element
            const tooltipText = document.createElement('span');
            tooltipText.className = 'tooltiptext';
            tooltipText.textContent = ''; // Initial text indicating loading

            // Append the tooltip text to the word span
            wordSpan.appendChild(tooltipText);

            // Event listener to fetch translation on hover
            wordSpan.onmouseover = function() {
                fetch('http://localhost:3000/translate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: cleanWord, targetLanguageCode: isArabic ? "en" : "ar", sourceLanguageCode: isArabic ? "ar" : "en" })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error from server:', data.error);
                        tooltipText.textContent = 'Translation unavailable'; // Display error message in tooltip
                    } else {
                        tooltipText.textContent = data.message; // Update tooltip with translated text
                    }
                })
                .catch(error => {
                    console.error('Error getting response from AI:', error);
                    tooltipText.textContent = 'Translation failed'; // Display error message in tooltip
                });
            };

            questionText.appendChild(wordSpan);
            questionText.appendChild(document.createTextNode(' ')); // Add space between words
        }
    });

    modal.style.display = 'block'; // Display the modal
}








document.getElementsByClassName('close')[0].onclick = function() {
    document.getElementById('questionModal').style.display = "none";
}

function submitQuestion() {
    const input = document.getElementById('responseInput');
    const aiResponse = document.getElementById('aiResponse');
    const question = input.value.trim();
    const contextText = document.getElementById('questionText').textContent;  // The AI-generated sentence

    if (!question) {
        alert('Please enter a question.');
        return;
    }

    fetch('http://localhost:3000/ask-gemini', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            question: question,
            context: contextText // Optionally pass the original AI-generated text for context
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error from server:', data.error);
            aiResponse.textContent = 'Error getting response from AI.';
        } else {
            aiResponse.textContent = data.message; // Display Gemini's response
        }
    })
    .catch(error => {
        console.error('Error getting response:', error);
        aiResponse.textContent = 'Failed to communicate with AI.';
    });

    // Clear the input field after submission
    input.value = '';
}

//translates from arabic to english
document.getElementById('translate').addEventListener('click', () => {
    console.log("Translate button pressed")

    const bubbles = document.querySelectorAll('.ai');
    if (bubbles.length === 0) {
        alert('No messages to translate.');
        return;
    }
    const lastAIBubble = bubbles[bubbles.length - 1];
    const textToBeTranslated = lastAIBubble.textContent;

    fetch('http://localhost:3000/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToBeTranslated, targetLanguageCode: 'en', sourceLanguageCode: 'ar' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error from server:', data.error);
        } else {
            addChatBubble(data.message, 'ai'); // Show translation as another AI bubble
        }
    })
    .catch(error => console.error('Error getting response from AI:', error));
});

//function to speak text
function aiSpeak(text) {
    fetch('http://localhost:3000/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, character: thisCharacter})
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    })
    .catch(error => console.error('Error playing the response:', error));
}