# Aitheria 🔍

Aitheria is an AI-powered qualitative research assistant built for social science,humanities researchers and journalists working with interview-based fieldwork. It simplifies the process of managing, theming, and contextualizing qualitative data with a beautiful, easy-to-use interface powered by cutting-edge LLM and search APIs.

Designed for researchers unfamiliar with technical tooling, Aitheria is your intuitive companion from transcription to analysis to insight.

---

## ✨ Features

- **User Authentication** – Secure login and registration via Appwrite.
- **Project Management** – Create, view, and switch between multiple research projects.
- **Interview Upload** – Upload interviews ( support for most of the popular audio formats)
- **Thematic Analysis** – Extract key themes using Groq's LLaMA 3.3-70B model.
- **Keyword Extraction** – Categorized and contextual keywords with source quotes.
- **Visualization** – Animated bar charts, excerpted quotes, and future heatmap support.
- **Notes Module** – Maintain and persist personal project notes.
- **Contextualization** – Enrich findings with external context using Tavily.
  

---

## 🧠 Tech Stack

| Layer             | Tech                                   |
|-------------------|--------------------------------         |
| Frontend          | React + Vite + Tailwind CSS + ShadCN UI |
| State Management  | Zustand                                 |
| Authentication    | Appwrite                                |
| Database & Storage| Appwrite                                |
| Thematic Analysis | Groq's LLaMA 3.3-70B                    |
| Contextual Fetch  | Tavily API                              |           
| Transcription     | Assembly AI                             |
        

---
## ⚠️ Warning: Exposed API Keys

> **Important Note:**  
> This project contains exposed API keys **intentionally and only for demonstration purposes** during the hackathon. The keys are scoped to free-tier accounts, rate-limited.
>
> 🛑 **Kindly do not abuse these keys.** They are publicly visible only to simplify evaluation.
>
> 💡 _In a production-grade deployment, all API requests would be securely routed through a backend using environment variables and serverless functions , and these keys would **never** be exposed in the browser._


## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/v1ctornj/aitheria.git
cd aitheria
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Appwrite

- Set up your Appwrite project and web platform.
- Replace the values in `src/appwrite/config.js` with your project ID, endpoint, and bucket ID.

### 4. Add API Keys

Create API keys for - appwrite , Assembly AI , Groq and Tavily ( places commented in the code )



### 5. Start the app

```bash
npm run dev
```

The app will run at `http://localhost:3000`.

---

## 🧪 Usage Instructions

1. **Login or Register** using Appwrite.
2. **Create a new Project** from the dashboard.
3. **Upload interview file** 
4. Navigate between tabs:
   - **Insights**: View major themes with subpoints.
   - **Keywords**: Browse categorized keywords, quotes, and visualizations.
   - **Notes**: Jot down field notes, theories, or follow-ups.
   - **Contextualization**: Get related policy, news, or academic references ( available in the Insights section )

---

## 📊 Example Visualizations

- **Bar Chart** showing frequency of key terms per theme.
- **Quote Highlights** from interview transcripts.
- *(Upcoming)*: Heatmap of thematic density across transcripts.

---

## 🧩 Architecture Overview

```
+---------------------+
|      Frontend       |
|  React + ShadCN UI  |
+---------------------+
         |
         v
+---------------------+         +---------------------+
|     Appwrite        | <-----> |  LocalStorage Cache |
| Auth, DB, Storage   |         |   Theme & Notes     |
+---------------------+         +---------------------+
         |
         v
+---------------------+         +---------------------+
|  Groq LLM API       |         |   Tavily API        |
| Thematic + Keyword  | <-----> | Context Enrichment  |
+---------------------+         +---------------------+
```

---

## 🙌 Contributions

Have an idea to improve Aitheria Feel free to open issues or pull requests.

To contribute:

```bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

---

## 📜 License

This project is licensed under the MIT License.

---

## ✉️ Contact

For questions reach out via GitHub Issues

---

### Made with ❤️ for researchers.
