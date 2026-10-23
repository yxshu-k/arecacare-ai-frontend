import React, { createContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Location from 'expo-location';
import { authService } from '../services/authService';
import { normalizeAddress } from '../utils/geoNormalizer';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [userToken, setUserToken] = useState(null);
    const [userData, setUserData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [defaultFarms, setDefaultFarms] = useState([
        { id: 1, name: 'Current Location', locality: '', region: '13.9299,75.5681' }
    ]);
    const [activeFarm, setActiveFarm] = useState(defaultFarms[0]);

    const applyLocationCoords = async (coords) => {
        if (!coords) return;
        const { latitude, longitude } = coords;
        const coordStr = `${latitude},${longitude}`;

        let normalized = {
            placeName: 'Live GPS',
            district: '',
            localityStr: coordStr,
            coordinates: coordStr,
        };

        try {
            const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
            normalized = normalizeAddress(addresses, { latitude, longitude });
        } catch (geoErr) {
            console.warn("[Location Hook] Reverse geocode error:", geoErr);
        }

        const liveProfile = {
            id: 1,
            name: normalized.placeName,
            district: normalized.district,
            locality: normalized.localityStr,
            region: coordStr,
            coordinates: { latitude, longitude }
        };

        setDefaultFarms([liveProfile]);
        setActiveFarm(liveProfile);
    };

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    const fallback = { id: 1, name: 'My Location (Offline)', locality: '', region: '13.9299,75.5681' };
                    setDefaultFarms([fallback]);
                    setActiveFarm(fallback);
                    return;
                }

                // 1. Instant responsiveness from cached position
                const cachedLocation = await Location.getLastKnownPositionAsync({});
                if (cachedLocation && cachedLocation.coords) {
                    await applyLocationCoords(cachedLocation.coords);
                }

                // 2. Always acquire fresh satellite fix in parallel to track travel / relocation
                Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
                    .then(freshLoc => {
                        if (freshLoc && freshLoc.coords) {
                            applyLocationCoords(freshLoc.coords);
                        }
                    })
                    .catch(e => console.log("[Location Hook] Fresh GPS update:", e.message));
            } catch (err) {
                console.warn("[Location Hook] Failed to fetch GPS:", err);
            }
        })();
    }, []);

    const refreshLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            if (location && location.coords) {
                await applyLocationCoords(location.coords);
            }
        } catch (e) {
            console.warn("[AuthContext] Location refresh error:", e);
        }
    };

    useEffect(() => {
        const loadToken = async () => {
            try {
                const token = await SecureStore.getItemAsync('auth_token');
                const cachedUserStr = await SecureStore.getItemAsync('user_data');

                if (token) {
                    setUserToken(token);

                    // Restore cached user profile immediately for instant UI responsiveness
                    if (cachedUserStr) {
                        try {
                            setUserData(JSON.parse(cachedUserStr));
                        } catch (parseErr) {
                            console.warn('[AuthContext] Could not parse cached user profile:', parseErr);
                        }
                    }

                    // Background sync of fresh profile
                    try {
                        const userProfile = await authService.getMe();
                        setUserData(userProfile);
                        await SecureStore.setItemAsync('user_data', JSON.stringify(userProfile));
                    } catch (err) {
                        // ONLY log out if backend explicitly rejected credentials with 401 Unauthorized
                        if (err?.response?.status === 401) {
                            console.log("[AuthContext] Session expired (401). Clearing credentials.");
                            setUserToken(null);
                            setUserData(null);
                            await SecureStore.deleteItemAsync('auth_token');
                            await SecureStore.deleteItemAsync('user_data');
                        } else {
                            console.log("[AuthContext] Network or backend sync delay on boot. Retaining cached login session.");
                        }
                    }
                }
            } catch (e) {
                console.error('[AuthContext] Failed to load token from secure storage:', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadToken();
    }, []);

    const login = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            setUserToken(data.token);
            await SecureStore.setItemAsync('auth_token', data.token);
            await SecureStore.setItemAsync('has_onboarded', 'true');

            // Fetch profile and cache locally
            try {
                const userProfile = await authService.getMe();
                setUserData(userProfile);
                await SecureStore.setItemAsync('user_data', JSON.stringify(userProfile));
            } catch (pErr) {
                const fallbackUser = data.user || { email };
                setUserData(fallbackUser);
                await SecureStore.setItemAsync('user_data', JSON.stringify(fallbackUser));
            }
        } catch (error) {
            console.error('[AuthContext] Login failed:', error.message);
            throw error; // Let UI handle it
        }
    };

    const register = async (registerData) => {
        try {
            // Register user in MongoDB database
            await authService.register(registerData);
            // Immediately log them in to obtain JWT and establish session
            await login(registerData.email, registerData.password);
            await SecureStore.setItemAsync('has_onboarded', 'true');
        } catch (error) {
            console.error('[AuthContext] Signup failed:', error.message);
            throw error;
        }
    };

    const googleLogin = async (googleToken) => {
        try {
            const data = await authService.googleLogin(googleToken);
            setUserToken(data.token);
            await SecureStore.setItemAsync('auth_token', data.token);
            await SecureStore.setItemAsync('has_onboarded', 'true');

            // Fetch and cache real profile
            try {
                const userProfile = await authService.getMe();
                setUserData(userProfile);
                await SecureStore.setItemAsync('user_data', JSON.stringify(userProfile));
            } catch (pErr) {
                const fallbackUser = data.user || {};
                setUserData(fallbackUser);
                await SecureStore.setItemAsync('user_data', JSON.stringify(fallbackUser));
            }
        } catch (error) {
            console.error('[AuthContext] Google Auth failed:', error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout(); // Invalidate token remotely
        } catch (error) {
            console.log('Remote logout failed, clearing locally.');
        } finally {
            setUserToken(null);
            setUserData(null);
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('user_data');
        }
    };

    const deactivate = async () => {
        try {
            await authService.deactivate();
        } catch (error) {
            console.log('Deactivation failed at backend, clearing local state.');
        } finally {
            setUserToken(null);
            setUserData(null);
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('user_data');
        }
    };

    const updateUser = async (updateData) => {
        try {
            const updatedProfile = await authService.updateProfile(updateData);
            setUserData(updatedProfile);
            await SecureStore.setItemAsync('user_data', JSON.stringify(updatedProfile));
            return updatedProfile;
        } catch (error) {
            console.error('[AuthContext] Update Profile failed:', error.message);
            throw error;
        }
    };

    const uploadAvatar = async (imageUri) => {
        try {
            const updatedProfile = await authService.uploadProfilePicture(imageUri);
            setUserData(updatedProfile);
            await SecureStore.setItemAsync('user_data', JSON.stringify(updatedProfile));
            return updatedProfile;
        } catch (error) {
            console.error('[AuthContext] Avatar upload failed:', error.message);
            throw error;
        }
    };

    const deleteAvatar = async () => {
        try {
            const updatedProfile = await authService.deleteProfilePicture();
            setUserData(updatedProfile);
            await SecureStore.setItemAsync('user_data', JSON.stringify(updatedProfile));
            return updatedProfile;
        } catch (error) {
            console.error('[AuthContext] Avatar delete failed:', error.message);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ userToken, userData, isLoading, login, register, googleLogin, logout, deactivate, updateUser, uploadAvatar, deleteAvatar, activeFarm, refreshLocation }}>
            {children}
        </AuthContext.Provider>
    );
};
