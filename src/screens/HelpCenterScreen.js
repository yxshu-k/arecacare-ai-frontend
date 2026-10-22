import React, { useState, useMemo, useContext, useRef } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Linking,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Screen from '../components/Screen';
import AppText from '../components/AppText';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { AuthContext } from '../context/AuthContext';
import { useKeyboard } from '../hooks/useKeyboard';

const FAQ_ITEMS = [
    {
        id: 'faq_1',
        category: 'Disease Diagnosis',
        categoryKn: 'ರೋಗ ಪತ್ತೆ',
        categoryTu: 'ಸೀಕ್ ಪತ್ತೆ',
        categoryHi: 'रोग पहचान',
        categoryTa: 'நோய் கண்டறிதல்',
        categoryTe: 'తెగుళ్ల నిర్ధారణ',
        categoryMl: 'രോഗനിർണ്ണയം',
        question: 'How does AI detect Koleroga (Fruit Rot) and Yellow Leaf Disease?',
        questionKn: 'ಕೊಳೆ ರೋಗ (ಮಹಾಲಿ) ಮತ್ತು ಹಳದಿ ಎಲೆ ರೋಗವನ್ನು AI ಹೇಗೆ ಪತ್ತೆ ಮಾಡುತ್ತದೆ?',
        questionTu: 'ಕೊಳೆ ರೋಗ (ಮಹಾಲಿ) ಬೊಕ್ಕ ಮಂಜೊಲು ಇರೆ ಸೀಕ್ AI ಎಂಚ ಪತ್ತೆ ಮಲ್ಪುಂಡು?',
        questionHi: 'एआई कोलेरोगा (फल सड़न) और पीली पत्ती रोग का कैसे पता लगाता है?',
        questionTa: 'கொளை நோய் (மகாளி) மற்றும் மஞ்சள் இலை நோயை AI எவ்வாறு கண்டறிகிறது?',
        questionTe: 'కొలెరోగ (కాయకుళ్లు) మరియు పసుపు ఆకు తెగులును AI ఎలా గుర్తిస్తుంది?',
        questionMl: 'മഹാളി രോഗവും (കൊളെ രോഗം) മഞ്ഞളിപ്പ് രോഗവും AI എങ്ങനെയാണ് കണ്ടെത്തുന്നത്?',
        answer: 'ArecaCare AI utilizes deep learning vision models trained on tens of thousands of authentic arecanut plantation images across Coastal and Malnad Karnataka. The neural network inspects leaf discoloration patterns, fruit-rot lesions, fungus mycelium growth, and inflorescence damage with over 90% diagnostic accuracy.',
        answerKn: 'ಕರಾವಳಿ ಮತ್ತು ಮಲೆನಾಡಿನ ಸಾವಿರಾರು ಅಡಿಕೆ ತೋಟಗಳ ಚಿತ್ರಗಳಿಂದ ತರಬೇತಿ ಪಡೆದ ಡೀಪ್ ಲರ್ನಿಂಗ್ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ಮಾದರಿಯು ಎಲೆಗಳ ಬಣ್ಣ, ಕಾಯಿಗಳ ಕೊಳೆತ ಹಾಗೂ ಶಿಲೀಂಧ್ರ ಲಕ್ಷಣಗಳನ್ನು ಪರಿಶೀಲಿಸಿ 90% ಕ್ಕೂ ಹೆಚ್ಚಿನ ನಿಖರತೆಯೊಂದಿಗೆ ರೋಗವನ್ನು ಪತ್ತೆ ಮಾಡುತ್ತದೆ.',
        answerTu: 'ಕರಾವಳಿ ಬೊಕ್ಕ ಮಲೆನಾಡ್‌ದ ತೋಟೊಲೆನ ಚಿತ್ರೊಲೆನ್ ಬಳಸಿ ತಯಾರಾಯಿನ AI ಮಾದರಿ, ಕಂಗಿದ ಇರೆ, ಕಾಯಿ ಕೊಳೆತ ಲಕ್ಷಣೊಲೆನ್ ತೂದು ೯೦% ಡ್ದ್ ಜಾಸ್ತಿ ನಿಖರವಾದ್ ಸೀಕ್ ಪತ್ತೆ ಮಲ್ಪುಂಡು.',
        answerHi: 'एरेकाकेयर एआई कर्नाटक के हजारों सुपारी बागानों के नमूनों पर प्रशिक्षित डीप लर्निंग मॉडल का उपयोग करता है। यह पत्ती के धब्बों, फल सड़न और कवक के लक्षणों का विश्लेषण करके 90% से अधिक सटीकता के साथ रोग की पहचान करता है।',
        answerTa: 'ஆயிரக்கணக்கான பாக்கு தோட்டங்களின் படங்களைக் கொண்டு பயிற்சி அளிக்கப்பட்ட டீப் லேர்னிங் AI மாடல், இலைகளின் நிற மாற்றம், காய் அழுகல் மற்றும் பூஞ்சை அறிகுறிகளை 90% க்கும் அதிகமான துல்லியத்துடன் ஆராய்ந்து நோயைக் கண்டறிகிறது.',
        answerTe: 'వేలాది పోకతోటల చిత్రాలతో శిక్షణ పొందిన డీప్ లెర్నింగ్ AI మోడల్, ఆకుల రంగు మార్పులు, కాయ కుళ్లు మరియు శిలీంధ్ర లక్షణాలను 90% కంటే ఎక్కువ ఖచ్చితత్వంతో విశ్లేషించి తెగుళ్లను గుర్తిస్తుంది.',
        answerMl: 'ആയിരക്കണക്കിന് അടയ്ക്ക തോട്ടങ്ങളുടെ ചിത്രങ്ങൾ ഉപയോഗിച്ച് പരിശീലിപ്പിച്ച ഡീപ് ലേണിംഗ് AI മോഡൽ, ഇലകളുടെ നിറവ്യത്യാസം, കായ്ചീയൽ, കുമിൾബാധ എന്നിവ പരിശോധിച്ച് 90 ശതമാനത്തിലധികം കൃത്യതയോടെ രോഗം കണ്ടെത്തുന്നു.'
    },
    {
        id: 'faq_2',
        category: 'Disease Diagnosis',
        categoryKn: 'ರೋಗ ಪತ್ತೆ',
        categoryTu: 'ಸೀಕ್ ಪತ್ತೆ',
        categoryHi: 'रोग पहचान',
        categoryTa: 'நோய் கண்டறிதல்',
        categoryTe: 'తెగుళ్ల నిర్ధారణ',
        categoryMl: 'രോഗനിർണ്ണയം',
        question: 'What is the ideal lighting and distance for scanning arecanut palms?',
        questionKn: 'ಅಡಿಕೆ ಗಿಡ ಅಥವಾ ಕಾಯಿಗಳ ಫೋಟೋ ತೆಗೆಯಲು ಸೂಕ್ತ ಬೆಳಕು ಮತ್ತು ಅಂತರ ಯಾವುದು?',
        questionTu: 'ಕಂಗಿದ ಇರೆ ಅಥವಾ ಕಾಯಿದ ಫೋಟೋ ದೆಪ್ಪೆರೆ ಎಡ್ಡೆ ಬೊಲ್ಪು ಬೊಕ್ಕ ದೂರ ವಾವು?',
        questionHi: 'सुपारी के पेड़ों की फोटो खींचने के लिए सबसे अच्छी रोशनी और दूरी क्या है?',
        questionTa: 'பாக்கு மரங்களை ஸ்கேன் செய்ய சிறந்த வெளிச்சம் மற்றும் தூரம் எது?',
        questionTe: 'పోక చెట్లను స్కాన్ చేయడానికి అనువైన కాంతి మరియు దూరం ఎంత?',
        questionMl: 'കമുകുകൾ സ്കാൻ ചെയ്യുന്നതിന് ഏറ്റവും അനുയോജ്യമായ വെളിച്ചവും ദൂരവും ഏതാണ്?',
        answer: 'Take photos under bright, natural daylight avoiding direct lens glare and sharp shadows. Keep your camera focused 15–30 cm from the infected nut bunch, crown, or leaf blade so the fine fungal texture is sharply visible.',
        answerKn: 'ನೇರ ಬಿಸಿಲಿನ ಹೊಳಪು ಅಥವಾ ನೆರಳು ಇಲ್ಲದ ನೈಸರ್ಗಿಕ ಬೆಳಕಿನಲ್ಲಿ ಫೋಟೋ ತೆಗೆಯಿರಿ. ರೋಗ ಪೀಡಿತ ಕಾಯಿ ಗೊಂಚಲು ಅಥವಾ ಎಲೆಯಿಂದ 15 ರಿಂದ 30 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ಕ್ಯಾಮೆರಾ ಕೇಂದ್ರೀಕರಿಸಿ.',
        answerTu: 'ಎಡ್ಡೆ ಬೊಲ್ಪುಡು, ನೆಳಲು ಇಜ್ಜಂದೆ ಫೋಟೋ ದೆಪ್ಪುಲೆ. ಸೀಕ್ ತಾಗಿದ ಕಾಯಿ ಅಥವಾ ಇರೆಡ್ದ್ 15-30 ಸೆಂ.ಮೀ ದೂರೊಡು ಕ್ಯಾಮೆರಾ ದೀದ್ ಫೋಟೋ ಗೆಪ್ಪುಲೆ.',
        answerHi: 'सीधी धूप की चमक और छाया से बचते हुए प्राकृतिक दिन के उजाले में फोटो लें। संक्रमित फल या पत्ती से 15-30 सेमी की दूरी पर कैमरा रखें।',
        answerTa: 'நேரடி வெயில் அல்லது நிழல் இல்லாமல் நல்ல இயற்கை ஒளியில் படம் எடுக்கவும். பாதிக்கப்பட்ட காய் அல்லது இலையிலிருந்து 15 முதல் 30 செ.மீ தூரத்தில் கேமராவை வைத்து தெளிவாக படம் எடுக்கவும்.',
        answerTe: 'తీవ్రమైన ఎండ లేదా నీడలు లేకుండా సహజమైన పగటి వెలుగులో ఫోటో తీయండి. తెగులు సోకిన కాయ లేదా ఆకు నుండి 15-30 సెం.మీ దూరంలో కెమెరా ఉంచి స్పష్టంగా ఫోటో తీయండి.',
        answerMl: 'നേരിട്ടുള്ള സൂര്യപ്രകാശമോ നിഴലോ ഇല്ലാത്ത സ്വാഭാവിക വെളിച്ചത്തിൽ ഫോട്ടോ എടുക്കുക. ബാധിച്ച അടയ്ക്കയിൽ നിന്നോ ഇലയിൽ നിന്നോ 15-30 സെ.മീ അകലത്തിൽ ക്യാമറ കേന്ദ്രീകരിച്ച് വ്യക്തമായി പകർത്തുക.'
    },
    {
        id: 'faq_3',
        category: 'Weather & Alerts',
        categoryKn: 'ಹವಾಮಾನ & ಎಚ್ಚರಿಕೆ',
        categoryTu: 'ಬರ್ಸ & ಎಚ್ಚರಿಕೆ',
        categoryHi: 'मौसम और चेतावनी',
        categoryTa: 'வானிலை & எச்சரிக்கைகள்',
        categoryTe: 'వాతావరణం & హెచ్చరికలు',
        categoryMl: 'കാലാവസ്ഥ & മുന്നറിയിപ്പുകൾ',
        question: 'How are Taluk-level disease risk warnings calculated?',
        questionKn: 'ತಾಲೂಕು ಮಟ್ಟದ ರೋಗದ ಅಪಾಯದ ಮುನ್ಸೂಚನೆ ಹೇಗೆ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ?',
        questionTu: 'ತಾಲೂಕು ಮಟ್ಟದ ಸೀಕ್ ಬರ್ಪುನ ಅಪಾಯೊ ಎಂಚ ಲೆಕ್ಕ ಪಾಡ್ಪುವೆರ್?',
        questionHi: 'तहसील स्तर पर रोग जोखिम की चेतावनी की गणना कैसे की जाती है?',
        questionTa: 'தாலுகா அளவிலான நோய் ஆபத்து முன்னறிவிப்பு எவ்வாறு கணக்கிடப்படுகிறது?',
        questionTe: 'తాలూకా స్థాయి తెగుళ్ల ప్రమాద హెచ్చరికలు ఎలా లెక్కించబడతాయి?',
        questionMl: 'താലൂക്ക് അടിസ്ഥാനത്തിലുള്ള രോഗസാധ്യത മുന്നറിയിപ്പുകൾ എങ്ങനെയാണ് കണക്കാക്കുന്നത്?',
        answer: 'We continuously process real-time meteorological data including relative humidity (>85%), monsoon rainfall intensity, continuous wet hours, and ambient temperature to calculate fungal sporulation probability specifically for your registered taluk.',
        answerKn: 'ನಿಮ್ಮ ತಾಲೂಕಿನ ಸಾಪೇಕ್ಷ ಆರ್ದ್ರತೆ (೮೫% ಕ್ಕಿಂತ ಹೆಚ್ಚು), ಮಳೆಯ ಪ್ರಮಾಣ, ಗಾಳಿಯ ವೇಗ ಮತ್ತು ತಾಪಮಾನವನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಶಿಲೀಂಧ್ರ ರೋಗ ಹರಡುವ ಸಾಧ್ಯತೆಯನ್ನು ನಿಖರವಾಗಿ ಮುನ್ಸೂಚಿಸಲಾಗುತ್ತದೆ.',
        answerTu: 'ಈರೆನ ತಾಲೂಕುದ ಗಾಳಿಡ್ ಉಪ್ಪುನ ನೀರ್‌ದ ಅಂಸೊ (85% ಡ್ದ್ ಜಾಸ್ತಿ), ಬರ್ಸದ ಲೆಕ್ಕೊ ಬೊಕ್ಕ ತಾಪಮಾನೊನು ಲೆಕ್ಕ ಪಾಡ್‌ದ್ ಸೀಕ್ ಬರ್ಪುನ ಅಪಾಯೊನು ತೆರಿಪಾವೊಲಿ.',
        answerHi: 'हम आपके क्षेत्र के तापमान, आर्द्रता (85% से अधिक) और वर्षा के आंकड़ों का विश्लेषण करते हैं ताकि कवक संक्रमण के जोखिम का सटीक पूर्वानुमान दिया जा सके।',
        answerTa: 'உங்கள் தாலுகாவின் காற்றில் உள்ள ஈரப்பதம் (85% க்கு மேல்), மழையின் அளவு, காற்றின் வேகம் மற்றும் வெப்பநிலையை ஆய்வு செய்து பூஞ்சை நோய் பரவும் அபாயத்தை முன்கூட்டியே கணிக்கிறோம்.',
        answerTe: 'మీ తాలూకా పరిధిలోని గాలిలో తేమ (85% కంటే ఎక్కువ), వర్షపాతం, ఉష్ణోగ్రత డేటాను విశ్లేషించి శిలీంధ్ర తెగుళ్లు వ్యాపించే ప్రమాదాన్ని ఖచ్చితంగా అంచనా వేస్తాము.',
        answerMl: 'നിങ്ങളുടെ താലൂക്കിലെ അന്തരീക്ഷ ഈർപ്പം (85 ശതമാനത്തിൽ കൂടുതൽ), മഴയുടെ അളവ്, താപനില എന്നിവ വിശകലനം ചെയ്ത് കുമിൾ രോഗങ്ങൾ പടരാനുള്ള സാധ്യത കൃത്യമായി മുൻകൂട്ടി അറിയിക്കുന്നു.'
    },
    {
        id: 'faq_4',
        category: 'Weather & Alerts',
        categoryKn: 'ಹವಾಮಾನ & ಎಚ್ಚರಿಕೆ',
        categoryTu: 'ಬರ್ಸ & ಎಚ್ಚರಿಕೆ',
        categoryHi: 'मौसम और चेतावनी',
        categoryTa: 'வானிலை & எச்சரிக்கைகள்',
        categoryTe: 'వాతావరణం & హెచ్చరికలు',
        categoryMl: 'കാലാവസ്ഥ & മുന്നറിയിപ്പുകൾ',
        question: 'When should I spray 1% Bordeaux mixture for Koleroga prevention?',
        questionKn: 'ಕೊಳೆ ರೋಗ ತಡೆಗಟ್ಟಲು ಬೋರ್ಡೋ ದ್ರಾವಣವನ್ನು ಯಾವಾಗ ಸಿಂಪಡಿಸಬೇಕು?',
        questionTu: 'ಕೊಳೆ ರೋಗ ಬರೆರೆ ಬಲ್ಲಿ ಪಂದ್ ಬೋರ್ಡೋ ಮರ್ದ್ ವಾ ಪೊರ್ತುಗು ಪಾಡೊಡು?',
        questionHi: 'कोलेरोगा की रोकथाम के लिए 1% बोर्डो मिश्रण का छिड़काव कब करना चाहिए?',
        questionTa: 'கொளை நோயைத் தடுக்க 1% போர்டோ கலவையை எப்போது தெளிக்க வேண்டும்?',
        questionTe: 'కొలెరోగ నివారణకు 1% బోర్డో మిశ్రమాన్ని ఎప్పుడు పిచికారీ చేయాలి?',
        questionMl: 'മഹാളി രോഗം തടയാൻ 1% ബോർഡോ മിശ്രിതം എപ്പോഴാണ് തളിക്കേണ്ടത്?',
        answer: 'The first prophylactic spray of 1% Bordeaux mixture must be applied just before the onset of the Southwest monsoon (late May to early June). A second spray is recommended 40–45 days later, ideally on clear sunny breaks between rains.',
        answerKn: 'ಮುಂಗಾರು ಮಳೆ ಪ್ರಾರಂಭವಾಗುವ ಮುನ್ನ (ಮೇ ಅಂತ್ಯ ಅಥವಾ ಜೂನ್ ಮೊದಲ ವಾರ) ಮೊದಲ ಮುನ್ನೆಚ್ಚರಿಕೆ ಸಿಂಪಡಣೆ ಮಾಡಬೇಕು. ನಂತರ 40-45 ದಿನಗಳ ಬಳಿಕ ಮಳೆ ಬಿಡುವು ನೀಡಿದಾಗ ಎರಡನೇ ಬಾರಿ ಸಿಂಪಡಿಸಬೇಕು.',
        answerTu: 'ಮಳೆಗಾಲ ಸುರು ಆಪುನೆಗ್ ದುಂಬು (ಮೇ ಕಡೆಟ್ ಅತ್ತ್ಂಡ ಜೂನ್ ಸುರುಟು) ಸುರುತ್ತ ಮರ್ದ್ ಪಾಡೊಡು. ಬೊಕ್ಕ 40-45 ದಿನ ಕರಿತ್‌ದ್ ಮಳೆ ಉಂತಿನಾಗ ರಡ್ಡನೇ ಬಾರಿ ಪಾಡೊಡು.',
        answerHi: 'मानसून शुरू होने से ठीक पहले (मई के अंत या जून की शुरुआत) 1% बोर्डो मिश्रण का पहला छिड़काव करें। दूसरा छिड़काव 40-45 दिनों के बाद बारिश के अंतराल में करें।',
        answerTa: 'தென்மேற்கு பருவமழை தொடங்குவதற்கு சற்று முன்பு (மே மாத இறுதி அல்லது ஜூன் தொடக்கத்தில்) முதல் தடுப்புத் தெளிப்பு செய்ய வேண்டும். 40-45 நாட்களுக்குப் பிறகு மழை விட்டிருக்கும் நேரத்தில் இரண்டாவது தெளிப்பு செய்ய வேண்டும்.',
        answerTe: 'నైరుతి రుతుపవనాలు ప్రారంభమయ్యే ముందు (మే చివరి లేదా జూన్ మొదటి వారం) 1% బోర్డో మిశ్రమాన్ని మొదటిసారి పిచికారీ చేయాలి. ఆ తర్వాత 40-45 రోజుల వ్యవధిలో వర్షం తగ్గినప్పుడు రెండోసారి పిచికారీ చేయాలి.',
        answerMl: 'കാലവർഷം ആരംഭിക്കുന്നതിന് തൊട്ടുമുമ്പ് (മെയ് അവസാനം അല്ലെങ്കിൽ ജൂൺ ആദ്യം) 1% ബോർഡോ മിശ്രിതം ആദ്യ തവണ തളിക്കണം. 40-45 ദിവസങ്ങൾക്ക് ശേഷം മഴയുടെ ഇടവേളയിൽ രണ്ടാമതും തളിക്കുക.'
    },
    {
        id: 'faq_5',
        category: 'Farms & Yield',
        categoryKn: 'ತೋಟ & ಇಳುವರಿ',
        categoryTu: 'ತೋಟ & ಇಳುವರಿ',
        categoryHi: 'खेत और उपज',
        categoryTa: 'தோட்டம் & விளைச்சல்',
        categoryTe: 'తోట & దిగుబడి',
        categoryMl: 'തോട്ടം & വിളവ്',
        question: 'How does the Yield Calculator estimate arecanut output?',
        questionKn: 'ಇಳುವರಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಅಡಿಕೆ ಫಸಲನ್ನು ಹೇಗೆ ಅಂದಾಜಿಸುತ್ತದೆ?',
        questionTu: 'ಇಳುವರಿ ಕ್ಯಾಲ್ಕುಲೇಟರ್ ಅಡಿಕೆ ಬೆಳೆನ್ ಎಂಚ ಅಂದಾಜಿ ಮಲ್ಪುಂಡು?',
        questionHi: 'उपज कैलकुलेटर सुपारी की उपज का अनुमान कैसे लगाता है?',
        questionTa: 'விளைச்சல் கால்குலேட்டர் பாக்கு உற்பத்தியை எவ்வாறு கணக்கிடுகிறது?',
        questionTe: 'దిగుబడి కాలిక్యులేటర్ పోక దిగుబడిని ఎలా అంచనా వేస్తుంది?',
        questionMl: 'വിളവ് കാൽക്കുലേറ്റർ അടയ്ക്ക ഉത്പാദനം എങ്ങനെയാണ് കണക്കാക്കുന്നത്?',
        answer: 'The calculation takes into account your palm density per acre, bearing palm age (palms reach peak economic yield between 8 to 25 years), soil type (Laterite vs Loamy), and regional historical yield curves across Karnataka.',
        answerKn: 'ಪ್ರತಿ ಎಕರೆಯ ಮರಗಳ ಸಾಂದ್ರತೆ, ಫಲ ನೀಡುವ ಮರಗಳ ವಯಸ್ಸು (೮ ರಿಂದ ೨೫ ವರ್ಷಗಳ ಗರಿಷ್ಠ ಇಳುವರಿ), ಮಣ್ಣಿನ ವಿಧ ಮತ್ತು ಕರ್ನಾಟಕದ ಸರಾಸರಿ ಬೆಳೆ ಅಂಕಿಅಂಶಗಳನ್ನು ಆಧರಿಸಿ ಇಳುವರಿ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತದೆ.',
        answerTu: 'ಎಕರೆಡ್ ಉಪ್ಪುನ ಕಂಗಿದ ಸಂಖ್ಯೆ, ಮರಕುಲೆನ ಪ್ರಾಯೊ (8 ಡ್ದ್ 25 ವರ್ಷೊಡು ಜಾಸ್ತಿ ಕಾಯಿ), ಮಣ್ಣ್‌ದ ನಮೂನೆನ್ ಲೆಕ್ಕ ಪಾಡ್‌ದ್ ಬರ್ಪುನ ಬೆಳೆನ್ ಅಂದಾಜಿ ಮಲ್ಪುಂಡು.',
        answerHi: 'यह प्रति एकड़ पेड़ों की संख्या, पेड़ों की उम्र (8 से 25 वर्ष में सबसे अधिक उपज), मिट्टी के प्रकार और क्षेत्रीय उत्पादन पैटर्न के आधार पर उपज का अनुमान लगाता है।',
        answerTa: 'ஏக்கருக்கு மரங்களின் எண்ணிக்கை, காய்க்கும் மரங்களின் வயது (8 முதல் 25 ஆண்டுகள் அதிக விளைச்சல்), மண் வகை மற்றும் வரலாற்று விளைச்சல் மாதிரிகளின் அடிப்படையில் கணக்கிடப்படுகிறது.',
        answerTe: 'ఎకరాకు చెట్ల సాంద్రత, కాపు కాసే చెట్ల వయస్సు (8 నుండి 25 సంవత్సరాలు గరిష్ట దిగుబడి), నేల రకం మరియు ప్రాంతీయ సగటు దిగుబడి ఆధారంగా లెక్కించబడుతుంది.',
        answerMl: 'ഏക്കറിലെ കമുകുകളുടെ എണ്ണം, കായ്ക്കുന്ന പ്രായം (8 മുതൽ 25 വർഷം വരെ പരമാവധി വിളവ്), മണ്ണിന്റെ ഇനം, പ്രാദേശിക വിളവ് വിവരങ്ങൾ എന്നിവ അടിസ്ഥാനമാക്കിയാണ് കണക്കാക്കുന്നത്.'
    },
    {
        id: 'faq_6',
        category: 'Offline & Sync',
        categoryKn: 'ಆಫ್‌ಲೈನ್ & ಸಿಂಕ್',
        categoryTu: 'ಆಫ್‌ಲೈನ್ & ಸಿಂಕ್',
        categoryHi: 'ऑफ़लाइन और सिंक',
        categoryTa: 'ஆஃப்லைன் & ஒத்திசைவு',
        categoryTe: 'ఆఫ్‌లైన్ & సింక్',
        categoryMl: 'ഓഫ്‌ലൈൻ & സമന്വയം',
        question: 'Can I capture plant photos when there is no cellular network?',
        questionKn: 'ಮೊಬೈಲ್ ನೆಟ್‌ವರ್ಕ್ ಇಲ್ಲದಿದ್ದಾಗಲೂ ಫೋಟೋ ತೆಗೆದು ರೋಗ ಪರೀಕ್ಷಿಸಬಹುದೇ?',
        questionTu: 'ಮೊಬೈಲ್ ನೆಟ್‌ವರ್ಕ್ ಇಜ್ಜಂದಿನ ಪೊರ್ತುಡು ಫೋಟೋ ದೆತ್ತ್‌ದ್ ತೂವೊಲಿಯೇ?',
        questionHi: 'क्या मोबाइल नेटवर्क न होने पर भी पौधे की फोटो खींच सकते हैं?',
        questionTa: 'மொபைல் நெட்வொர்க் இல்லாதபோது பயிர் படங்களை எடுத்து பரிசோதிக்க முடியுமா?',
        questionTe: 'మొబైల్ నెట్‌వర్క్ లేనప్పుడు కూడా పంట ఫోటోలు తీసి పరిశీలించవచ్చా?',
        questionMl: 'മൊബൈൽ നെറ്റ്‌വർക്ക് ഇല്ലാത്തപ്പോൾ ചെടിയുടെ ഫോട്ടോ എടുത്ത് പരിശോധിക്കാൻ കഴിയുമോ?',
        answer: 'Yes! ArecaCare AI includes an offline queueing system. Photos taken in deep plantation valleys without signal are stored securely on your phone and automatically analyzed as soon as network connection is restored.',
        answerKn: 'ಹೌದು! ತೋಟದಲ್ಲಿ ನೆಟ್‌ವರ್ಕ್ ಇಲ್ಲದಿದ್ದರೂ ಫೋಟೋಗಳನ್ನು ಸಂಗ್ರಹಿಸಲಾಗುತ್ತದೆ ಮತ್ತು ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕ ದೊರೆತ ತಕ್ಷಣ ಸ್ವಯಂಚಾಲಿತವಾಗಿ AI ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಳ್ಳುತ್ತದೆ.',
        answerTu: 'ಅಂದ್! ತೋಟೊಡು ಸಿಗ್ನಲ್ ಇಜ್ಜಾಂಡಲಾ ಫೋಟೋ ಫೋನ್‌ಡ್ ಸೇವ್ ಆಪುಂಡು. ಇಂಟರ್ನೆಟ್ ತಿಕ್ಕಿನ ಕೂಡ್ಲೇ AI ಪರೀಕ್ಷೆ ಮಲ್ತ್ ಫಲಿತಾಂಶ ತೋಜಾವುಂಡು.',
        answerHi: 'हाँ! एरेकाकेयर एआई में ऑफ़लाइन सुविधा है। नेटवर्क न होने पर खींची गई तस्वीरें सुरक्षित रहती हैं और इंटरनेट मिलने पर अपने आप विश्लेषित हो जाती हैं।',
        answerTa: 'ஆம்! அரேக்காகேர் AI இல் ஆஃப்லைன் வசதி உள்ளது. நெட்வொர்க் இல்லாதபோது எடுக்கப்பட்ட படங்கள் போனில் பாதுகாப்பாக சேமிக்கப்பட்டு, இணையம் கிடைத்தவுடன் தானாகவே AI பகுப்பாய்வு செய்யப்படும்.',
        answerTe: 'అవును! అరేకాకేర్ AI లో ఆఫ్‌లైన్ సౌకర్యం ఉంది. నెట్‌వర్క్ లేనప్పుడు తీసిన ఫోటోలు ఫోన్‌లో సురక్షితంగా ఉంటాయి మరియు ఇంటర్నెట్ రాగానే ఆటోమేటిక్‌గా విశ్లేషించబడతాయి.',
        answerMl: 'അതെ! അരെക്കകെയർ AI-ൽ ഓഫ്‌ലൈൻ സൗകര്യമുണ്ട്. നെറ്റ്‌വർക്ക് ഇല്ലാത്തപ്പോൾ എടുക്കുന്ന ഫോട്ടോകൾ ഫോണിൽ സൂക്ഷിക്കുകയും ഇന്റർനെറ്റ് ലഭിക്കുമ്പോൾ സ്വയമേവ പരിശോധിക്കുകയും ചെയ്യും.'
    },
    {
        id: 'faq_7',
        category: 'Account',
        categoryKn: 'ಖಾತೆ',
        categoryTu: 'ಖಾತೆ',
        categoryHi: 'खाता',
        categoryTa: 'கணக்கு',
        categoryTe: 'ఖాతా',
        categoryMl: 'അക്കൗണ്ട്',
        question: 'How do I change the application dialect to Kannada, Tulu, Hindi, Tamil, Telugu, or Malayalam?',
        questionKn: 'ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆಯನ್ನು ಕನ್ನಡ, ತುಳು, ಹಿಂದಿ, ತಮಿಳು, ತೆಲುಗು ಅಥವಾ ಮಲಯಾಳಂಗೆ ಬದಲಾಯಿಸುವುದು ಹೇಗೆ?',
        questionTu: 'ಆಪ್‌ದ ಬಾಸೆನ್ ತುಳು, ಕನ್ನಡ, ಹಿಂದಿ, ತಮಿಳು, ತೆಲುಗು ಅತ್ತ್ಂಡ ಮಲಯಾಳಂಗಿ ಬದಲಾವಣೆ ಮಲ್ಪುನೆ ಎಂಚ?',
        questionHi: 'ऐप की भाषा को कन्नड़, तुलु, हिंदी, तमिल, तेलुगु या मलयालम में कैसे बदलें?',
        questionTa: 'பயன்பாட்டு மொழியை தமிழ், தெலுங்கு, மலையாளம் போன்ற மொழிகளுக்கு மாற்றுவது எப்படி?',
        questionTe: 'యాప్ భాషను తెలుగు, తమిళం, మలయాళం మొదలైన భాషలకు ఎలా మార్చాలి?',
        questionMl: 'ആപ്പ് ഭാഷ മലയാളം, തമിഴ്, തെലുങ്ക് തുടങ്ങിയ ഭാഷകളിലേക്ക് മാറ്റുന്നത് എങ്ങനെ?',
        answer: 'Navigate to the Profile tab > App Language, choose your preferred regional language (English, ಕನ್ನಡ, ತುಳು, हिन्दी, தமிழ், తెలుగు, മലയാളം), and tap "Apply Language". All pages, bottom tabs, and AgriBot responses instantly update.',
        answerKn: 'ಪ್ರೊಫೈಲ್ ಟ್ಯಾಬ್ > ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ (App Language) ಗೆ ಹೋಗಿ, ನಿಮ್ಮ ಆಯ್ಕೆಯ ಭಾಷೆಯನ್ನು ಆರಿಸಿ "Apply Language" ಒತ್ತಿರಿ. ಇಡೀ ಅಪ್ಲಿಕೇಶನ್ ತಕ್ಷಣವೇ ಬದಲಾಗುತ್ತದೆ.',
        answerTu: 'ಪ್ರೊಫೈಲ್ ಪುಟೊಕ್ಕು ಪೋದು "App Language" ಆಯ್ಕೆ ಮಲ್ಪುಲೆ, ಅಲ್ಪ ಈರೆನ ಭಾಷೆ ಆಯ್ಕೆ ಮಲ್ತ್‌ದ್ "Apply Language" ಒತ್ತುಲೆ.',
        answerHi: 'प्रोफ़ाइल टैब > ऐप भाषा (App Language) पर जाएं, अपनी पसंदीदा भाषा चुनें और "Apply Language" दबाएं। पूरी ऐप तुरंत बदल जाएगी।',
        answerTa: 'சுயவிவரம் (Profile) > பயன்பாட்டு மொழி (App Language) சென்று உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுத்து "Apply Language" என்பதைத் தட்டவும். முழு பயன்பாடும் உடனடியாக மாறும்.',
        answerTe: 'ప్రొఫైల్ ట్యాబ్ > యాప్ భాష (App Language) కు వెళ్లి మీ భాషను ఎంచుకుని "Apply Language" నొక్కండి. యాప్ మొత్తం తక్షణమే మారుతుంది.',
        answerMl: 'പ്രൊഫൈൽ ടാബ് > ആപ്പ് ഭാഷ (App Language) എന്നതിലേക്ക് പോയി ഇഷ്ടമുള്ള ഭാഷ തിരഞ്ഞെടുത്ത് "Apply Language" അമർത്തുക. മുഴുവൻ ആപ്പും തൽക്ഷണം മാറും.'
    }
];

export default function HelpCenterScreen({ navigation }) {
    const { colors, isDarkMode } = useTheme();
    const { language, t } = useLanguage();
    const { userData } = useContext(AuthContext);
    const styles = useMemo(() => getStyles(colors, isDarkMode), [colors, isDarkMode]);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [expandedFaqId, setExpandedFaqId] = useState('faq_1');

    // Feedback ticket form state
    const [inquiryTopic, setInquiryTopic] = useState('Disease Help');
    const [inquiryMessage, setInquiryMessage] = useState('');
    const [submittingInquiry, setSubmittingInquiry] = useState(false);
    const scrollRef = useRef(null);
    const { keyboardHeight, isKeyboardVisible } = useKeyboard();

    const categories = ['All', 'Disease Diagnosis', 'Weather & Alerts', 'Farms & Yield', 'Offline & Sync', 'Account'];

    // Dialect helper for FAQs
    const getFaqText = (item, field) => {
        if (language === 'kn') {
            if (field === 'q') return item.questionKn || item.question;
            if (field === 'a') return item.answerKn || item.answer;
            if (field === 'c') return item.categoryKn || item.category;
        } else if (language === 'tu') {
            if (field === 'q') return item.questionTu || item.question;
            if (field === 'a') return item.answerTu || item.answer;
            if (field === 'c') return item.categoryTu || item.category;
        } else if (language === 'hi') {
            if (field === 'q') return item.questionHi || item.question;
            if (field === 'a') return item.answerHi || item.answer;
            if (field === 'c') return item.categoryHi || item.category;
        } else if (language === 'ta') {
            if (field === 'q') return item.questionTa || item.question;
            if (field === 'a') return item.answerTa || item.answer;
            if (field === 'c') return item.categoryTa || item.category;
        } else if (language === 'te') {
            if (field === 'q') return item.questionTe || item.question;
            if (field === 'a') return item.answerTe || item.answer;
            if (field === 'c') return item.categoryTe || item.category;
        } else if (language === 'ml') {
            if (field === 'q') return item.questionMl || item.question;
            if (field === 'a') return item.answerMl || item.answer;
            if (field === 'c') return item.categoryMl || item.category;
        }
        if (field === 'q') return item.question;
        if (field === 'a') return item.answer;
        return item.category;
    };

    // Filtered FAQ list
    const filteredFaqs = useMemo(() => {
        return FAQ_ITEMS.filter(item => {
            const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
            const qText = getFaqText(item, 'q').toLowerCase();
            const aText = getFaqText(item, 'a').toLowerCase();
            const query = searchQuery.trim().toLowerCase();
            const matchesQuery = query === '' || qText.includes(query) || aText.includes(query);
            return matchesCat && matchesQuery;
        });
    }, [selectedCategory, searchQuery, language]);

    const handleCallHelpline = () => {
        Alert.alert(
            t('kisan_helpline') || 'Kisan Toll-Free Helpline',
            'Connect with agricultural experts at the Central Kisan Call Center (Toll-Free 1800-180-1551)?',
            [
                { text: t('cancel') || 'Cancel', style: 'cancel' },
                {
                    text: t('call_now') || 'Call 1800-180-1551',
                    onPress: () => Linking.openURL('tel:18001801551').catch(() => {
                        Alert.alert('Call Failed', 'Unable to open phone dialer on this device.');
                    })
                }
            ]
        );
    };

    const handleOpenWhatsApp = () => {
        const text = encodeURIComponent('Hello ArecaCare AI Support! I am an arecanut farmer seeking agronomy assistance with my plantation.');
        const url = `whatsapp://send?phone=917899782417&text=${text}`;
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                Linking.openURL(`https://wa.me/917899782417?text=${text}`).catch(() => {
                    Alert.alert('WhatsApp Unavailable', 'Please install WhatsApp or contact our toll-free helpline.');
                });
            }
        });
    };

    const handleSendEmail = () => {
        const subject = encodeURIComponent(`ArecaCare Support Inquiry - ${userData?.name || 'Farmer'}`);
        const body = encodeURIComponent(`Farmer Name: ${userData?.name || 'N/A'}\nPhone/Account: ${userData?.phone || userData?.email || 'N/A'}\nRegion: ${userData?.region || 'Karnataka'}\n\nMy Question or Issue:\n`);
        Linking.openURL(`mailto:support@arecacare.ai?subject=${subject}&body=${body}`).catch(() => {
            Alert.alert('Email Client Missing', 'Please write directly to support@arecacare.ai');
        });
    };

    const handleOpenAgriBot = () => {
        navigation.navigate('ChatAssistant');
    };

    const handleSubmitInquiry = async () => {
        if (!inquiryMessage.trim()) {
            Alert.alert(t('error') || 'Required Field', 'Please describe your farming question or issue.');
            return;
        }

        try {
            setSubmittingInquiry(true);
            // Simulate network receipt
            await new Promise(res => setTimeout(res, 900));
            setSubmittingInquiry(false);
            setInquiryMessage('');
            Alert.alert(
                t('success') || 'Inquiry Submitted',
                'Your agronomy query has been logged. An arecanut specialist will review your farm data and advise within 24 hours.'
            );
        } catch (e) {
            setSubmittingInquiry(false);
            Alert.alert(t('error') || 'Submission Failed', 'Could not send inquiry. Please call the helpline.');
        }
    };

    return (
        <Screen style={styles.screen} noPadding>
            {/* Native Header */}
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
                        {t('help_center')}
                    </AppText>
                    <AppText variant="caption" style={{ color: colors.textMedium }}>
                        24/7 Farmer Assistance & Advisory
                    </AppText>
                </View>
                <TouchableOpacity onPress={handleCallHelpline} style={styles.headerCallBtn}>
                    <Feather name="phone-call" size={18} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
                style={{ flex: 1 }}
            >
                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={[
                        styles.scroll,
                        { paddingBottom: isKeyboardVisible ? keyboardHeight + 80 : 40 }
                    ]}
                >

                    {/* Search Bar */}
                    <View style={styles.searchContainer}>
                        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <Feather name="search" size={18} color={colors.textLight} style={{ marginRight: 8 }} />
                            <TextInput
                                style={[styles.searchInput, { color: colors.text }]}
                                placeholder={t('search_help_placeholder')}
                                placeholderTextColor={colors.textLight}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                clearButtonMode="while-editing"
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Feather name="x" size={16} color={colors.textLight} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* Quick Support Channels Grid */}
                    <View style={styles.channelsSection}>
                        <AppText variant="caption" style={[styles.sectionTitle, { color: colors.primary }]}>
                            {t('support_channels').toUpperCase()}
                        </AppText>

                        <View style={styles.channelsGrid}>
                            {/* Kisan Helpline */}
                            <TouchableOpacity
                                style={[styles.channelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={handleCallHelpline}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.channelIconBox, { backgroundColor: '#ECFDF5' }]}>
                                    <Feather name="phone-call" size={20} color="#059669" />
                                </View>
                                <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text, marginTop: 8 }}>
                                    Kisan Helpline
                                </AppText>
                                <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 2, fontSize: 11 }}>
                                    1800-180-1551 (Toll-Free)
                                </AppText>
                                <View style={styles.actionPill}>
                                    <AppText variant="caption" style={{ color: '#059669', fontWeight: 'bold', fontSize: 11 }}>
                                        {t('call_now')} ›
                                    </AppText>
                                </View>
                            </TouchableOpacity>

                            {/* AgriBot AI Live Chat */}
                            <TouchableOpacity
                                style={[styles.channelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={handleOpenAgriBot}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.channelIconBox, { backgroundColor: '#EFF6FF' }]}>
                                    <MaterialCommunityIcons name="robot-outline" size={22} color="#2563EB" />
                                </View>
                                <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text, marginTop: 8 }}>
                                    AgriBot AI
                                </AppText>
                                <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 2, fontSize: 11 }}>
                                    24/7 Crop Intelligence
                                </AppText>
                                <View style={styles.actionPill}>
                                    <AppText variant="caption" style={{ color: '#2563EB', fontWeight: 'bold', fontSize: 11 }}>
                                        {t('chat_now')} ›
                                    </AppText>
                                </View>
                            </TouchableOpacity>

                            {/* WhatsApp Agronomist */}
                            <TouchableOpacity
                                style={[styles.channelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={handleOpenWhatsApp}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.channelIconBox, { backgroundColor: '#F0FDF4' }]}>
                                    <MaterialCommunityIcons name="whatsapp" size={22} color="#16A34A" />
                                </View>
                                <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text, marginTop: 8 }}>
                                    WhatsApp Desk
                                </AppText>
                                <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 2, fontSize: 11 }}>
                                    Share Photos with Experts
                                </AppText>
                                <View style={styles.actionPill}>
                                    <AppText variant="caption" style={{ color: '#16A34A', fontWeight: 'bold', fontSize: 11 }}>
                                        Connect ›
                                    </AppText>
                                </View>
                            </TouchableOpacity>

                            {/* Email Support */}
                            <TouchableOpacity
                                style={[styles.channelCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={handleSendEmail}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.channelIconBox, { backgroundColor: '#FEF3C7' }]}>
                                    <Feather name="mail" size={20} color="#D97706" />
                                </View>
                                <AppText variant="bodyMedium" style={{ fontWeight: '700', color: colors.text, marginTop: 8 }}>
                                    Email Desk
                                </AppText>
                                <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 2, fontSize: 11 }}>
                                    support@arecacare.ai
                                </AppText>
                                <View style={styles.actionPill}>
                                    <AppText variant="caption" style={{ color: '#D97706', fontWeight: 'bold', fontSize: 11 }}>
                                        Write ›
                                    </AppText>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* FAQ Section */}
                    <View style={styles.faqSection}>
                        <View style={styles.faqHeaderRow}>
                            <View>
                                <AppText variant="caption" style={[styles.sectionTitle, { color: colors.primary }]}>
                                    {t('faqs').toUpperCase()}
                                </AppText>
                                <AppText variant="heading3" style={{ color: colors.text }}>
                                    Frequently Answered Questions
                                </AppText>
                            </View>
                            <View style={styles.faqCountBadge}>
                                <AppText variant="caption" style={{ color: colors.primary, fontWeight: 'bold' }}>
                                    {filteredFaqs.length} Guides
                                </AppText>
                            </View>
                        </View>

                        {/* Category Filter Chips */}
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[
                                        styles.categoryChip,
                                        selectedCategory === cat && { backgroundColor: colors.primary, borderColor: colors.primary }
                                    ]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <AppText
                                        variant="caption"
                                        style={{
                                            color: selectedCategory === cat ? '#FFFFFF' : colors.textMedium,
                                            fontWeight: selectedCategory === cat ? 'bold' : '500',
                                        }}
                                    >
                                        {cat}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Accordion FAQ Items */}
                        <View style={styles.faqList}>
                            {filteredFaqs.length === 0 ? (
                                <View style={[styles.emptyFaqBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                    <Feather name="help-circle" size={32} color={colors.textLight} />
                                    <AppText variant="bodyMedium" style={{ color: colors.text, marginTop: 8, fontWeight: 'bold' }}>
                                        No guides found
                                    </AppText>
                                    <AppText variant="caption" style={{ color: colors.textMedium, textAlign: 'center', marginTop: 4 }}>
                                        Try adjusting your search terms or send us an inquiry below.
                                    </AppText>
                                </View>
                            ) : (
                                filteredFaqs.map(item => {
                                    const isExpanded = expandedFaqId === item.id;
                                    return (
                                        <View
                                            key={item.id}
                                            style={[
                                                styles.faqAccordionCard,
                                                { backgroundColor: colors.surface, borderColor: isExpanded ? colors.primary : colors.border },
                                                isExpanded && { borderWidth: 1.5 }
                                            ]}
                                        >
                                            <TouchableOpacity
                                                style={styles.faqQuestionRow}
                                                onPress={() => setExpandedFaqId(isExpanded ? null : item.id)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={styles.faqQuestionLeft}>
                                                    <View style={[styles.catPill, { backgroundColor: isDarkMode ? '#064E3B40' : '#ECFDF5' }]}>
                                                        <AppText variant="caption" style={{ color: colors.primary, fontSize: 10, fontWeight: '700' }}>
                                                            {getFaqText(item, 'c')}
                                                        </AppText>
                                                    </View>
                                                    <AppText variant="bodyMedium" style={{ color: colors.text, fontWeight: '700', marginTop: 6, lineHeight: 22 }}>
                                                        {getFaqText(item, 'q')}
                                                    </AppText>
                                                </View>
                                                <View style={[styles.chevronBox, { backgroundColor: isExpanded ? colors.primary : (isDarkMode ? '#27272A' : '#F1F5F9') }]}>
                                                    <Feather
                                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                                        size={16}
                                                        color={isExpanded ? '#FFFFFF' : colors.textMedium}
                                                    />
                                                </View>
                                            </TouchableOpacity>

                                            {isExpanded && (
                                                <View style={styles.faqAnswerContainer}>
                                                    <View style={[styles.faqAnswerDivider, { backgroundColor: colors.border }]} />
                                                    <AppText variant="bodyMedium" style={{ color: colors.textMedium, lineHeight: 22, marginTop: 10 }}>
                                                        {getFaqText(item, 'a')}
                                                    </AppText>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    </View>

                    {/* Inquiry Submission Box */}
                    <View style={[styles.inquiryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={styles.inquiryHeader}>
                            <View style={[styles.inquiryIconCircle, { backgroundColor: '#ECFDF5' }]}>
                                <Feather name="message-square" size={20} color="#059669" />
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <AppText variant="heading3" style={{ color: colors.text }}>
                                    {t('ask_question')}
                                </AppText>
                                <AppText variant="caption" style={{ color: colors.textMedium }}>
                                    Send detailed farm questions directly to arecanut specialists
                                </AppText>
                            </View>
                        </View>

                        <View style={styles.inquiryForm}>
                            <AppText variant="caption" style={[styles.formLabel, { color: colors.textMedium }]}>
                                INQUIRY CATEGORY
                            </AppText>
                            <View style={styles.topicChipsRow}>
                                {['Disease Help', 'Fertilizer Advice', 'Yield Guidance', 'App Technical'].map(topic => (
                                    <TouchableOpacity
                                        key={topic}
                                        style={[
                                            styles.topicChip,
                                            inquiryTopic === topic && { backgroundColor: isDarkMode ? '#064E3B' : '#ECFDF5', borderColor: colors.primary }
                                        ]}
                                        onPress={() => setInquiryTopic(topic)}
                                    >
                                        <AppText
                                            variant="caption"
                                            style={{
                                                color: inquiryTopic === topic ? colors.primary : colors.text,
                                                fontWeight: inquiryTopic === topic ? 'bold' : '500',
                                                fontSize: 11
                                            }}
                                        >
                                            {topic}
                                        </AppText>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <AppText variant="caption" style={[styles.formLabel, { color: colors.textMedium, marginTop: 14 }]}>
                                YOUR QUESTION OR REMARKS
                            </AppText>
                            <TextInput
                                style={[styles.inquiryInput, { color: colors.text, borderColor: colors.border, backgroundColor: isDarkMode ? '#1E1E1E' : '#F8FAFC' }]}
                                placeholder="Describe symptoms, palm count, weather condition, or any question..."
                                placeholderTextColor={colors.textLight}
                                multiline
                                numberOfLines={4}
                                value={inquiryMessage}
                                onChangeText={setInquiryMessage}
                                maxLength={500}
                                onFocus={() => {
                                    setTimeout(() => {
                                        scrollRef.current?.scrollToEnd({ animated: true });
                                    }, 120);
                                }}
                            />
                            <AppText variant="caption" style={{ color: colors.textLight, textAlign: 'right', marginTop: 4, fontSize: 11 }}>
                                {inquiryMessage.length}/500
                            </AppText>

                            <TouchableOpacity
                                style={[styles.submitInquiryBtn, { backgroundColor: colors.primary }]}
                                onPress={handleSubmitInquiry}
                                disabled={submittingInquiry}
                                activeOpacity={0.85}
                            >
                                {submittingInquiry ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <>
                                        <Feather name="send" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                                        <AppText variant="bodyLarge" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>
                                            {t('submit_inquiry')}
                                        </AppText>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Regional Agricultural Institutes Info Card */}
                    <View style={styles.instituteCard}>
                        <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700', letterSpacing: 0.5, marginBottom: 8 }}>
                            OFFICIAL RESEARCH INSTITUTES
                        </AppText>
                        <AppText variant="bodyMedium" style={{ color: colors.text, fontWeight: '600' }}>
                            ICAR - CPCRI Regional Station, Vittal
                        </AppText>
                        <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 2, lineHeight: 18 }}>
                            Dakshina Kannada, Karnataka 574243 • Arecanut Research Center
                        </AppText>
                        <View style={styles.instituteDivider} />
                        <AppText variant="bodyMedium" style={{ color: colors.text, fontWeight: '600' }}>
                            UAHS College of Horticulture, Shivamogga
                        </AppText>
                        <AppText variant="caption" style={{ color: colors.textMedium, marginTop: 2, lineHeight: 18 }}>
                            Navile, Shivamogga, Karnataka 577204 • Palm Disease Advisory Cell
                        </AppText>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </Screen>
    );
}

const getStyles = (colors, isDarkMode) => StyleSheet.create({
    screen: { backgroundColor: colors.background, flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 16,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    backBtn: {
        padding: 4,
        marginLeft: -4,
    },
    headerCallBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scroll: {
        paddingBottom: 40,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    channelsSection: {
        paddingHorizontal: 20,
        marginTop: 14,
    },
    sectionTitle: {
        fontWeight: '700',
        letterSpacing: 0.6,
        fontSize: 11,
        marginBottom: 10,
    },
    channelsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    channelCard: {
        width: '48%',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
    },
    channelIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionPill: {
        marginTop: 12,
        alignSelf: 'flex-start',
    },
    faqSection: {
        paddingHorizontal: 20,
        marginTop: 24,
    },
    faqHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 12,
    },
    faqCountBadge: {
        backgroundColor: isDarkMode ? '#064E3B40' : '#ECFDF5',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    chipScroll: {
        marginBottom: 14,
    },
    categoryChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.border,
        marginRight: 8,
        backgroundColor: colors.surface,
    },
    faqList: {
        gap: 10,
    },
    emptyFaqBox: {
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    faqAccordionCard: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
    },
    faqQuestionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    faqQuestionLeft: {
        flex: 1,
        paddingRight: 10,
    },
    catPill: {
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
    },
    chevronBox: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
    },
    faqAnswerContainer: {
        marginTop: 8,
    },
    faqAnswerDivider: {
        height: 1,
        width: '100%',
        marginTop: 6,
    },
    inquiryCard: {
        marginHorizontal: 20,
        marginTop: 26,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
    },
    inquiryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
    },
    inquiryIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inquiryForm: {
        marginTop: 6,
    },
    formLabel: {
        fontWeight: '700',
        letterSpacing: 0.5,
        fontSize: 11,
        marginBottom: 8,
    },
    topicChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    topicChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surface,
    },
    inquiryInput: {
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        fontSize: 14,
        textAlignVertical: 'top',
        minHeight: 90,
    },
    submitInquiryBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        paddingVertical: 14,
        marginTop: 14,
    },
    instituteCard: {
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        borderRadius: 16,
        backgroundColor: isDarkMode ? '#1E1E1E' : '#F8FAFC',
        borderWidth: 1,
        borderColor: colors.border,
    },
    instituteDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 10,
    },
});
