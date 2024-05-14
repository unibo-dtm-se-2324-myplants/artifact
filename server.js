const express = require('express');
const { OpenAI } = require('openai');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();


const app = express();
const port = 3000;

// Setup multer per il memory storage e per gestire gli uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));
app.use(express.json());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/submit', upload.single('image'), async (req, res) => {
    console.log('Received request with location:', req.body.location);

    if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
    }

    // Convertire immagine in base64
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataUri = `data:${mimeType};base64,${imageBase64}`;

    try {
        const { location } = req.body;
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "dammi il nome scientifico della pianta che vedi, rispetta quest'ordine di formattazione nella risposta ( <b>Nome pianta:</b> x <br> - <br> <b>Annaffiala ogni:</b> x giorni <br> - <br>  <b>Descrizione:</b> x). Se l'immagine non è una pianta rispondi solo con: error404. Rispetta la formattazione che ti ho chiesto sostituendo le 'x' e restituiscimi il numero di giorni con un solo valore intero sapendo che la pianta è posizionata " + location },
                        { type: "image_url", image_url: { url: dataUri } }
                    ]
                }
            ]
        });

        console.log('Response from OpenAI:', response);
        console.log('Message from OpenAI:', response.choices[0].message);

        res.json({ message: response.choices[0].message });
    } catch (error) {
        console.error('Error fetching response from OpenAI:', error);
        res.status(500).json({ error: 'Error in fetching response', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
