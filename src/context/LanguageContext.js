import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const translations = {
    en: {
        hello: "Hello",
        farmer: "Farmer Account",
        update_profile: "Update your profile",
        account: "Account",
        my_farms: "My Farms",
        personal_info: "Personal Information",
        preferences: "Preferences",
        settings: "Settings",
        language: "Language",
        support: "Support",
        help_center: "Help Center",
        privacy_policy: "Privacy Policy",
        logout: "Logout",
        deactivate: "Deactivate Account",
        app_language: "App Language"
    },
    kn: {
        hello: "ನಮಸ್ಕಾರ",
        farmer: "ರೈತ ಖಾತೆ",
        update_profile: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ",
        account: "ಖಾತೆ",
        my_farms: "ನನ್ನ ತೋಟಗಳು",
        personal_info: "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ",
        preferences: "ಆದ್ಯತೆಗಳು",
        settings: "ಸೆಟ್ಟಿಂಗ್ಸ್",
        language: "ಭಾಷೆ",
        support: "ಬೆಂಬಲ",
        help_center: "ಸಹಾಯ ಕೇಂದ್ರ",
        privacy_policy: "ಗೌಪ್ಯತಾ ನೀತಿ",
        logout: "ಲಾಗ್ ಔಟ್",
        deactivate: "ಖಾತೆ ರದ್ದು",
        app_language: "ಅಪ್ಲಿಕೇಶನ್ ಭಾಷೆ"
    },
    ml: {
        hello: "നമസ്കാരം",
        farmer: "കർഷക അക്കൗണ്ട്",
        update_profile: "പ്രൊഫൈൽ അപ്ഡേറ്റ് ചെയ്യുക",
        account: "അക്കൗണ്ട്",
        my_farms: "എന്റെ കൃഷിയിടങ്ങൾ",
        personal_info: "വ്യക്തിഗത വിവരങ്ങൾ",
        preferences: "മുൻഗണനകൾ",
        settings: "സജ്ജീകരണങ്ങൾ",
        language: "ഭാഷ",
        support: "പിന്തുണ",
        help_center: "സഹായ കേന്ദ്രം",
        privacy_policy: "സ്വകാര്യതാ നയം",
        logout: "ലോഗ് ഔട്ട്",
        deactivate: "അക്കൗണ്ട് നിർജ്ജീവമാക്കുക",
        app_language: "ആപ്പ് ഭാഷ"
    }
};

// Fallback to English for unsupported languages
const getTransl = (lang, key) => {
    const dict = translations[lang] || translations['en'];
    return dict[key] || translations['en'][key] || key;
};

export const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadLang = async () => {
            try {
                const saved = await SecureStore.getItemAsync('app_language');
                if (saved) setLanguage(saved);
            } catch (error) { }
            finally { setIsLoaded(true); }
        };
        loadLang();
    }, []);

    const changeLanguage = async (val) => {
        setLanguage(val);
        await SecureStore.setItemAsync('app_language', val);
    };

    const t = (key) => getTransl(language, key);

    if (!isLoaded) return null;

    return (
        <LanguageContext.Provider value={{ language, changeLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
