import React, { useState, useMemo } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Share,
    Linking,
    Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const POLICY_SECTIONS = [
    {
        id: 'scope',
        icon: 'book-open',
        titleEn: '1. Scope & Farmer Commitment',
        titleKn: '೧. ವ್ಯಾಪ್ತಿ ಮತ್ತು ರೈತರ ಹಿತರಕ್ಷಣೆ',
        titleTu: '೧. ವ್ಯಾಪ್ತಿ ಬೊಕ್ಕ ಬೆಳೆಗಾರರೆನ ರಕ್ಷಣೆ',
        titleHi: '1. कार्यक्षेत्र और किसान संरक्षण',
        bodyEn: 'ArecaCare AI is dedicated exclusively to empowering arecanut (Areca catechu) growers across Karnataka and India. We treat agricultural data with extreme confidentiality. We believe that your farm data belongs to you, the farmer. This policy outlines how crop photographs, acreage records, and weather parameters are handled strictly for disease diagnosis and yield enhancement.',
        bodyKn: 'ಅಡಿಕೆಕೇರ್ AI ಕರಾವಳಿ, ಮಲೆನಾಡು ಹಾಗೂ ಕರ್ನಾಟಕದ ಸಮಸ್ತ ಅಡಿಕೆ ಬೆಳೆಗಾರರ ಹಿತದೃಷ್ಟಿಯಿಂದ ನಿರ್ಮಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ತೋಟದ ಮಾಹಿತಿ, ಕೃಷಿ ಪದ್ಧತಿ ಮತ್ತು ಆದಾಯದ ಗೌಪ್ಯತೆಯನ್ನು ನಾವು ಅತ್ಯುನ್ನತ ಮಟ್ಟದಲ್ಲಿ ಕಾಪಾಡುತ್ತೇವೆ. ನಿಮ್ಮ ಕೃಷಿ ದತ್ತಾಂಶವು ಕೇವಲ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಇಳುವರಿ ಸುಧಾರಣೆಗೆ ಮಾತ್ರ ಬಳಕೆಯಾಗುತ್ತದೆ.',
        bodyTu: 'ಅಡಿಕೆಕೇರ್ AI ಕರಾವಳಿ ಬೊಕ್ಕ ಮಲೆನಾಡ್‌ದ ಕಂಗು ಬೆಳೆಗಾರರೆಗ್ ಸಹಾಯ ಮಲ್ಪುನ ಉದ್ದೇಶೊಡು ತಯಾರಾಯಿನವು. ಈರೆನ ತೋಟದ ಮಾಹಿತಿ, ಫೋಟೋಲು ಬೊಕ್ಕ ಬೆಳೆದ ಲೆಕ್ಕೊ ಪೂರಾ ಈರೆಗ್ ಮಾತ್ರ ಸೇರ್ದಿನವು. ಇಂದೆನ್ ಕೇವಲ ಸೀಕ್ ಪತ್ತೆ ಬೊಕ್ಕ ಬೆಳೆ ಎಚ್ಚ ಮಲ್ಪೆರೆ ಮಾತ್ರ ಗಲಸುವ.',
        bodyHi: 'एरेकाकेयर एआई विशेष रूप से कर्नाटक और भारत के सुपारी उत्पादकों के कल्याण के लिए बनाया गया है। हम आपके खेत, फसल की तस्वीरों और उपज के डेटा को पूरी तरह से गोपनीय रखते हैं। आपका कृषि डेटा केवल रोग पहचान और बेहतर पैदावार के लिए उपयोग किया जाता है।',
        points: [
            'Tailored for arecanut plantations in Karnataka & pan-India',
            'Zero commercial monetization of individual farm yields',
            'Compliant with Digital Personal Data Protection (DPDP) Act 2023',
        ],
    },
    {
        id: 'collection',
        icon: 'database',
        titleEn: '2. Information We Collect',
        titleKn: '೨. ನಾವು ಸಂಗ್ರಹಿಸುವ ಮಾಹಿತಿ',
        titleTu: '೨. ಎಂಕ್ಲು ದೆತೊನುನ ಮಾಹಿತಿ',
        titleHi: '2. हम कौन सा डेटा एकत्र करते हैं',
        bodyEn: 'To deliver deep learning disease classification and microclimate advisories, we collect minimal and relevant agricultural data:',
        bodyKn: 'ನಿಖರವಾದ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ರೋಗ ಪತ್ತೆ ಮತ್ತು ಹವಾಮಾನ ಸಲಹೆಗಳನ್ನು ನೀಡಲು, ನಾವು ಅತ್ಯಗತ್ಯ ಕೃಷಿ ವಿವರಗಳನ್ನು ಮಾತ್ರ ಸಂಗ್ರಹಿಸುತ್ತೇವೆ:',
        bodyTu: 'ನಿಖರವಾದ AI ಸೀಕ್ ಪತ್ತೆ ಬೊಕ್ಕ ಹವಾಮಾನ ಸಲಹೆ ಕೊರ್ರೆ, ಎಂಕ್ಲು ಬೋಡಾಯಿನ ಕೃಷಿ ವಿವರೊಲೆನ್ ಮಾತ್ರ ದೆತೊನುವ:',
        bodyHi: 'सटीक एआई रोग निदान और मौसम संबंधी सलाह देने के लिए, हम केवल आवश्यक कृषि डेटा एकत्र करते हैं:',
        points: [
            'Diagnostic Photographs: Close-up photos of arecanut bunches, palm crowns, stems, and leaf blades submitted by you.',
            'Farm Agronomics: Total farm acreage, palm density, tree age (bearing vs young), and irrigation type.',
            'Coarse Location: Taluk and district coordinates (approx. 5 km precision) to query regional weather radars and IMD rainfall indices.',
            'Farmer Account: Full name, phone number or email, and preferred regional language (Kannada, Tulu, Hindi, English).',
        ],
    },
    {
        id: 'ai_usage',
        icon: 'cpu',
        titleEn: '3. How AI Uses Farm Data',
        titleKn: '೩. ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ಹೇಗೆ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ',
        titleTu: '೩. AI ಎಂಚ ಕೆಲಸ ಮಲ್ಪುಂಡು',
        titleHi: '3. एआई आपके डेटा का उपयोग कैसे करता है',
        bodyEn: 'Farm telemetry and crop photos are fed into localized neural networks strictly for diagnostic inference:',
        bodyKn: 'ತೋಟದ ವಿವರಗಳು ಮತ್ತು ಎಲೆ/ಕಾಯಿಗಳ ಫೋಟೋಗಳನ್ನು ಈ ಕೆಳಗಿನ ಸದುದ್ದೇಶಗಳಿಗೆ ಮಾತ್ರ AI ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತದೆ:',
        bodyTu: 'ತೋಟದ ಫೋಟೋ ಬೊಕ್ಕ ವಿವರೊಲೆನ್ AI ಈ ತಿರ್ತ್ ಕೊರ್ತಿನ ಕೆಲಸೊಲೆಗ್ ಮಾತ್ರ ಉಪಯೋಗ ಮಲ್ಪುಂಡು:',
        bodyHi: 'खेत के विवरण और फसल की तस्वीरों का उपयोग एआई द्वारा केवल निम्नलिखित कार्यों के लिए किया जाता है:',
        points: [
            'Vision Classification: Detecting Koleroga (Mahali), Yellow Leaf Disease, Stem Bleeding, and Bud Rot with >90% precision.',
            'Agronomic Advisory: Synthesizing customized fertilizer dosage and spray calendar using Google Gemini models without sharing farmer PII.',
            'Epidemiological Defense: Aggregating anonymized disease incidence to trigger taluk-level Koleroga community warnings.',
        ],
    },
    {
        id: 'photos',
        icon: 'image',
        titleEn: '4. Diagnostic Photo Privacy & Retention',
        titleKn: '೪. ಫೋಟೋಗಳ ಗೌಪ್ಯತೆ ಮತ್ತು ರಕ್ಷಣೆ',
        titleTu: '೪. ಫೋಟೋಲೆನ ಗೌಪ್ಯತೆ ಬೊಕ್ಕ ರಕ್ಷಣೆ',
        titleHi: '4. फोटो गोपनीयता और संरक्षण',
        bodyEn: 'When you take or upload an arecanut leaf or nut photo, it is processed securely over encrypted channels. We do not extract facial biometrics or personal surroundings. Diagnostic scans remain linked to your private farm history so you can monitor crop recovery. You can delete any scan from your History screen at any time.',
        bodyKn: 'ನೀವು ಅಪ್‌ಲೋಡ್ ಮಾಡುವ ಬೆಳೆಯ ಫೋಟೋಗಳನ್ನು ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಲಾದ ಸುರಕ್ಷಿತ ಸರ್ವರ್‌ಗಳಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತದೆ. ಇದರಲ್ಲಿ ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಅಥವಾ ಮುಖದ ಗುರುತು ಇರುವುದಿಲ್ಲ. ನಿಮ್ಮ ಚಿಕಿತ್ಸೆಯ ಪ್ರಗತಿಯನ್ನು ಗಮನಿಸಲು ಇತಿಹಾಸದಲ್ಲಿ ಉಳಿಯುತ್ತದೆ ಮತ್ತು ನೀವು ಇಷ್ಟಬಂದಾಗ ಅದನ್ನು ಅಳಿಸಬಹುದು.',
        bodyTu: 'ಈರ್ ಕಡಪುಡುನ ಕಂಗಿದ ಇರೆ ಅಥವಾ ಕಾಯಿದ ಫೋಟೋಲೆನ್ ಭದ್ರವಾದ್ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಲ್ತ್‌ದ್ ತೂಪ. ಇಂದೆಟ್ ಮುಖದ ಗುರ್ತೊ ಇಜ್ಜಾಂಡ್. ಈರೆನ ಇತಿಹಾಸೊಡು ಉಪ್ಪುಂಡು, ಬೋಡಂದಿನಾಗ ಈರೆ ಅಳಿಸಾವೊಲಿ.',
        bodyHi: 'आपके द्वारा अपलोड की गई फसल की तस्वीरें पूरी तरह से एन्क्रिप्टेड सर्वर पर जांची जाती हैं। इनमें कोई व्यक्तिगत पहचान शामिल नहीं होती है। आप किसी भी समय अपनी हिस्ट्री से इन तस्वीरों को हटा सकते हैं।',
        points: [
            'End-to-end TLS 1.3 encryption during photo upload',
            'Zero extraction of facial or non-agricultural background metadata',
            'One-tap permanent deletion available under History tab',
        ],
    },
    {
        id: 'location',
        icon: 'map-pin',
        titleEn: '5. Taluk-Level Location & Weather',
        titleKn: '೫. ತಾಲೂಕು ಮಟ್ಟದ ಸ್ಥಳ ಮತ್ತು ಹವಾಮಾನ',
        titleTu: '೫. ತಾಲೂಕು ಮಟ್ಟದ ಜಾಗ ಬೊಕ್ಕ ಬರ್ಸದ ಲೆಕ್ಕ',
        titleHi: '5. तहसील स्तर पर स्थान और मौसम',
        bodyEn: 'Arecanut fungal diseases like Koleroga are directly triggered by continuous monsoon downpours and relative humidity exceeding 85%. To provide timely spray advisories, we query weather radar for your taluk. We never track your real-time GPS coordinates in the background, nor do we track your travel or precise home location.',
        bodyKn: 'ಕೊಳೆರೋಗ ಮತ್ತು ಇತರ ಶಿಲೀಂಧ್ರ ರೋಗಗಳು ಮಳೆ ಮತ್ತು ೮೫% ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ತೇವಾಂಶದಿಂದ ಹರಡುತ್ತವೆ. ಸರಿಯಾದ ಸಿಂಪಡಣಾ ಎಚ್ಚರಿಕೆ ನೀಡಲು ತಾಲೂಕು ಮಟ್ಟದ ಹವಾಮಾನವನ್ನು ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ. ಹಿನ್ನೆಲೆಯಲ್ಲಿ ಯಾವುದೇ ರಿಯಲ್-ಟೈಮ್ ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಇರುವುದಿಲ್ಲ.',
        bodyTu: 'ಕೊಳೆ ರೋಗ ಬರ್ಪುನೆಕ್ ಮುಖ್ಯ ಕಾರಣ ಜಾಸ್ತಿ ಬರ್ಸ ಬೊಕ್ಕ ಗಾಳಿಡ್ ಉಪ್ಪುನ ತಂಪು. ಮುನ್ನೆಚ್ಚರಿಕೆ ಕೊರ್ರೆ ಈರೆನ ತಾಲೂಕುದ ಹವಾಮಾನೊನು ಮಾತ್ರ ಲೆಕ್ಕ ದೆತೊನುವ. ಈರೆನ ಲೈವ್ ಜಿಪಿಎಸ್ ಟ್ರ್ಯಾಕ್ ಮಲ್ಪುಜಿ.',
        bodyHi: 'कोलेरोगा जैसे रोग लगातार बारिश और 85% से अधिक आर्द्रता के कारण फैलते हैं। सटीक चेतावनी के लिए हम केवल तहसील स्तर के मौसम डेटा का उपयोग करते हैं। कोई लाइव जीपीएस ट्रैकिंग नहीं की जाती है।',
        points: [
            'Coarse taluk-level boundary coordinates only',
            'No background GPS location tracking',
            'Real-time IMD / OpenWeather humidity and rain integration',
        ],
    },
    {
        id: 'rights',
        icon: 'user-check',
        titleEn: '6. Farmer Rights & Data Erasure',
        titleKn: '೬. ರೈತರ ಹಕ್ಕುಗಳು ಮತ್ತು ಖಾತೆ ಅಳಿಸುವಿಕೆ',
        titleTu: '೬. ಬೆಳೆಗಾರರೆನ ಹಕ್ಕುಲು ಬೊಕ್ಕ ಅಳಿಸಾವುನ ಅಧಿಕಾರ',
        titleHi: '6. किसान के अधिकार और डेटा हटाना',
        bodyEn: 'Under India’s Digital Personal Data Protection (DPDP) Act 2023, you hold absolute rights over your agricultural records. You may exercise these rights at any time directly through the app:',
        bodyKn: 'ಭಾರತೀಯ ಡಿಜಿಟಲ್ ವೈಯಕ್ತಿಕ ಡೇಟಾ ಸಂರಕ್ಷಣಾ ಕಾಯ್ದೆ ೨೦೨೩ ರ ಅಡಿಯಲ್ಲಿ, ರೈತರು ತಮ್ಮ ಮಾಹಿತಿಯ ಮೇಲೆ ಸಂಪೂರ್ಣ ಹಕ್ಕುಗಳನ್ನು ಹೊಂದಿರುತ್ತಾರೆ:',
        bodyTu: 'ಭಾರತ ಸರ್ಕಾರದ ಡಿಜಿಟಲ್ ಡೇಟಾ ರಕ್ಷಣೆ ಕಾಯ್ದೆ ೨೦೨೩ ರ ಪ್ರಕಾರ, ಬೆಳೆಗಾರರೆಗ್ ತಮ್ಮ ದತ್ತಾಂಶದ ಮಿತ್ತ್ ಪೂರ್ಣ ಹಕ್ಕು ಉಂಡು:',
        bodyHi: 'भारत के डिजिटल व्यक्तिगत डेटा संरक्षण (डीपीडीपी) अधिनियम 2023 के तहत, किसानों को अपने डेटा पर पूर्ण अधिकार प्राप्त हैं:',
        points: [
            'Right to Rectification: Update incorrect farm acreage, soil type, or palm count anytime.',
            'Right to Withdraw Consent: Revoke permissions in app settings or profile preferences.',
            'Right to Complete Erasure: Deactivate your account in Profile screen to permanently wipe all stored farms, scans, and personal credentials from our database.',
        ],
    },
    {
        id: 'security',
        icon: 'lock',
        titleEn: '7. Data Security & Storage Standards',
        titleKn: '೭. ದತ್ತಾಂಶ ಭದ್ರತೆ ಮತ್ತು ಶೇಖರಣೆ',
        titleTu: '೭. ಡೇಟಾ ಭದ್ರತೆ ಬೊಕ್ಕ ರಕ್ಷಣೆ',
        titleHi: '7. डेटा सुरक्षा और मानक',
        bodyEn: 'All user data is stored on secure cloud servers physically located in India, adhering to national data residency guidelines. We employ AES-256 bit encryption at rest and strict role-based access controls to prevent unauthorized access or corporate leaks.',
        bodyKn: 'ಎಲ್ಲಾ ರೈತರ ಮಾಹಿತಿಯನ್ನು ಭಾರತದ ಒಳಗಿರುವ ಸುರಕ್ಷಿತ ಸರ್ವರ್‌ಗಳಲ್ಲಿ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿ ಶೇಖರಿಸಲಾಗುತ್ತದೆ. ಯಾವುದೇ ಮೂರನೇ ವ್ಯಕ್ತಿಗೆ ಅಥವಾ ವಾಣಿಜ್ಯ ಸಂಸ್ಥೆಗಳಿಗೆ ಈ ಮಾಹಿತಿಯನ್ನು ನೀಡಲಾಗುವುದಿಲ್ಲ.',
        bodyTu: 'ಮಾಹಿತಿಲೆನ್ ಭಾರತದ ಉಲಯಿ ಉಪ್ಪುನ ಅತ್ಯುನ್ನತ ಭದ್ರತೆದ ಸರ್ವರ್‌ಡ್ ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಲ್ತ್‌ದ್ ದೀಪ. ಬೇತೆ ಏರೆಗ್ಲಾ ಮಾರಾಟ ಮಲ್ಪುಜಿ.',
        bodyHi: 'सभी डेटा को भारत में स्थित सुरक्षित सर्वरों पर संग्रहीत किया जाता है। उद्योग-मानक एईएस-256 एन्क्रिप्शन और सुरक्षा प्रोटोकॉल का पालन किया जाता है।',
        points: [
            'Data residency strictly within Indian cloud data centers',
            'Zero third-party advertiser tracking or broker sharing',
            'Automated nightly vulnerability audits',
        ],
    },
    {
        id: 'contact',
        icon: 'shield',
        titleEn: '8. Data Protection Officer (DPO)',
        titleKn: '೮. ದೂರು ನಿವಾರಣಾ ಮತ್ತು ಗೌಪ್ಯತಾ ಅಧಿಕಾರಿ',
        titleTu: '೮. ದೂರು ಪರಿಹಾರ ಬೊಕ್ಕ ಭದ್ರತಾ ಅಧಿಕಾರಿ',
        titleHi: '8. डेटा संरक्षण अधिकारी (डीपीओ)',
        bodyEn: 'In accordance with Indian statutory rules, we maintain a dedicated Grievance & Data Protection Officer to assist farmers with any privacy questions or data deletion requests.',
        bodyKn: 'ಯಾವುದೇ ಗೌಪ್ಯತಾ ಪ್ರಶ್ನೆಗಳು, ಮಾಹಿತಿ ಅಳಿಸುವಿಕೆ ಅಥವಾ ದೂರುಗಳಿಗೆ ನಮ್ಮ ದತ್ತಾಂಶ ಸಂರಕ್ಷಣಾ ಅಧಿಕಾರಿಯನ್ನು ಸಂಪರ್ಕಿಸಬಹುದು:',
        bodyTu: 'ದಾಲ ಪ್ರಶ್ನೆ ಇತ್ತ್ಂಡ ಅತ್ತ್ಂಡ ಮಾಹಿತಿ ಅಳಿಸಾವೊಡುಂದು ಇತ್ತ್ಂಡ ನಮ್ಮ ಅಧಿಕಾರಿಗ್ ಇಮೇಲ್ ಮಲ್ಪೊಲಿ:',
        bodyHi: 'किसी भी गोपनीयता संबंधी प्रश्न या डेटा हटाने के अनुरोध के लिए हमारे डेटा संरक्षण अधिकारी से संपर्क करें:',
        points: [
            'Grievance Officer: Agronomy & Privacy Desk, ArecaCare AI',
            'Direct Email: privacy@arecacare.ai',
            'Resolution Turnaround: Guaranteed response within 48 business hours',
        ],
    },
];

const PILLARS = [
    {
        icon: 'shield-check',
        title: 'Zero Ad Selling',
        titleKn: 'ಜಾಹೀರಾತು ಮಾರಾಟವಿಲ್ಲ',
        titleTu: 'ಮಾರಾಟ ಇಜ್ಜಾಂಡ್',
        titleHi: 'डेटा बिक्री नहीं',
        desc: 'Farm data is never sold to chemical brokers.',
        descKn: 'ನಿಮ್ಮ ಮಾಹಿತಿ ಯಾರೊಂದಿಗೂ ಹಂಚಿಕೊಳ್ಳುವುದಿಲ್ಲ.',
        descTu: 'ಮಾಹಿತಿ ಏರೆಗ್ಲಾ ಕೊರ್ಪುಜಿ.',
        descHi: 'खेत का डेटा कभी बेचा नहीं जाता।',
        color: '#10B981',
        bg: '#ECFDF5',
    },
    {
        icon: 'map-marker-radius',
        title: 'Taluk Coarse GPS',
        titleKn: 'ತಾಲೂಕು ಹವಾಮಾನ',
        titleTu: 'ತಾಲೂಕು ಬರ್ಸ',
        titleHi: 'तहसील मौसम',
        desc: 'Only regional coordinates for Kole Roga alerts.',
        descKn: 'ಕೇವಲ ಕೊಳೆ ರೋಗದ ಮುನ್ಸೂಚನೆಗಾಗಿ ಬಳಕೆ.',
        descTu: 'ಕೇವಲ ಸೀಕ್ ಬರ್ಪುನ ಎಚ್ಚರಿಕೆಗ್.',
        descHi: 'केवल मौसम और रोग चेतावनी के लिए।',
        color: '#3B82F6',
        bg: '#EFF6FF',
    },
    {
        icon: 'lock-check',
        title: 'AES-256 Storage',
        titleKn: 'ಉನ್ನತ ಭದ್ರತೆ',
        titleTu: 'ಉನ್ನತ ಭದ್ರತೆ',
        titleHi: 'सुरक्षित स्टोरेज',
        desc: 'Bank-grade encrypted database in India.',
        descKn: 'ಭಾರತೀಯ ಸರ್ವರ್‌ಗಳಲ್ಲಿ ಸುರಕ್ಷಿತ ಸಂಗ್ರಹ.',
        descTu: 'ಭಾರತದ ಸರ್ವರ್‌ಡ್ ಸುರಕ್ಷಿತ ಸಂಗ್ರಹ.',
        descHi: 'भारत में सुरक्षित क्लाउड पर स्टोर।',
        color: '#8B5CF6',
        bg: '#F5F3FF',
    },
    {
        icon: 'account-remove-outline',
        title: 'Right to Erase',
        titleKn: 'ಖಾತೆ ಅಳಿಸುವಿಕೆ',
        titleTu: 'ಖಾತೆ ಅಳಿಸಾವುನ ಹಕ್ಕು',
        titleHi: 'खाता हटाने का अधिकार',
        desc: 'One-tap total wipeout upon deactivation.',
        descKn: 'ಖಾತೆ ರದ್ದುಪಡಿಸಿದಾಗ ಎಲ್ಲವೂ ಅಳಿಸಿಹೋಗುತ್ತದೆ.',
        descTu: 'ಖಾತೆ ಡಿಲೀಟ್ ಮಲ್ತ್ಂಡ ಪೂರಾ ಮಾಹಿತಿ ಮಾಜುಂಡು.',
        descHi: 'खाता हटाने पर सभी डेटा तुरंत नष्ट।',
        color: '#EF4444',
        bg: '#FEF2F2',
    },
];

export default function PrivacyPolicyScreen({ navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { t, language } = useLanguage();

    const [expandedSections, setExpandedSections] = useState({
        scope: true,
        collection: true,
        ai_usage: true,
        photos: false,
        location: false,
        rights: false,
        security: false,
        contact: false,
    });

    const toggleSection = (id) => {
        setExpandedSections(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const expandAll = () => {
        const allExpanded = {};
        POLICY_SECTIONS.forEach(s => { allExpanded[s.id] = true; });
        setExpandedSections(allExpanded);
    };

    const collapseAll = () => {
        const allCollapsed = {};
        POLICY_SECTIONS.forEach(s => { allCollapsed[s.id] = false; });
        setExpandedSections(allCollapsed);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                title: 'ArecaCare AI Farmer Privacy Policy',
                message:
                    'ArecaCare AI is committed to 100% farmer data privacy under DPDP Act 2023. Your arecanut yields, photos, and taluk weather alerts are secure, encrypted, and never sold. Read more: https://arecacare.ai/privacy',
            });
        } catch (error) {
            // Cancelled or ignored
        }
    };

    const handleContactDpo = () => {
        const subject = encodeURIComponent('ArecaCare AI - Data Privacy / Rights Inquiry');
        const body = encodeURIComponent('Respected Data Protection Officer,\n\nI am a registered arecanut farmer. My privacy query / data request is:\n\n');
        Linking.openURL(`mailto:privacy@arecacare.ai?subject=${subject}&body=${body}`).catch(() => {
            Alert.alert(
                'Email Client Not Found',
                'Please write directly to privacy@arecacare.ai for any DPDP inquiries.'
            );
        });
    };

    const getLocalizedTitle = (section) => {
        if (language === 'kn') return section.titleKn;
        if (language === 'tu') return section.titleTu;
        if (language === 'hi') return section.titleHi;
        return section.titleEn;
    };

    const getLocalizedBody = (section) => {
        if (language === 'kn') return section.bodyKn;
        if (language === 'tu') return section.bodyTu;
        if (language === 'hi') return section.bodyHi;
        return section.bodyEn;
    };

    const styles = useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    return (
        <Screen style={styles.screen} noPadding>
            {/* Native Top Bar */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Feather name="arrow-left" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="heading2" style={{ color: colors.text }}>
                        {t('privacy_policy')}
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.textMedium }}>
                        DPDP Act 2023 Compliant
                    </AppText>
                </View>
                <TouchableOpacity
                    onPress={handleShare}
                    style={[styles.headerShareBtn, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F1F5F9' }]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Feather name="share-2" size={18} color={colors.text} />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                {/* Hero / Farmer Trust Card */}
                <View style={styles.heroCard}>
                    <View style={styles.heroGlow} />
                    <View style={styles.heroContent}>
                        <View style={styles.heroBadgeRow}>
                            <View style={styles.shieldIconCircle}>
                                <MaterialCommunityIcons name="shield-check" size={26} color="#FFFFFF" />
                            </View>
                            <View style={styles.verifiedTag}>
                                <MaterialCommunityIcons name="check-decagram" size={14} color="#10B981" />
                                <AppText variant="caption" style={{ color: '#10B981', fontWeight: 'bold', marginLeft: 4, fontSize: 11 }}>
                                    DPDP 2023 Verified
                                </AppText>
                            </View>
                        </View>

                        <AppText variant="heading2" style={styles.heroTitle}>
                            {t('privacy_overview')}
                        </AppText>

                        <AppText variant="bodySmall" style={styles.heroSubtitle}>
                            Transparent, farmer-first data protection. We treat your arecanut plantation data, photos, and yields with bank-grade privacy.
                        </AppText>

                        <View style={styles.heroFooter}>
                            <Feather name="clock" size={13} color="rgba(255,255,255,0.7)" style={{ marginRight: 6 }} />
                            <AppText variant="caption" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>
                                {t('last_updated')}
                            </AppText>
                        </View>
                    </View>
                </View>

                {/* 4 Core Privacy Pillars Grid */}
                <View style={styles.pillarsSection}>
                    <View style={styles.pillarsGrid}>
                        {PILLARS.map((pillar, idx) => (
                            <View
                                key={idx}
                                style={[
                                    styles.pillarCard,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: isDarkMode ? '#333333' : '#E2E8F0',
                                    }
                                ]}
                            >
                                <View style={[styles.pillarIconCircle, { backgroundColor: isDarkMode ? '#1E293B' : pillar.bg }]}>
                                    <MaterialCommunityIcons name={pillar.icon} size={22} color={pillar.color} />
                                </View>
                                <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text, marginTop: 8, fontSize: 13 }}>
                                    {language === 'kn' ? pillar.titleKn : (language === 'tu' ? pillar.titleTu : (language === 'hi' ? pillar.titleHi : pillar.title))}
                                </AppText>
                                <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 4, fontSize: 11, lineHeight: 15 }}>
                                    {language === 'kn' ? pillar.descKn : (language === 'tu' ? pillar.descTu : (language === 'hi' ? pillar.descHi : pillar.desc))}
                                </AppText>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Section Controls */}
                <View style={styles.sectionHeaderRow}>
                    <AppText variant="heading3" style={{ color: colors.text }}>
                        Detailed Policy Clauses
                    </AppText>
                    <View style={styles.expandCollapseRow}>
                        <TouchableOpacity onPress={expandAll} style={styles.controlPill}>
                            <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700', fontSize: 11 }}>
                                Expand All
                            </AppText>
                        </TouchableOpacity>
                        <AppText variant="caption" style={{ color: colors.border, marginHorizontal: 6 }}>•</AppText>
                        <TouchableOpacity onPress={collapseAll} style={styles.controlPill}>
                            <AppText variant="caption" style={{ color: colors.textMedium, fontWeight: '600', fontSize: 11 }}>
                                Collapse
                            </AppText>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Accordion Policy Sections */}
                <View style={styles.sectionsContainer}>
                    {POLICY_SECTIONS.map((section) => {
                        const isExpanded = !!expandedSections[section.id];
                        const title = getLocalizedTitle(section);
                        const body = getLocalizedBody(section);

                        return (
                            <View
                                key={section.id}
                                style={[
                                    styles.sectionCard,
                                    {
                                        backgroundColor: colors.surface,
                                        borderColor: isExpanded ? colors.primary + '55' : (isDarkMode ? '#262626' : '#E2E8F0'),
                                    }
                                ]}
                            >
                                <TouchableOpacity
                                    style={styles.sectionTitleButton}
                                    onPress={() => toggleSection(section.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.sectionIconBox, { backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9' }]}>
                                        <Feather name={section.icon} size={18} color={colors.primary} />
                                    </View>
                                    <AppText
                                        variant="bodyMedium"
                                        style={[
                                            styles.sectionTitleText,
                                            { color: colors.text, fontWeight: isExpanded ? '700' : '600' }
                                        ]}
                                    >
                                        {title}
                                    </AppText>
                                    <Feather
                                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                        size={18}
                                        color={isExpanded ? colors.primary : colors.textLight}
                                    />
                                </TouchableOpacity>

                                {isExpanded && (
                                    <View style={styles.sectionBody}>
                                        <View style={[styles.sectionDivider, { backgroundColor: isDarkMode ? '#2C2C2C' : '#F1F5F9' }]} />
                                        <AppText variant="bodySmall" style={[styles.sectionBodyText, { color: colors.textMedium }]}>
                                            {body}
                                        </AppText>

                                        {section.points && section.points.length > 0 && (
                                            <View style={styles.pointsList}>
                                                {section.points.map((pt, pIdx) => (
                                                    <View key={pIdx} style={styles.pointRow}>
                                                        <View style={[styles.bulletDot, { backgroundColor: colors.primary }]} />
                                                        <AppText variant="caption" style={[styles.pointText, { color: colors.text }]}>
                                                            {pt}
                                                        </AppText>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* Official Grievance Officer Card */}
                <View style={[styles.dpoCard, { backgroundColor: colors.surface, borderColor: isDarkMode ? '#333' : '#E2E8F0' }]}>
                    <View style={styles.dpoHeader}>
                        <View style={[styles.dpoIconBox, { backgroundColor: '#ECFDF5' }]}>
                            <MaterialCommunityIcons name="badge-account-horizontal-outline" size={24} color="#059669" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text }}>
                                Data Protection Officer (DPO)
                            </AppText>
                            <AppText variant="caption" style={{ color: colors.textMedium }}>
                                Grievance Redressal • DPDP Act 2023
                            </AppText>
                        </View>
                    </View>

                    <AppText variant="bodySmall" style={{ color: colors.textMedium, marginTop: 10, lineHeight: 19 }}>
                        Have a specific query regarding how your plantation scans or account data are handled? Or wish to formally request a copy of your records?
                    </AppText>

                    <TouchableOpacity
                        style={[styles.dpoEmailBtn, { backgroundColor: colors.primary }]}
                        onPress={handleContactDpo}
                        activeOpacity={0.85}
                    >
                        <Feather name="mail" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <AppText variant="bodyMedium" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                            {t('contact_dpo')} (privacy@arecacare.ai)
                        </AppText>
                    </TouchableOpacity>
                </View>

                {/* Footer Legal Attribution */}
                <View style={styles.legalFooter}>
                    <MaterialCommunityIcons name="shield-check-outline" size={16} color={colors.textLight} style={{ marginRight: 6 }} />
                    <AppText variant="caption" style={{ color: colors.textLight, textAlign: 'center' }}>
                        ArecaCare AI Technologies Pvt. Ltd. • All Rights Reserved
                    </AppText>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.background,
    },
    backBtn: {
        padding: 4,
    },
    headerShareBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        paddingBottom: 30,
    },
    heroCard: {
        marginHorizontal: 20,
        marginTop: 18,
        borderRadius: 22,
        overflow: 'hidden',
        backgroundColor: '#064E3B', // Deep Emerald Green
        position: 'relative',
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
    },
    heroGlow: {
        position: 'absolute',
        top: -40,
        right: -40,
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: '#10B981',
        opacity: 0.25,
    },
    heroContent: {
        padding: 20,
    },
    heroBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    shieldIconCircle: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: '#059669',
        justifyContent: 'center',
        alignItems: 'center',
    },
    verifiedTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    heroTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    heroSubtitle: {
        color: '#D1FAE5',
        lineHeight: 20,
        marginBottom: 14,
        fontSize: 13,
    },
    heroFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.15)',
        paddingTop: 10,
    },
    pillarsSection: {
        marginHorizontal: 20,
        marginTop: 20,
    },
    pillarsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    pillarCard: {
        width: '48%',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
    },
    pillarIconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 26,
        marginBottom: 12,
    },
    expandCollapseRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    controlPill: {
        paddingVertical: 2,
        paddingHorizontal: 4,
    },
    sectionsContainer: {
        marginHorizontal: 20,
        gap: 12,
    },
    sectionCard: {
        borderRadius: 16,
        borderWidth: 1,
        overflow: 'hidden',
    },
    sectionTitleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
    },
    sectionIconBox: {
        width: 34,
        height: 34,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    sectionTitleText: {
        flex: 1,
        fontSize: 14,
    },
    sectionBody: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    sectionDivider: {
        height: 1,
        marginBottom: 12,
    },
    sectionBodyText: {
        lineHeight: 20,
        fontSize: 13,
    },
    pointsList: {
        marginTop: 10,
        gap: 8,
    },
    pointRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 6,
        marginRight: 8,
    },
    pointText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 18,
    },
    dpoCard: {
        marginHorizontal: 20,
        marginTop: 24,
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
    },
    dpoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dpoIconBox: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dpoEmailBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        paddingVertical: 12,
        marginTop: 16,
    },
    legalFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
        paddingHorizontal: 20,
    },
});
