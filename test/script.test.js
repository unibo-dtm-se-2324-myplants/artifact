// Check if key elements are present in the DOM
test('check if key elements are present in the DOM', () => {
    // Set up the DOM
    document.body.innerHTML = `
        <form id="plantForm">
            <input type="file" id="imageFile" />
            <div class="drag-area">
                <div class="drag-text">Trascina qui un'immagine o clicca per selezionarla</div>
            </div>
            <button type="submit" id="invia">Invia</button>
        </form>
        <div id="responseList"></div>
        <button id="clearStorage">Clear Storage</button>
        <button id="enableNotifications">Enable Notifications</button>
        <img id="thumb" style="display:none;" />
        <div id="loader" class="hidden"></div>
    `;

    // Simulate DOMContentLoaded event
    document.dispatchEvent(new Event('DOMContentLoaded'));

    // Define the expected elements
    const expectedElements = [
        "imageFile", "plantForm", "responseList", "clearStorage",
        "enableNotifications", "thumb", "loader"
    ];

    // Check if all expected elements are present
    expectedElements.forEach(elementId => {
        expect(document.getElementById(elementId)).not.toBeNull();
    });

    // Additional checks for specific properties
    expect(document.getElementById("thumb").style.display).toBe("none");
    expect(document.getElementById("loader").classList.contains("hidden")).toBe(true);
});
