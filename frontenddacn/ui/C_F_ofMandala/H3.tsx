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
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added AsyncStorage

// Import hàm gọi API từ file service
import { searchMandalaInfoByNumber } from '../../api/apiMandala'; // Đảm bảo đường dẫn đúng

// --- Cấu hình ---
// USER_ID_TO_FETCH is removed as we now fetch 'userInfo' from AsyncStorage
const BACKGROUND_IMAGE = require('../../assets/images/background.jpg'); // Đường dẫn tới ảnh nền

// --- TypeScript Interface for UserInfo ---
// Defines the structure of the user information expected from AsyncStorage.
interface UserInfo {
  yyyy: number;       
}

// --- Hàm tính tổng các chữ số của Năm ---
const calculateYearNumber = (year: number | null | undefined): number | null => {
    if (year === null || year === undefined || typeof year !== 'number' || year <= 0) {
        console.warn(`[calculateYearNumber H3] Invalid input year: ${year}, returning null.`);
        return null;
    }
    try {
        const sum = String(year)
            .split('')
            .reduce((s, digit) => {
                const num = parseInt(digit, 10);
                return s + (isNaN(num) ? 0 : num);
            }, 0);

        console.log(`[calculateYearNumber H3] Input: ${year}, Sum: ${sum}`);
        // Note: This function currently does not reduce the sum further (e.g., 19 remains 19, not 1+9=10 -> 1).
        // If reduction is needed (e.g., to a single digit or master number 11, 22), that logic would be added here.
        return sum;
    } catch (e) {
        console.error("[calculateYearNumber H3] Error calculating year number:", e);
        return null;
    }
};
// ---------------------------------------

// --- Định nghĩa Styles ---
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
// --- End of Styles Definition ---

// --- React Component Definition ---
// Renamed App to H3Screen for clarity
export default function H3Screen() {
    const [yearNumber, setYearNumber] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Changed from userData and typed
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            // Reset states
            setUserInfo(null);
            setYearNumber(null);
            setMandalaDescription(null);

            try {
                // --- Step 1: Fetch User Data from AsyncStorage ---
                console.log("[H3Screen] Fetching user data from AsyncStorage key: 'userInfo'");
                const storedUserInfo = await AsyncStorage.getItem('userInfo');

                if (storedUserInfo) {
                    const parsedUserInfo: UserInfo = JSON.parse(storedUserInfo);
                    setUserInfo(parsedUserInfo);
                    console.log("[H3Screen] User data received from AsyncStorage:", parsedUserInfo);

                    // --- Step 2: Calculate Year Number ---
                    const yearValueFromStorage = parsedUserInfo?.yyyy;
                    console.log(`[H3Screen] Value from parsedUserInfo.yyyy: ${yearValueFromStorage} (Type: ${typeof yearValueFromStorage})`);
                    const calculatedYearNum = calculateYearNumber(yearValueFromStorage);
                    console.log(`[H3Screen] Calculated year number result: ${calculatedYearNum}`);
                    setYearNumber(calculatedYearNum);

                    // --- Step 3: Fetch Mandala Description (if yearNumber is valid) ---
                    if (calculatedYearNum !== null) {
                        console.log(`[H3Screen] Fetching Mandala description for year number: ${calculatedYearNum}`);
                        const description = await searchMandalaInfoByNumber(calculatedYearNum);
                        console.log(`[H3Screen] Mandala description received: "${description}"`);

                        if (typeof description === 'string' && description.trim().length > 0) {
                            setMandalaDescription(description);
                        } else {
                            setMandalaDescription(`Không tìm thấy mô tả cho số năm ${calculatedYearNum}.`);
                            console.warn(`[H3Screen] No valid description found for year number: ${calculatedYearNum}. API returned:`, description);
                        }
                    } else {
                        console.warn("[H3Screen] Cannot fetch Mandala description because calculated year number is null.");
                        if (yearValueFromStorage === null || yearValueFromStorage === undefined) {
                            setMandalaDescription("Dữ liệu năm ('yyyy') bị thiếu từ thông tin đã lưu.");
                        } else {
                            setMandalaDescription(`Dữ liệu năm ('yyyy': ${yearValueFromStorage}) không hợp lệ.`);
                        }
                    }
                } else {
                    console.warn("[H3Screen] No 'userInfo' found in AsyncStorage.");
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }

            } catch (err: any) {
                console.error("[H3Screen] Error during loadData:", err);
                let errorMessage = "Đã xảy ra lỗi không xác định.";
                if (err instanceof SyntaxError) {
                    errorMessage = "Lỗi định dạng dữ liệu người dùng đã lưu.";
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải dữ liệu.");
                Alert.alert("Lỗi H3", `Đã xảy ra lỗi khi tải dữ liệu: ${errorMessage}`);
            } finally {
                setLoading(false);
                console.log("[H3Screen] Loading finished.");
            }
        };

        loadData();
    }, []);

    // --- Navigation Handler ---
    const handleGoBack = () => {
        console.log('Go back pressed');
        // Add navigation logic here (e.g., router.back() if using expo-router)
    };

    // --- Render Logic ---
    if (loading && !userInfo) { // Changed from !userData to !userInfo
        return (
            <View style={[styles.container, styles.centerContent, {backgroundColor: '#2c3e50' /* Fallback background */}]}>
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
                    <View style={styles.titleContainer}><Text style={styles.title}>H3</Text></View>
                    <View style={styles.backButtonPlaceholder} />
                </View>
                <View style={styles.content}>
                    <View style={styles.circle}>
                        {(loading && yearNumber === null && userInfo !== null) ? ( // More specific loading in circle
                            <ActivityIndicator size="small" color="#E6007E" />
                        ) : yearNumber !== null ? (
                            <Text style={styles.number}>{yearNumber}</Text>
                        ) : (
                             <Text style={styles.number}>{userInfo === null && !loading ? "!" : "-"}</Text>
                        )}
                    </View>
                    <View style={styles.textBox}>
                        <Text style={styles.descriptionText}>
                            {loading && !mandalaDescription ?
                                "Đang tải mô tả..." :
                                mandalaDescription ?
                                mandalaDescription :
                                error && !mandalaDescription ? // If overall error and no specific description
                                error : // Display the error message from setError
                                "Không có mô tả hoặc không thể tải."
                            }
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}
// --- End of Component Definition ---