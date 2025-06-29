# Aithēria

Aithēria is an AI-powered companion for researchers conducting qualitative fieldwork. It assists in transcribing, theming, contextualizing, and managing multiple ethnographic projects.

## Features

- **User Authentication**: Secure login and registration using Appwrite.
- **Project Management**: Create and manage multiple research projects.
- **Interview Upload**: Upload audio files for transcription.
- **Transcription**: In-browser transcription using Whisper Web.
- **Thematic Analysis**: Generate thematic summaries using LLMs.
- **Contextualization**: Fetch relevant news and policy information via Tavily.
- **Archiving**: Export memos and insights for reporting.

## Tech Stack

- **Frontend Framework**: React + Vite + Tailwind CSS
- **State Management**: Zustand
- **Authentication & Database**: Appwrite
- **Transcription**: Whisper Web (WASM)
- **LLM**: OpenRouter or Together.ai
- **Memory Layer**: Mem0 Pro
- **Contextual Info Fetch**: Tavily

## Project Structure

```
/aitheria-app/
├── public/
├── src/
│   ├── appwrite/         # Appwrite client + auth/session utils
│   ├── components/       # Reusable UI components
│   ├── pages/            # Application pages
│   ├── utils/            # Helper functions
│   ├── store/            # Global state management
│   └── App.jsx           # Main application component
├── tailwind.config.js     # Tailwind CSS configuration
├── vite.config.js         # Vite configuration
├── index.html             # Main HTML entry point
└── README.md              # Project documentation
```

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/aitheria-app.git
   cd aitheria-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure Appwrite:
   - Set up your Appwrite project and update the client configuration in `src/appwrite/client.js`.

4. Run the application:
   ```
   npm run dev
   ```

5. Access the application at `http://localhost:3000`.

## Usage Guidelines

- Use the login page to authenticate and access your projects.
- Create new projects from the dashboard.
- Upload interviews and initiate transcription.
- View thematic summaries and contextual information for each interview.

## Contribution

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.