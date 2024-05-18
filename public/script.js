console.log('Caricamento script.js versione 1.0');

document.addEventListener("DOMContentLoaded", function () {
    const imageInput = document.getElementById("imageFile");
    const dragArea = document.querySelector(".drag-area");
    const form = document.getElementById("plantForm");
    const clearStorageButton = document.getElementById("clearStorage");
    const enableNotificationsButton = document.getElementById("enableNotifications");

    // Funzione per caricare risposte salvate
    function loadSavedResponses() {
        const responseList = document.getElementById('responseList');
        responseList.innerHTML = ''; // Pulisci la lista delle risposte
        let savedResponses = [];
        try {
            const storedResponses = localStorage.getItem('responses');
            if (storedResponses) {
                savedResponses = JSON.parse(storedResponses) || [];
            }
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
                const storedResponses = localStorage.getItem('responses');
                if (storedResponses) {
                    savedResponses = JSON.parse(storedResponses) || [];
                }
            } catch (e) {
                console.error("Error parsing JSON from localStorage:", e);
            }
            savedResponses.unshift(data);
                  localStorage.setItem('responses', JSON.stringify(savedResponses));
        }

        // Estrarre il numero di giorni dall'elemento di annaffiatura e convertire in secondi per i test
        const wateringMatch = data.watering.match(/(\d+)/);
        if (wateringMatch) {
            const wateringDays = parseInt(wateringMatch[0], 10);
            const wateringSeconds = wateringDays * 1; // Convertire giorni in secondi per i test
            scheduleWateringNotification(data.plantName, wateringSeconds);
        }
    }

    // Funzione per pianificare notifiche
    function scheduleWateringNotification(plantName, seconds) {
        const millisecondsPerSecond = 1000;
        const wateringTime = seconds * millisecondsPerSecond;

        setTimeout(() => {
            notifyUser(plantName);

            setInterval(() => {
                notifyUser(plantName);
            }, wateringTime);
        }, wateringTime);
    }

    // Funzione per inviare notifiche
    function notifyUser(plantName) {
        if (Notification.permission === "granted") {
            new Notification(`È ora di annaffiare la tua pianta: ${plantName}`);
        } else {
            requestNotificationPermission();
        }
    }

    // Funzione per richiedere il permesso di notifica
    function requestNotificationPermission() {
        if (Notification.permission === "default" || Notification.permission === "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Permesso per le notifiche concesso");
                } else {
                    console.log("Permesso per le notifiche negato");
                }
            });
        } else {
            console.log("Permesso per le notifiche già concesso");
        }
    }

    // Richiedere il permesso per le notifiche al caricamento della pagina
    enableNotificationsButton.addEventListener("click", function () {
        requestNotificationPermission();
    });

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

                     // Rimuove il messaggio di errore dopo 5 secondi
                     setTimeout(() => {
                        errorMessage.remove();
                    }, 5000); // 5000 millisecondi = 5 secondi

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
