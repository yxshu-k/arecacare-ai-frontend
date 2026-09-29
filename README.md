# ArecaCare AI - Mobile Application 🌿

**Smart Arecanut Disease Detection & Advisory**  
*Healthy Crops | Informed Farmers | Sustainable Future*

---

## 🎯 Project Overview
This repository contains the **React Native (Expo)** mobile application for ArecaCare AI. The goal of this frontend is to build a fully functional mobile tool for farmers (19 screens) that integrates directly with our FastAPI backend. 

Key features include:
- AI-Powered Disease Detection (Leaf Spot, Yellow Leaf, Bud Rot)
- Weather & Agricultural Advisory
- Yield Prediction Calculations
- AI Voice/Chat Assistant (Multilingual)
- Farming Tips & Articles
- Farmer Profile & Farm Settings

---

## 🛠️ Technology Stack
To ensure a robust, enterprise-grade mobile application, we are strictly using the following UI blueprint stack:

- **Framework**: React Native (via Expo SDK 57)
- **State Management**: React Context API & `useReducer`
- **Navigation**: React Navigation (Stack + Bottom Tabs)
- **HTTP Client**: Axios (for FastAPI integration)
- **Storage**: AsyncStorage / SecureStore (Tokens)
- **Device Features**: `expo-image-picker` & `expo-camera` (for plant scanning)
- **Environment config**: Native EXPO_PUBLIC environment variables

---

## 🗺️ The Complete Development Workflow
Our development is meticulously structured across **6 weeks (37 days)**, moving from blueprint to production. This is our step-by-step master plan:

### ⚙️ Stage 1: Foundation (Week 1)
- **Phase 0:** Plan & Understand Backend API Contracts.
- **Phase 1:** Project Foundation (Initialize Expo, establish `src/` folder architecture, and `.env` setup).
- **Phase 2:** Design System & Components (Colors, Typography, Reusable `AppButton`, `Card`, `Screen`, `AppText`).
- **Phase 3:** Splash Screen & Onboarding (3-step intro flow for beginner farmers).
- **Phase 4:** Authentication (Login, Signup screens, and JWT token passing).
- **Phase 5:** Navigation Architecture (Connecting all screens together via React Navigation).

### 🌿 Stage 2: Core Features (Week 2-3)
- **Phase 6:** Treatment Status & Details
- **Phase 7:** Yield Prediction (Input forms and Yield Results screen)
- **Phase 8:** Tips & Articles (List views and detailed farming articles)
- **Phase 9:** Profile Management (User info, form details, logout)
- **Phase 10:** Settings (Theme, notifications)
- **Phase 11:** Language / Localization (Multilingual support for rural farmers)

### 🤖 Stage 3: Smart Features (Week 4)
- **Phase 12:** Weather & Advisory (Real-time weather data integration)
- **Phase 13:** AI Assistant (Chat interface, voice support, TTS/STT)
- **Phase 14:** State Handling (Global Error, Loading, and Offline UI states)
- **Phase 15:** Permissions & Security (Camera, microphone, secure local storage)

### 🚀 Stage 4: Production (Week 5-6)
- **Phase 16:** Testing & Integration (Unit testing, API mocking, user flow validation)
- **Phase 17:** UI Polish & Optimization (Performance fixes, device testing across Android/iOS simulators)
- **Phase 18:** Production Build (Final APK/AAB generation and documentation)

---

## 🔗 Backend API Contract Requirements
This mobile app strictly interfaces with the existing ArecaCare FastAPI Backend. Primary communication routes:
- `POST /api/auth/login` (Authentication)
- `POST /api/disease/predict` (AI Image Analysis)
- `GET /api/weather/advisory` (Farming Advisory)
- `POST /api/assistant/chat` (AI Chatbot)
- `POST /api/yield/predict` (Yield Estimation)

---

## 🏃‍♂️ How to Run the App Locally

1. **Install Node.js & Dependencies**:
   Ensure you have Node.js installed. Navigate to this directory and install dependencies:
   ```bash
   npm install
   ```

2. **Start the Expo Development Server**:
   ```bash
   npm start
   ```

3. **View the App**:
   - **On Mobile**: Download **Expo Go** from the Google Play Store (Android) or App Store (iOS) and scan the QR code in the terminal.
   - **On Web**: Press `w` in the terminal to view in your browser.
   - **On Emulator**: Press `a` (for Android Studio) or `i` (for iOS Simulator) in the terminal.
