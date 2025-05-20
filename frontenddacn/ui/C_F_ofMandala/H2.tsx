import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added AsyncStorage

import { searchMandalaInfoByNumber } from '../../api/apiMandala'; // Đảm bảo đường dẫn đúng

// --- Cấu hình ---
// USER_ID_TO_FETCH is removed as we now fetch 'userInfo' from AsyncStorage
const BACKGROUND_IMAGE = require('../../assets/images/background.jpg');

// --- TypeScript Interface for UserInfo ---
// Defines the structure of the user information expected from AsyncStorage.
interface UserInfo {
  
  mm: number;         // Required: Month of birth, used for H2 calculation
    // Optional: Full name
}

// --- Helper Functions ---
// H2 Ban đầu (Tháng hợp lệ - ĐÃ SỬA ĐỂ NHẬN CẢ STRING "0X")
const calculateH2InitialValue = (monthInput: number | string | null | undefined): number | null => {
    if (monthInput === null || monthInput === undefined || monthInput === '') {
        // console.warn("[calculateH2InitialValue H2] Input is null/undefined/empty."); // Corrected console log
        return null;
    }
    const monthValue = Number(monthInput); // Converts "08" to 8, etc.
    if (!isNaN(monthValue) && Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12) {
        return monthValue;
    } else {
        console.warn(`[calculateH2InitialValue H2] Invalid month input: ${monthInput}`);
        return null;
    }
};
// H2 Final (là chính nó vì tháng sinh hợp lệ từ 1-12 là giá trị cuối cùng cho H2)
const getFinalH2Value = calculateH2InitialValue;
// --------------------

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, },
    absoluteFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, width: undefined, height: undefined, resizeMode: 'cover', },
    centerContent: { justifyContent: 'center', alignItems: 'center', },
    background: { flex: 1, },
    safeArea: { flex: 1, },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 15, paddingBottom: 10, width: '100%', },
    backButton: { padding: 5, },
    backButtonPlaceholder: { width: 38, height: 38, },
    titleContainer: { backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 30, borderRadius: 5, },
    title: { fontSize: 18, fontWeight: 'bold', color: '#333', textAlign: 'center', },
    content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, },
    circle: { width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255, 255, 255, 0.9)', justifyContent: 'center', alignItems: 'center', marginBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5, },
    number: { fontSize: 80, fontWeight: 'bold', color: '#E6007E', },
    textBox: { backgroundColor: 'rgba(211, 211, 211, 0.85)', padding: 25, borderRadius: 10, width: '90%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2, minHeight: 100, justifyContent: 'center', },
    descriptionText: { fontSize: 16, color: '#333', textAlign: 'center', lineHeight: 24, },
});
// --- End of Styles ---

// --- Component H2 ---
export default function H2Screen() {
    const [h2Number, setH2Number] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Changed from userData to userInfo and typed
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            // Reset states
            setUserInfo(null);
            setH2Number(null);
            setMandalaDescription(null);

            try {
                // Fetch user data from AsyncStorage
                console.log("[H2] Fetching user data from AsyncStorage key: 'userInfo'");
                const storedUserInfo = await AsyncStorage.getItem('userInfo');

                if (storedUserInfo) {
                    const parsedUserInfo: UserInfo = JSON.parse(storedUserInfo);
                    setUserInfo(parsedUserInfo); // Update component state
                    console.log("[H2] User data received from AsyncStorage:", parsedUserInfo);

                    const monthInput = parsedUserInfo?.mm; // Get month from parsed user info
                    const finalH2 = getFinalH2Value(monthInput);
                    setH2Number(finalH2);
                    console.log(`[H2] Input month: ${monthInput}, Final H2 number: ${finalH2}`);

                    if (finalH2 !== null) {
                        const description = await searchMandalaInfoByNumber(finalH2);
                        if (typeof description === 'string' && description.trim().length > 0) {
                            setMandalaDescription(description);
                        } else {
                            setMandalaDescription(`Không tìm thấy mô tả cho tháng ${finalH2}.`);
                            console.warn(`[H2] No valid description found for H2=${finalH2}. API returned:`, description);
                        }
                    } else {
                        setError("Dữ liệu tháng không hợp lệ từ thông tin đã lưu.");
                        setMandalaDescription("Không thể tính H2 do dữ liệu tháng không hợp lệ.");
                    }
                } else {
                    console.warn("[H2] No 'userInfo' found in AsyncStorage.");
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
                console.error("[H2] Error loading data:", err);
                let errorMessage = "Đã xảy ra lỗi không xác định.";
                 if (err instanceof SyntaxError) {
                    errorMessage = "Lỗi định dạng dữ liệu người dùng đã lưu.";
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải dữ liệu.");
                Alert.alert("Lỗi H2", errorMessage);
            } finally {
                setLoading(false);
                console.log("[H2] Loading finished.");
            }
        };
        loadData();
    }, []);

    const handleGoBack = () => {
        console.log('Go back pressed');
        // Add navigation logic here (e.g., router.back() if using expo-router)
    };

    // --- Render Logic ---
    if (loading && !userInfo) { // Changed from !userData to !userInfo
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor: '#2c3e50' /* Fallback background */}]}>
                <ImageBackground source={BACKGROUND_IMAGE} style={StyleSheet.absoluteFill} />
                <ActivityIndicator size="large" color="#ffffff" />
                <Text style={{ color: 'white', marginTop: 10 }}>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}><Text style={styles.title}>H2</Text></View>
                    <View style={styles.backButtonPlaceholder} />
                </View>
                <View style={styles.content}>
                    <View style={styles.circle}>
                        {/* Show small loading indicator if still loading (e.g. mandala desc) and h2Number isn't set yet, but userInfo IS loaded */}
                        {(loading && h2Number === null && userInfo !== null) ? (
                            <ActivityIndicator size="small" color="#E6007E" />
                        ) : h2Number !== null ? (
                            <Text style={styles.number}>{h2Number}</Text>
                        ) : (
                            // Display placeholder if number calculation failed or userInfo was missing for calculation
                            <Text style={styles.number}>{userInfo === null && !loading ? "!" : "-"}</Text>
                        )}
                    </View>
                    <View style={styles.textBox}>
                        <Text style={styles.descriptionText}>
                             {/* More nuanced conditional rendering for the description text */}
                            {loading && !mandalaDescription ? // If loading and no description yet
                                "Đang tải mô tả..." :
                                mandalaDescription ? // If description is loaded and exists
                                mandalaDescription :
                                error && !mandalaDescription ? // If there was an overall error and no specific mandala description
                                error : // Display the error message
                                "Không có mô tả hoặc không thể tải." // Default if no description and no error message
                            }
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}