const flashcardsMap = JSON.parse(localStorage.getItem('flashcardsMap'));
console.log(flashcardsMap)

document.addEventListener('DOMContentLoaded', function() {

    const container = document.getElementById('flashcardsContainer');

    if (flashcardsMap) {
        Object.keys(flashcardsMap).forEach((key, index) => {
            const card = flashcardsMap[key];
            const cardElement = document.createElement('div');
            cardElement.className = 'flashcard';

            // Creating English part of the flashcard
            const englishPart = document.createElement('div');
            englishPart.className = 'english flashcard-part';
            englishPart.textContent = card.English;

            // Creating Arabic part of the flashcard
            const arabicPart = document.createElement('div');
            arabicPart.className = 'arabic flashcard-part';
            arabicPart.textContent = card.Arabic;

            // Creating English audio button
            const englishAudioButton = document.createElement('button');
            englishAudioButton.className = 'audio-button';
            englishAudioButton.textContent = '🔊';
            englishAudioButton.onclick = function(event) {
                event.stopPropagation();
                aiSpeakEnglish(card.English);
                console.log("pressed")
            };

            // Creating Arabic audio button
            const arabicAudioButton = document.createElement('button');
            arabicAudioButton.className = 'audio-button';
            arabicAudioButton.textContent = '🔊';
            arabicAudioButton.onclick = function(event) {
                event.stopPropagation();
                aiSpeakArabic(card.Arabic);
            };

            // Appending parts to the flashcard element
            cardElement.appendChild(englishPart);
            cardElement.appendChild(englishAudioButton);
            cardElement.appendChild(arabicPart);
            cardElement.appendChild(arabicAudioButton);

            container.appendChild(cardElement);
        });
    } else {
        container.innerHTML = "<p>No flashcards to display.</p>";
    }
});

function openQuestionWindow(text) {
    const modal = document.getElementById('questionModal');
    const questionText = document.getElementById('questionText');
    questionText.textContent = text;
    modal.style.display = 'block';
}

function submitQuestion() {
    const input = document.getElementById('responseInput');
    const aiResponse = document.getElementById('aiResponse');
    const question = input.value.trim();

    if (!question) {
        alert('Please enter a question.');
        return;
    }

    // Here you would integrate your API call for AI response
    aiResponse.textContent = "Simulated response for: " + question;
    input.value = ''; // Clear the input after submission
}

function showFlashcards() {
    console.log("Showing flashcards");
    // Add logic to display flashcards
}

function showMatching() {
    console.log("Showing matching game");
    // Add logic to display matching game
}

function showConversation() {

    let flashcardsString = ""
    let index = 1
    while(flashcardsMap[index]){
        flashcardsString += flashcardsMap[index].English + " " + flashcardsMap[index].Arabic + "\n"
        index++
    }
    console.log("Flashcards: ", flashcardsString)

    var topic = "I need to practice these flashcards, help me by starting a conversation with me and tie all of these flashcards into the conversation to help me practice, dont waste too much time and make sure to use every word: " + flashcardsString;
    let currentCharacter = "Amir"
    console.log(currentCharacter); // Log the current character to verify

    // Create the redirection URL with both the current character and the topic as query parameters
    var newUrl = '../../Characters/Conversation/conversation.html' +
                 '?character=' + encodeURIComponent(currentCharacter) +
                 '&topic=' + encodeURIComponent(topic);

    // Redirect to the new URL
    window.location.href = newUrl;
}


function aiSpeakArabic(text) {
    fetch('http://localhost:3000/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, character: "Ayah"})
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    })
    .catch(error => console.error('Error playing the response:', error));
}

function aiSpeakEnglish(text) {
    fetch('http://localhost:3000/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text, character: "William"})
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
    })
    .catch(error => console.error('Error playing the response:', error));
}

function playCurrentAudio() {
    const modalEnglish = document.getElementById('modalEnglish');
    const modalArabic = document.getElementById('modalArabic');

    // Check which part is currently visible and play the respective audio
    if (modalEnglish.style.display !== 'none') {
        aiSpeakEnglish(modalEnglish.textContent);
    } else {
        aiSpeakArabic(modalArabic.textContent);
    }
}



function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}


let questions = []; // Global array to hold shuffled questions
let questionIndex = 0; // Global index to track the current question

function showMatching() {
    const modal = document.getElementById('matchingModal');
    const randomWordElement = document.getElementById('randomWord');
    const questionNumberElement = document.getElementById('questionNumber');
    const optionsContainer = document.querySelector('.modal-content .options-container') || createOptionsContainer();

    if (!questions.length) { // Only shuffle and set up questions if not already done
        const keys = Object.keys(flashcardsMap);
        questions = keys.map(key => flashcardsMap[key]);
        shuffle(questions);
    }

    const useEnglish = Math.random() > 0.5;
    const question = questions[questionIndex];
    randomWordElement.textContent = useEnglish ? question.English : question.Arabic;

    // Update the question number display
    questionNumberElement.textContent = "Question " + (questionIndex + 1);

    setupOptions(useEnglish, question, optionsContainer);

    modal.style.display = 'block'; // Show the modal
    console.log("Question " + (questionIndex + 1) + " Opened");
}


function createOptionsContainer() {
    const container = document.createElement('div');
    container.className = 'options-container';
    document.querySelector('.modal-content').appendChild(container);
    return container;
}

function setupOptions(useEnglish, question, optionsContainer) {
    optionsContainer.innerHTML = ''; // Clear previous options

    let options = generateOptions(useEnglish, question);
    const correctAnswer = useEnglish ? question.Arabic : question.English;
    let replaceIndex = Math.floor(Math.random() * options.length);

    options.forEach((value, index) => {
        if (value == correctAnswer){
            replaceIndex = index
        }
    })
    options[replaceIndex] = correctAnswer; // Ensure correct answer is in the options

    options.forEach((option, index) => {
        const optionButton = document.createElement('div');
        optionButton.className = 'option-button';
        optionButton.textContent = option;
        optionButton.onclick = () => handleOptionClick(option, correctAnswer, optionButton); // Pass the optionButton here
        optionsContainer.appendChild(optionButton);
    });

    console.log("Option " + (replaceIndex + 1) + " is the correct answer");
}


function generateOptions(useEnglish, question) {
    let options = [];
    while (options.length < 4) {
        const optionIndex = Math.floor(Math.random() * questions.length);
        const optionQuestion = questions[optionIndex];
        let optionText = useEnglish ? optionQuestion.Arabic : optionQuestion.English;
        if (!options.includes(optionText) && optionText !== (useEnglish ? question.English : question.Arabic)) {
            options.push(optionText);
        }
    }
    return options;
}

function handleOptionClick(selectedOption, correctAnswer, optionButton) {
    if (selectedOption === correctAnswer) {
        questionIndex++; // Move to the next question
        if (questionIndex < questions.length) {
            showMatching(); // Reload the matching function to update the question
        } else {
            closeMatchingModal(); // Close the modal if no more questions
        }
    } else {
        optionButton.style.backgroundColor = 'red'; // Change button color to red on wrong answer
        optionButton.style.color = 'white'; // Change text color to white for better visibility
    }
}




function closeMatchingModal() {
    const modal = document.getElementById('matchingModal');
    modal.style.display = 'none'; // Hide the modal
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}





// Function to show flashcards modal
function showFlashcards() {
    const modal = document.getElementById('flashcardsModal');
    const flashcardsContainer = document.getElementById('flashcardsContainer');

    // Assuming you have at least one flashcard
    if (flashcardsMap && Object.keys(flashcardsMap).length > 0) {
        updateFlashcard(0); // Start by showing the first flashcard
    }
    modal.style.display = 'block'; // Show the modal
}

// Function to update flashcard content in the modal
function updateFlashcard(index) {
    const card = flashcardsMap[Object.keys(flashcardsMap)[index]];
    const modalEnglish = document.getElementById('modalEnglish');
    const modalArabic = document.getElementById('modalArabic');
    
    modalEnglish.textContent = card.English;
    modalArabic.textContent = card.Arabic;

    // Always show English and hide Arabic when a new card is loaded
    modalEnglish.style.display = 'block';
    modalArabic.style.display = 'none'; 

    // Toggle behavior to replace English with Arabic
    const flashcardElement = document.getElementById('modal-flashcard');
    flashcardElement.onclick = function() {
        if (modalEnglish.style.display !== 'none') {
            modalEnglish.style.display = 'none';
            modalArabic.style.display = 'block';
        } else {
            modalEnglish.style.display = 'block';
            modalArabic.style.display = 'none';
        }
    };

    document.getElementById('flashcardIndex').textContent = `Card ${index + 1} of ${Object.keys(flashcardsMap).length}`;
    currentFlashcardIndex = index; // Update the current index globally
}

// Navigation functions for flashcards
function nextFlashcard() {
    const newIndex = currentFlashcardIndex + 1;
    if (newIndex < Object.keys(flashcardsMap).length) {
        document.getElementById('modalEnglish').style.display = 'block'; // Reset display settings when navigating
        document.getElementById('modalArabic').style.display = 'none';   // Reset display settings when navigating
        updateFlashcard(newIndex);
    }
}

function previousFlashcard() {
    const newIndex = currentFlashcardIndex - 1;
    if (newIndex >= 0) {
        document.getElementById('modalEnglish').style.display = 'block'; // Reset display settings when navigating
        document.getElementById('modalArabic').style.display = 'none';   // Reset display settings when navigating
        updateFlashcard(newIndex);
    }
}

function closeFlashcards() {
    const modal = document.getElementById('flashcardsModal');
    modal.style.display = 'none';
}

let currentFlashcardIndex = 0; // Keep track of the current flashcard index
