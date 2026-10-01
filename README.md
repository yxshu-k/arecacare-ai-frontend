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
Our development is meticulously structured across strictly managed phases, moving from the initial blueprint UI to a production-ready application. Below is the exact step-by-step history of what has been accomplished and what remains:

### ⚙️ Stage 1: Foundation & Core UI (Completed ✅)
- **Phase 1: Project Foundation**: Bootstrapped the Expo SDK 57 environment, established a strict modular directory structure (`components/`, `screens/`, `navigation/`), and cleared all default boilerplate.
- **Phase 2: Design System & Components**: Defined the Agricultural Green color palette and standardized scalable typography. Built robust, reusable UI atoms (`AppText`, `AppButton`, `AppTextInput`, and `Screen` wrappers).
- **Phase 3: Splash & Onboarding**: Built the dynamic `SplashScreen` and a 3-step `OnboardingScreen` educational flow.
- **Phase 4: Authentication**: Developed High-Fidelity `LoginScreen` and `SignupScreen`. Implemented `AuthContext` for global session management using `expo-secure-store` for safe, encrypted token persistence.
- **Phase 5: Navigation Architecture**: Integrated React Navigation (Native Stack + Bottom Tabs). Established `RootNavigator` to act as an authentication gatekeeper, seamlessly handling logged-in vs logged-out routing.
- **Phase 6: Professional UI & Home Dashboard**: Replaced all placeholder emojis globally with `@expo/vector-icons` for an enterprise aesthetic. Built the primary `HomeScreen` dashboard featuring dynamic Action Cards and a personalized greeting system.

### 🌿 Stage 2: Core AI Features (Completed ✅)
- **Phase 7: AI Disease Diagnostics Flow**: Engineered nested Stack routing for the plant scanning process. Built the Camera Viewfinder UI (`ScanPlantScreen`), a mock AI-inference `ImagePreviewScreen`, and constructed the highly detailed scientific readouts (`ResultScreen` & `TreatmentDetailsScreen`).
- **Phase 8: Yield Prediction Engine**: Developed the environmental data input forms (`YieldInputScreen`) securely wrapped in iOS/Android KeyboardAvoidingViews. Constructed the stunning prediction metric gauge dashboard (`YieldResultScreen`).
- **Phase 9: History, Tips, & Profile**: Finalized all bottom tab screens. Built `HistoryScreen` (timeline of past AI scans with severity color-coding), `TipsScreen` (farming knowledge repository with bookmarks), and `ProfileScreen` (user settings matrix and secure logout control).

### 🤖 Stage 3: Smart Integrations (Completed ✅)
- **Phase 10: Settings**: Built the interactive system toggles for Dark Mode, Push Notifications, and Data Saver.
- **Phase 11: Language / Localization**: Developed a visually robust multilingual translation selector for 6 regional languages.
- **Phase 12: Weather & Advisory**: Integrated a highly sophisticated real-time climate dashboard with comprehensive environmental metric grids.
- **Phase 13: AI Assistant & Disease Info**: Built the interactive Chat Interface with functional UI for Voice processing. Added the previously omitted Disease Information reference screen.

### 🚀 Stage 4: Production Polish (In Progress 🚧)
- **Phase 14: State Handling (Completed ✅)**: Wired up global Error fallback screens, Full-Screen blocking Loaders, and a global absolute-positioned Offline Network banner.
- **Phase 15: Permissions & Device Security (Completed ✅)**: Robustly constructed the native service boundaries for Camera and Microphone access, injecting visual fallback UI into the scanning and chat views if native permissions are suddenly revoked.
- **Phase 16 - 18 (Upcoming ⏳)**: Final E2E Testing, UI Performance Optimization on Android/iOS devices, and final Production App Bundling (APK/AAB).

---

## 📈 Engineering Audit & Status Report 
*(Current Phase: Frontend + Backend API Integration)*

### ✅ 1. Completed Work (Fully Integrated & Tested)
- **Phase 0-3 & 5 (Foundation):** Project structure, React Navigation (Stack + Bottom Tabs), splash screen, onboarding flow, and core design system (colors/typography) are fully implemented.
- **Phase 4 (Authentication):** JWT handling, secure token storage (`AsyncStorage/expo-secure-store`), protected routing, and login/logout pipelines are completely wired to `/api/auth/...`.
- **Phase 6 & 7 (Scanner & Treatment):** The native `expo-camera` is flawlessly integrated. Photo capture, `FormData` construction, and the POST request to `/api/disease/predict` are complete.
- **Phase 8 (Yield Prediction):** The UI input form and the backend connection to `POST /api/yield/predict` have been tested end-to-end.
- **Phase 15 (Weather & Advisory):** The live OpenWeatherMap integration via `GET /api/weather/advisory` is functioning and mapping risks accurately.
- **Phase 16 (AI Chat Assistant):** Conversational chat interface is successfully communicating with the Gemini backend via `POST /api/assistant/chat`.
- **Phase 18 (Permissions & Security):** We strictly implemented native camera permission checks and achieved the full Security Checklist (JWT, protected routes, token cleanup).

### ⏳ 2. Pending Work (WIP or Partially Implemented)
- **Phase 12 (Profile):** We have the basic auth data, but the full "Profile Edit" (`GET/PUT /api/user/update`) UI and integration still need to be built/wired.
- **Phase 17 (Error/Loading/Offline Handling):** We added Axios interceptors, but we still need to build a global "Offline/No Signal" UI screen and standardize loading spinners across all API calls.
- **Phase 19 (Testing & Integration):** We have done heavy backend unit testing, but we need to execute frontend User Flow E2E testing on physical devices.
- **Phase 20 (UI Polish & Optimization):** We need to fix minor UI layout bugs, spacing, padding, Z-index layers, and unify color themes across all screens.
- **Phase 21 (Production Build):** The `.apk` has been successfully compiled via EAS, but final documentation and App Store screenshots are pending.

### ⏭️ 3. Skipped Works (Needs Immediate Attention for v1.0)
- **Phase 10 (Tips & Farming Articles):** The roadmap highlights a List & Detail view and a `GET /api/articles` endpoint. Currently, these operate on hardcoded frontend mockups and require a dedicated backend database integration.
- **History Integration (`GET /api/predictions/history`):** While the backend tracks history in MongoDB, we haven't fully finalized the UI list to fetch and display the history of a farmer's past scans.

### 🚀 4. Future Implementation (Post v1.0)
- **Phase 14 (Language / Localization):** True multi-language support (translating all buttons, text, and menus into Kannada, Malayalam, etc. using translation libraries) will be implemented as a Phase 2 update.
- **Voice TTS/STT:** Implementing native microphone speech-to-text for the AI assistant deferred to focus on text-based robustness.
- **Global Theme Switching:** Implementing a global toggle between Light/Dark mode will happen once Light mode UI is completely robust.

---
## 🔗 Backend API Contract Requirements
This mobile app strictly interfaces with the existing ArecaCare FastAPI Backend. Primary communication routes:
- `POST /api/auth/login` (Authentication)
- `POST /api/disease/predict` (AI Image Analysis)
- `GET /api/weather/advisory` (Farming Advisory)
- `POST /api/assistant/chat` (AI Chatbot)
- `POST /api/yield/predict` (Yield Estimation)

---

## 🏃♂️ How to Run the App Locally

1. **Install Node.js & Dependencies**:
   Ensure you have Node.js installed. Navigate to this directory and install dependencies:
   ```bash
   npm install
   ```

2. **Start the Expo Development Server**:
   ```bash
   npx expo start -c
   ```

3. **View the App**:
   - **On Mobile**: Download **Expo Go** from the Google Play Store (Android) or App Store (iOS) and scan the QR code in the terminal.
   - **On Web**: Press `w` in the terminal to view in your browser.
   - **On Emulator**: Press `a` (for Android Studio) or `i` (for iOS Simulator) in the terminal.
