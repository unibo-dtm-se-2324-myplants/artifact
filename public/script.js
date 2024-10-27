// Evento principale: inizializzazione al caricamento del DOM (Document Object Model) prmettedi interagire e modificare il contenuto, la struttura e lo stile di una pagina web
document.addEventListener("DOMContentLoaded", function () {
    // Riferimenti agli elementi HTML principali
    const imageInput = document.getElementById("imageFile");
    const dragArea = document.querySelector(".drag-area");
    const form = document.getElementById("plantForm");
    const clearStorageButton = document.getElementById("clearStorage");
    const enableNotificationsButton = document.getElementById("enableNotifications");

    // Funzione per caricare le risposte salvate in localStorage e mostrarle nel DOM
    function loadSavedResponses() {
        const responseList = document.getElementById('responseList');
        responseList.innerHTML = ''; // Pulisce la lista delle risposte
        let savedResponses = [];
        try {
            const storedResponses = localStorage.getItem('responses');
            if (storedResponses) {
                savedResponses = JSON.parse(storedResponses) || []; // Recupera e analizza i dati da localStorage
            }
        } catch (e) {
            console.error("Error parsing JSON from localStorage:", e);
        }
        // Inverte l'ordine delle risposte e le visualizza
        savedResponses.reverse().forEach(data => addResponse(data, false));
    }
    
    // Aggiunge una risposta alla pagina e la salva opzionalmente in localStorage
    function addResponse(data, save = true) {
        const responseBox = document.createElement('div');
        responseBox.className = 'response-box';

        // Aggiunge l'immagine della pianta alla risposta
        const imageEl = document.createElement('img');
        imageEl.src = data.imageSrc;
        imageEl.className = 'response-image';
        imageEl.alt = 'Uploaded plant image';

        responseBox.appendChild(imageEl);
        
        // Verifica se l'immagine contiene una pianta e aggiunge informazioni sulla pianta
        if (data.isPlant) {
            responseBox.innerHTML += `
                <div class="response-section"><b>Nome:</b> ${data.commonName}</div>
                <div class="response-section"><b>Nome scientifico:</b> ${data.scientificName}</div>
                <div class="response-section"><b>Annaffiala ogni:</b> ${data.wateringFrequency} giorni</div>
                <div class="response-section"><b>Descrizione:</b> ${data.description}</div>
                <div class="response-section"><b>Istruzioni di cura:</b> ${data.careInstructions}</div>
            `;
        } else {
            // Messaggio se l'immagine non contiene una pianta
            responseBox.innerHTML += `
                <div class="response-section">Nessuna pianta individuata nell'immagine.</div>
            `;
        }

        const responseList = document.getElementById('responseList');
        responseList.insertBefore(responseBox, responseList.firstChild); // Inserisce la nuova risposta in cima

        // Salvataggio opzionale della risposta in localStorage
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
            savedResponses.unshift(data); // Aggiunge la nuova risposta all'inizio dell'array
                  localStorage.setItem('responses', JSON.stringify(savedResponses)); // Aggiorna localStorage
        }

        // Pianifica una notifica per l'irrigazione se l'immagine contiene una pianta
        if (data.isPlant) {
            scheduleWateringNotification(data.commonName || data.scientificName, parseInt(data.wateringFrequency, 10), data.imageSrc);
        }
    }

    // Funzione per pianificare le notifiche desktop per ricordare l'irrigazione
    function scheduleWateringNotification(plantName, days, imageSrc) {
        if (!('Notification' in window)) {
            console.log('Questo browser non supporta le notifiche desktop');
            return;
        }

        // Richiede il permesso per le notifiche se non è già stato concesso
        if (Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notifiche attivate');
                    scheduleNotification(plantName, days, imageSrc);
                }
            });
        } else {
            scheduleNotification(plantName, days, imageSrc);
        }
    }

    // Funzione per calcolare e pianificare il tempo delle notifiche

    // Giorni
    function scheduleNotification(plantName, days, imageSrc) {
        const millisecondsPerDay = 24 * 60 * 60 * 1000; // Converte i giorni in millisecondi
        const wateringTime = days * millisecondsPerDay;

    // Secondi (per testare le notifiche)
/* 
        function scheduleNotification(plantName, days, imageSrc) {
            const millisecondsPerSecond = 1000; // Un secondo = 1000 millisecondi
            const wateringTime = days * millisecondsPerSecond; // Ora i "days" sono considerati secondi
 */

             // Memorizza le notifiche programmate in localStorage
            const notifications = JSON.parse(localStorage.getItem('plantNotifications') || '[]');
        notifications.push({
            plantName: plantName,
            nextNotification: Date.now() + wateringTime,
            wateringFrequency: days,
            imageSrc: imageSrc
        });
        localStorage.setItem('plantNotifications', JSON.stringify(notifications));
        
        // Pianifica l'esecuzione della notifica
        setTimeout(() => {
            notifyUser(plantName, imageSrc);
            scheduleNextNotification(plantName, wateringTime);
        }, wateringTime);
    }
    // Funzione per pianificare le notifiche successive
    function scheduleNextNotification(plantName, interval) {
        const notifications = JSON.parse(localStorage.getItem('plantNotifications') || '[]');
        const plantIndex = notifications.findIndex(n => n.plantName === plantName);

        if (plantIndex !== -1) {
            notifications[plantIndex].nextNotification = Date.now() + interval;
            localStorage.setItem('plantNotifications', JSON.stringify(notifications));

            setTimeout(() => {
                notifyUser(plantName, notifications[plantIndex].imageSrc);
                scheduleNextNotification(plantName, interval);
            }, interval);
        }
    }
    
    // Funzione per mostrare la notifica all'utente
    function notifyUser(plantName, imageSrc) {
        if (Notification.permission === "granted") {
            new Notification(`È ora di annaffiare la tua pianta: ${plantName}`, {
                body: `Non dimenticare di annaffiare la tua pianta!`,
                icon: imageSrc
            });
        }
    }
    
    // Verifica e attiva le notifiche pendenti se è il momento
    function checkNotifications() {
        const notifications = JSON.parse(localStorage.getItem('plantNotifications') || '[]');
        const now = Date.now();

        notifications.forEach(notification => {
            if (now >= notification.nextNotification) {
                notifyUser(notification.plantName, notification.imageSrc);
                scheduleNextNotification(notification.plantName, notification.wateringFrequency * 24 * 60 * 60 * 1000);
            } else {
                const delay = notification.nextNotification - now;
                setTimeout(() => {
                    notifyUser(notification.plantName, notification.imageSrc);
                    scheduleNextNotification(notification.plantName, notification.wateringFrequency * 24 * 60 * 60 * 1000);
                }, delay);
            }
        });
    }
    
    // Inizializza caricamento risposte e controllo delle notifiche
    loadSavedResponses();
    checkNotifications();
   
    // Gestione del pulsante per svuotare la memoria
    clearStorageButton.addEventListener("click", function () {
        if (confirm("Sei sicuro di voler svuotare la memoria?")) {
            localStorage.clear();
            const responseList = document.getElementById('responseList');
            responseList.innerHTML = '';
            console.log("Tutte le risposte sono state cancellate.");
        }
    });
   
    // Richiede il permesso di attivare le notifiche
    enableNotificationsButton.addEventListener("click", function () {
        requestNotificationPermission();
    });

    function requestNotificationPermission() {
        if (Notification.permission !== "granted") {
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

    // Gestione drag-and-drop e anteprima dell'immagine
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
        dragArea.querySelector(".drag-text").textContent = "..";
        dragArea.classList.remove("active");
        displayThumbnail(event.dataTransfer.files[0]);
    });
   
    // Anteprima dell'immagine selezionata
    imageInput.addEventListener("change", (event) => {
        if (imageInput.files.length > 0) {
            dragArea.querySelector(".drag-text").textContent = ".";
            displayThumbnail(event.target.files[0]);
        }
    });

    function displayThumbnail(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imageDisplay = document.getElementById('thumb');
            imageDisplay.src = e.target.result;
            imageDisplay.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
   
    // Invio del form con l'immagine e la posizione
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const formData = new FormData();
        const location = document.querySelector('input[name="location"]:checked').value;
        const file = imageInput.files[0];

        if (!file) {
            alert('Per favore seleziona un file immagine.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const imageBase64 = e.target.result;
            formData.append('location', location);
            formData.append('image', file);

        document.getElementById('loader').classList.remove('hidden');
        document.getElementById('invia').style.display = "none";
           
        // Invio dell'immagine al server
            fetch('/submit', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('invia').style.display = "block";
               
                // Gestione della risposta: mostra errore o aggiunge i dati della pianta
                if (!data.isPlant) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'error-message';
                    errorMessage.textContent = "Nessuna pianta individuata, riprova";
                    const responseList = document.getElementById('responseList');
                    responseList.insertBefore(errorMessage, responseList.firstChild);

                    setTimeout(() => {
                        errorMessage.remove();
                    }, 5000);
                } else {
                    const responseData = {
                        imageSrc: imageBase64,
                        ...data
                    };

                    addResponse(responseData);
                }
        
                form.reset();
                document.getElementById('thumb').src = '';
                document.getElementById('thumb').style.display = 'none';
                const dragText = dragArea.querySelector(".drag-text");
                dragText.innerHTML = "Trascina qui un'immagine<br>o<br>clicca per selezionarla";
            })
            .catch(error => {
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('invia').style.display = "block";
                console.error('Error:', error);
                alert('Si è verificato un errore durante l\'elaborazione dell\'immagine. Per favore riprova.');
            });
    };

        reader.readAsDataURL(file);
    });
});