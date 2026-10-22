import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { translations, getTransl } from '../constants/translations';

export { translations, getTransl };

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
