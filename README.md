                                                                 🎨 Comic Crafter AI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Tech Stack](https://img.shields.io/badge/Tech-React%20%26%20Gemini%20API-brightgreen)](https://ai.google.dev/)
[![Made with Love](https://img.shields.io/badge/Made%20with-Love-red)](https://github.com/your-username/comic-crafter-ai)


<img width="1447" height="576" alt="image" src="https://github.com/user-attachments/assets/69fca98a-a551-4b05-932a-1012d00f17ea" />


<img width="2521" height="1430" alt="image" src="https://github.com/user-attachments/assets/db45ef4a-861b-4da5-a380-ff719bccd540" />



---

## 🌟 Introduction

Comic Crafter AI is a web-based application designed to democratize comic creation. It tackles one of the biggest challenges in AI image generation—**character consistency**—by building a seamless, intuitive workflow for generating complete comic strips. Whether you're a writer storyboarding a scene, a marketer creating visual content, or a hobbyist exploring creative AI, this tool removes the artistic barrier and lets your narrative shine.

The core innovation lies in its sequential image generation process. Using the powerful `gemini-2.5-flash-image-preview` model, each new panel is created with the *previous panel's image as a visual reference*, ensuring your protagonist's appearance remains remarkably consistent throughout the entire story.

## ✨ Key Features

*   **🤖 Consistent Character Generation:** Define your protagonist once. The AI uses the image from the previous panel as a reference to keep your character's appearance, clothing, and style consistent across the entire comic.
*   **✍️ AI Narrative Assistant:** Stuck for a story? Provide a simple prompt (e.g., "a detective finds a mysterious clue"), and the AI will generate a complete, multi-panel storyboard with scene descriptions, character actions, and dialogue.
*   **⚙️ Full Creative Control:** Manually write or edit every scene description, character expression, and line of dialogue. You have fine-tuned control over every narrative detail before generation.
*   **🔄 Resilient Panel Generation:** If a single panel fails to generate, the process doesn't stop! The failed panel is clearly marked with an in-app **Retry** button, allowing you to regenerate it without losing your progress or consistency.
*   **🎨 Thematic PDF Export:** Download your finished comic as a high-quality, multi-page PDF. The PDF features a vibrant, retro comic-book background with a halftone dot pattern and an intelligent 2x3 panel grid for a professional, print-ready look.

## 🚀 How It Works

The application guides you through a simple three-step process to create your comic.

### Step 1: Define Your Protagonist

This is where your story begins. Give your character a name and a detailed description. The more detail you provide about their appearance, outfit, and the desired art style, the more consistent the AI-generated images will be.

<img width="2521" height="1430" alt="image" src="https://github.com/user-attachments/assets/cd9508a8-015d-44db-800a-fce947589b69" />


### Step 2: Construct the Narrative

Craft the story panel by panel. You can write everything manually or use the **AI Narrative Assistant**. Simply provide a story idea, and the AI will generate a complete storyboard for you to edit and refine.

<img width="2508" height="1379" alt="image" src="https://github.com/user-attachments/assets/171337ce-b983-4253-accc-bd09465c5cca" />
<img width="1269" height="1541" alt="image" src="https://github.com/user-attachments/assets/55c82dc2-5012-476e-9cc4-1a22ec6b3de3" />
<img width="813" height="1110" alt="image" src="https://github.com/user-attachments/assets/5901a5fd-c9a6-47a2-8d5e-107d427ca363" />
<img width="1378" height="729" alt="image" src="https://github.com/user-attachments/assets/cebefba6-2fbf-43d3-a857-210a113b635a" />

<img width="1023" height="1105" alt="image" src="https://github.com/user-attachments/assets/9eb28caa-6ec7-4eaf-aa45-2330770b2a21" />






### Step 3: Generate & View Your Comic

-[ai_policy_assistant.pdf](https://github.com/user-attachments/files/22196811/ai_policy_assistant.pdf)

Video Link :


https://github.com/user-attachments/assets/bf84b842-271b-4c1c-b02b-92f4247b3d05



With your storyboard complete, click "Generate My Comic!". The application sends your detailed prompts to the AI, which generates an image for each panel sequentially. Your final comic is then beautifully displayed, ready for you to review, retry failed panels, and download.



## 🛠️ Tech Stack

This project leverages a modern web stack and powerful AI models to deliver a seamless user experience.

*   **Frontend:**
    *   **React:** For building the dynamic user interface.
    *   **TypeScript:** For type-safe and robust code.
    *   **Tailwind CSS:** For rapid, utility-first styling.
*   **AI Engine (Google Gemini API):**
    *   **`gemini-2.5-flash`:** Used for its powerful JSON mode to generate the structured storyboard from a simple text prompt.
    *   **`gemini-2.5-flash-image-preview`:** The core of the visual engine, used for its multi-modal capabilities to generate high-quality images from a combination of text and reference images.
*   **PDF Generation:**
    *   **jsPDF & html2canvas:** For capturing the generated comic panels and composing them into a high-quality, styled PDF document.

## ⚙️ Getting Started (Local Development)

To run this project on your local machine, follow these steps.

### Prerequisites

*   Node.js (v18 or later)
*   A Google Gemini API Key. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/rupam13/Comic-Crafter-AI-Agent
    ```

2.  **Install dependencies:**
    *(This project uses a local development server that resolves import maps, so no `npm install` is needed for the core libraries.)*

3.  **Set up your environment variables:**
    This project is configured to work within an environment that securely provides the API key (like AI Studio). For local development, you would typically use a `.env` file, but for this setup, ensure your development environment can resolve `process.env.API_KEY`.

4.  **Run the development server:**
    The standard way to serve this project locally is with a simple server. If you have Node.js, you can use `serve`:
    ```bash
    npx serve .
    ```
    Now, open your browser and navigate to the local address provided (e.g., `http://localhost:3000`).

## 🔮 Future Roadmap

This project has a lot of potential for expansion. Here are a few ideas:

*   **🎨 Art Style Selector:** Provide a dropdown of predefined art styles (e.g., "Manga," "Film Noir," "Classic Cartoon") that the AI can apply.
*   **👥 Multi-Character Support:** Introduce the ability to define and manage multiple characters with consistency within a single story.
*   **💬 Dialogue Placement Control:** Allow users to drag and drop speech bubbles and captions onto different areas of the panel.
*   **🖼️ Custom Panel Layouts:** Let users choose different page layouts (e.g., 2x2 grid, vertical strip, dynamic sizing).
*   **☁️ Cloud Project Saving:** Implement user accounts to save and load comic projects.

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
