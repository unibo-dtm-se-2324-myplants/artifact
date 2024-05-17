document.addEventListener("DOMContentLoaded", function () {
    const imageInput = document.getElementById("imageFile");
    const dragArea = document.querySelector(".drag-area");
    const form = document.getElementById("plantForm");
    const clearStorageButton = document.getElementById("clearStorage");

    // Funzione per caricare risposte salvate
    function loadSavedResponses() {
        const responseList = document.getElementById('responseList');
        responseList.innerHTML = ''; // Pulisci la lista delle risposte
        let savedResponses = [];
        try {
            savedResponses = JSON.parse(localStorage.getItem('responses')) || [];
        } catch (e) {
            console.error("Error parsing JSON from localStorage:", e);
        }
        savedResponses.reverse().forEach(data => addResponse(data, false)); // Inverti l'array delle risposte
    }
    // Funzione per aggiungere una risposta al DOM e opzionalmente salvarla in localStorage
    function addResponse(data, save = true) {
        const responseBox = document.createElement('div');
        responseBox.className = 'response-box';

        const imageEl = document.createElement('img');
        imageEl.src = data.imageSrc;
        imageEl.className = 'response-image';
        imageEl.alt = 'Uploaded plant image';

        responseBox.appendChild(imageEl);
        responseBox.innerHTML += `
            <div class="response-section">${data.plantName}</div>
            <div class="response-section">${data.watering}</div>
            <div class="response-section">${data.description}</div>
        `;

        const responseList = document.getElementById('responseList');
        responseList.insertBefore(responseBox, responseList.firstChild);

        if (save) {
            let savedResponses = [];
            try {
                savedResponses = JSON.parse(localStorage.getItem('responses')) || [];
            } catch (e) {
                console.error("Error parsing JSON from localStorage:", e);
            }
            savedResponses.unshift(data);
                  localStorage.setItem('responses', JSON.stringify(savedResponses));
        }
    }

    // Carica le risposte salvate al caricamento della pagina
    loadSavedResponses();
    // Gestore per svuotare la memoria locale
    clearStorageButton.addEventListener("click", function () {
        localStorage.clear();
        const responseList = document.getElementById('responseList');
        responseList.innerHTML = ''; // Pulisci la lista delle risposte dal DOM
    });

    dragArea.addEventListener("click", () => imageInput.click());

    dragArea.addEventListener("dragover", (event) => {
        event.preventDefault();
        dragArea.classList.add("active");
        dragArea.querySelector(".drag-text").textContent = "Rilascia per caricare l'immagine";
    });

    dragArea.addEventListener("dragleave", () => {
        dragArea.classList.remove("active");
        dragArea.querySelector(".drag-text").textContent = "Trascina qui un'immagine o clicca per selezionarla";
    });

    dragArea.addEventListener("drop", (event) => {
        event.preventDefault();
        imageInput.files = event.dataTransfer.files;
        dragArea.querySelector(".drag-text").textContent = `..`;
        dragArea.classList.remove("active");
    });

    imageInput.addEventListener("change", () => {
        if (imageInput.files.length > 0) {
            dragArea.querySelector(".drag-text").textContent = `.`;
        }
    });

    document.getElementById('imageFile').addEventListener('change', function (event) {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const imageDisplay = document.getElementById('thumb');
            imageDisplay.src = e.target.result;
        }

        reader.readAsDataURL(file);
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData();
        const location = document.querySelector('input[name="location"]:checked').value;
        const file = imageInput.files[0];

        if (!file) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const imageBase64 = e.target.result;
            formData.append('location', location);
            formData.append('image', file);

        document.getElementById('loader').classList.remove('hidden');
        document.getElementById('invia').style.display = "none";

        fetch('/submit', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('invia').style.display = "block";

                // Controlla se il contenuto della risposta è 'error404'
                if (data.message.content === "error404") {
                    // Mostra un messaggio di errore se l'immagine non è riconosciuta come una pianta
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = "Nessuna pianta individuata, riprova";
                    const responseList = document.getElementById('responseList');
                    responseList.insertBefore(errorMessage, responseList.firstChild);
                } else if (data.message && typeof data.message.content === 'string') {
                    const formattedContent = data.message.content.replace(/<br>/g, '');
                    const parts = formattedContent.split(' - ');

                    const plantName = parts[0] ? parts[0] : '';
                    const watering = parts[1] ? parts[1] : '';
                    const description = parts[2] ? parts[2] : '';

                    const responseData = {
                        imageSrc: imageBase64,
                        plantName: plantName,
                        watering: watering,
                        description: description
                    };

                    addResponse(responseData);
                } else {
                    console.error('Invalid response format');
                }

                // Reset the form
                form.reset();
                document.getElementById('thumb').src = '';
                const dragText = dragArea.querySelector(".drag-text");
                dragText.innerHTML = "Trascina qui un'immagine<br>o<br>clicca per selezionarla";
            })
            .catch(error => {
                document.getElementById('loader').classList.add('hidden');
                console.error('Error:', error);
            });
        }

        reader.readAsDataURL(file);
    });
});