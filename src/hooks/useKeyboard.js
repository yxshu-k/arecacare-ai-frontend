import { useState, useEffect } from 'react';
import { Keyboard, Platform, UIManager } from 'react-native';

// Enable LayoutAnimation on Android if available
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    try {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    } catch (e) {
        // Safe fallback
    }
}

/**
 * Custom hook to track soft keyboard visibility and height across iOS and Android.
 * Provides accurate keyboard metrics and smooth animation handling.
 */
export const useKeyboard = () => {
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

        const showSubscription = Keyboard.addListener(showEvent, (e) => {
            const height = e && e.endCoordinates ? e.endCoordinates.height : 0;
            setKeyboardHeight(height);
            setIsKeyboardVisible(true);
        });

        const hideSubscription = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
            setIsKeyboardVisible(false);
        });

        return () => {
            showSubscription.remove();
            hideSubscription.remove();
        };
    }, []);

    const dismissKeyboard = () => Keyboard.dismiss();

    return {
        keyboardHeight,
        isKeyboardVisible,
        dismissKeyboard,
    };
};

export default useKeyboard;
