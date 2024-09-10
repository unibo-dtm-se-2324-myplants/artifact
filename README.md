# PlantAI

**PlantAI** is a **Progressive Web App (PWA)** that allows users to upload images of their houseplants, identify the plant species, and receive personalized care instructions, including watering schedules. It combines AI-powered plant identification with offline functionality to create a seamless and user-friendly experience for plant enthusiasts.

## Features

- **Upload Plant Images**: Users can upload images of their houseplants to identify the species.
- **Personalized Care Instructions**: The app provides the plant’s scientific name, watering frequency, and care instructions.
- **Watering Reminders**: Notifications remind users when to water their plants based on the identified schedule.
- **Offline Functionality**: Thanks to service workers, the app works even when offline by caching essential resources and storing plant data locally.
- **Plant History**: Users can view a list of their saved plants and track their care instructions.

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **API Integration**: OpenAI API for image classification and plant identification
- **Storage**: Browser local storage for saving user data and plant information
- **PWA**: Service worker for offline support

## Installation

Follow these steps to set up **PlantAI** locally:

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key

### Steps

1. **Clone the Repository**:
    ```
    git clone https://github.com/unibo-dtm-se-2324-myplants/artifact.git
    ```
2. **Navigate to the Project Directory**:
    ```
    cd artifact
    ```
3. **Install Dependencies**:
    ```
    npm install
    ```
4. **Set Up Environment Variables**:
    Create a `.env` file in the root directory and add the following:
    ```
    OPENAI_API_KEY=your_openai_api_key
    ```
5. **Run the Application**:
    ```
    npm start
    ```
    The app will now be accessible at http://localhost:3000.

## Usage

### Uploading a Plant Image
- Navigate to the homepage and use the drag-and-drop interface or select an image from your device to upload a picture of your plant.
- Choose whether the plant is Indoor or Outdoor.
- Submit the image to receive the plant’s scientific name, description, watering frequency, and care instructions.

### Viewing Saved Plants
- Scroll down to see a list of your previously identified plants, complete with care instructions.

### Receiving Watering Notifications
- PlantAI will send you notifications when it’s time to water your plants. Make sure notifications are enabled in your browser.

### Offline Access
- Once you’ve visited the app, it will continue to work offline. You can access your saved plants and use the identification feature without an internet connection.

---

### License
This project is licensed under the MIT License - see the LICENSE file for details.

### Contact
For any inquiries or contributions, feel free to reach out:

Email: [dcopia@studenti.unibo.it](mailto:dcopia@studenti.unibo.it)

GitHub: [GitHub Profile](https://github.com/dcopia)

Thank you for using PlantAI! 🌱
