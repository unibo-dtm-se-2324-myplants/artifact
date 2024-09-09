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
                        { type: "text", text: `Analizza l'immagine della pianta e fornisci le seguenti informazioni in formato JSON:
                            {
                                "commonName": "Assegna un nome casule a tuo piacimento tipo: Mariolina, Giovanna, Ippolita. Ma non questi",
                                "scientificName": "Nome scientifico della pianta",
                                "wateringFrequency": "Numero di giorni tra le annaffiature",
                                "description": "Breve descrizione della pianta",
                                "careInstructions": "Istruzioni per la cura della pianta",
                                "isPlant": true/false
                            }
                            Se l'immagine non è di una pianta, imposta isPlant su false e lascia vuoti gli altri campi. La pianta è posizionata ${location}. Fornisci solo il JSON senza altri commenti o formattazione.` },
                            { type: "image_url", image_url: { url: dataUri } }
                        ]
                    }
                ],
                max_tokens: 4000
        });

        console.log('Response from OpenAI:', response);
        console.log('Message from OpenAI:', response.choices[0].message);

          
        let parsedResponse;
        try {
            const cleanedContent = response.choices[0].message.content.replace(/```json\s*|\s*```/g, '').trim();
            parsedResponse = JSON.parse(cleanedContent);

            // Assicuriamoci che wateringFrequency sia un numero
            if (parsedResponse.isPlant && parsedResponse.wateringFrequency) {
                parsedResponse.wateringFrequency = parseInt(parsedResponse.wateringFrequency, 10);
                if (isNaN(parsedResponse.wateringFrequency)) {
                    parsedResponse.wateringFrequency = 7; // Valore di default se non è un numero valido
                }
            }
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            console.error('Raw response:', response.choices[0].message.content);
            return res.status(500).json({ error: 'Invalid response format from AI', rawResponse: response.choices[0].message.content });
        }

        res.json(parsedResponse);
    } catch (error) {
        console.error('Error fetching response from OpenAI:', error);
        res.status(500).json({ error: 'Error in fetching response', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});