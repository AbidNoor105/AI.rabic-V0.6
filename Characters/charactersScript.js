var currentCharacter = "";  // Global variable to store the character name

// Fetching character information
fetch('info.json')
    .then(response => response.json())
    .then(data => {
        window.characters = data;
        console.log(window.charactersInfo); // Now it will log correctly
    })
    .catch(error => console.error('Error loading the JSON file:', error));

function openModal(characterName) {
    currentCharacter = characterName;

    const character = window.characters[characterName];
    const modal = document.getElementById('characterModal');
    const img = document.getElementById('characterImage');
    const desc = document.getElementById('characterDescription');

    img.src = `Conversation/characterMedia/${character.name}.png`;  
    img.alt = characterName;
    desc.innerHTML = character.description;
    
    modal.style.display = 'block';
}


document.addEventListener('DOMContentLoaded', function() {
    fetch('info.json')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('characterButtonsContainer');
            for (let key in data) {
                const character = data[key];
                container.appendChild(createCharacterButton(character));
            }
        })
        .catch(error => console.error('Error loading the JSON file:', error));
});

function createCharacterButton(character) {
    // Create elements
    const buttonDiv = document.createElement('div');
    const img = document.createElement('img');
    const label = document.createElement('div');

    // Set attributes and content
    buttonDiv.className = 'image-button';
    img.src = `Conversation/characterMedia/${character.name}.png`; // Assuming image naming convention
    img.alt = character.name;
    label.className = 'button-label';
    label.textContent = character.name;

    // Append elements
    buttonDiv.appendChild(img);
    buttonDiv.appendChild(label);

    // Add event listener for modal popup
    buttonDiv.onclick = function() {
        openModal(character.name);
    };

    return buttonDiv;
}

function startTalking() {
    var topic = document.getElementById('topicInput').value;
    console.log(currentCharacter); // Log the current character to verify

    // Create the redirection URL with both the current character and the topic as query parameters
    var newUrl = 'Conversation/conversation.html' +
                 '?character=' + encodeURIComponent(currentCharacter) +
                 '&topic=' + encodeURIComponent(topic);

    // Redirect to the new URL
    window.location.href = newUrl;
}


// Close modal when clicking outside of it
window.onclick = function(event) {
    var modal = document.getElementById('characterModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
