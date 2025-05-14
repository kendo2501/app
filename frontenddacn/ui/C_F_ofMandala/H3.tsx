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

// Import hàm gọi API từ file service

import { searchMandalaInfoByNumber } from '../../api/apiMandala'; // Đảm bảo đường dẫn đúng

// --- Cấu hình ---
const USER_ID_TO_FETCH = 1; // ID của user bạn muốn lấy dữ liệu
const BACKGROUND_IMAGE = require('../../assets/images/background.jpg'); // Đường dẫn tới ảnh nền

// --- Hàm tính tổng các chữ số của Năm ---
const calculateYearNumber = (year: number | null | undefined): number | null => {
    // Kiểm tra đầu vào có phải là số năm hợp lệ không
    if (year === null || year === undefined || typeof year !== 'number' || year <= 0) {
        console.warn(`[calculateYearNumber] Invalid input year: ${year}, returning null.`);
        return null;
    }
    try {
        // Tính tổng các chữ số
        const sum = String(year)
            .split('')
            .reduce((s, digit) => {
                const num = parseInt(digit, 10);
                return s + (isNaN(num) ? 0 : num); // Xử lý nếu có ký tự không phải số
            }, 0);

        console.log(`[calculateYearNumber] Input: ${year}, Sum: ${sum}`);
        // Tùy chọn: Thêm logic rút gọn nếu cần (hiện tại không rút gọn)
        return sum;
    } catch (e) {
        console.error("[calculateYearNumber] Error calculating year number:", e);
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
export default function App() {
    const [yearNumber, setYearNumber] = useState<number | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setUserData(null);
            setYearNumber(null);
            setMandalaDescription(null);

            try {
                // --- Step 1: Fetch User Data ---
                console.log(`[App] Fetching user data for ID: ${USER_ID_TO_FETCH}`);
                const fetchedUserData = await getUserById(USER_ID_TO_FETCH);
                setUserData(fetchedUserData);
                // Log dữ liệu nhận được ĐỂ KIỂM TRA
                console.log("[App] User data received:", JSON.stringify(fetchedUserData)); // Dùng stringify để xem rõ hơn

                // --- Step 2: Calculate Year Number ---
                // Lấy giá trị năm từ trường 'yyyy' (ĐÃ SỬA)
                const yearValueFromAPI = fetchedUserData?.yyyy;
                console.log(`[App] Value from fetchedUserData.yyyy: ${yearValueFromAPI} (Type: ${typeof yearValueFromAPI})`); // Log giá trị và kiểu dữ liệu
                const calculatedYearNum = calculateYearNumber(yearValueFromAPI);
                console.log(`[App] Calculated year number result: ${calculatedYearNum}`); // Log kết quả tính toán
                setYearNumber(calculatedYearNum);

                // --- Step 3: Fetch Mandala Description (nếu yearNumber hợp lệ) ---
                if (calculatedYearNum !== null) {
                    console.log(`[App] Fetching Mandala description for year number: ${calculatedYearNum}`);
                    const description = await searchMandalaInfoByNumber(calculatedYearNum);
                    console.log(`[App] Mandala description received: "${description}"`);

                    if (typeof description === 'string' && description.trim().length > 0) {
                        setMandalaDescription(description);
                    } else {
                        setMandalaDescription(`Không tìm thấy mô tả cho số năm ${calculatedYearNum}.`);
                        console.warn(`[App] No valid description found for year number: ${calculatedYearNum}. API returned:`, description);
                    }
                } else {
                    // Xảy ra nếu fetchedUserData.yyyy không hợp lệ/thiếu/ không tính được
                    console.warn("[App] Cannot fetch Mandala description because calculated year number is null.");
                     // Kiểm tra lại giá trị yearValueFromAPI để biết tại sao null
                    if (yearValueFromAPI === null || yearValueFromAPI === undefined) {
                       setMandalaDescription("Dữ liệu năm ('yyyy') bị thiếu từ API.");
                    } else {
                       setMandalaDescription(`Dữ liệu năm ('yyyy': ${yearValueFromAPI}) không hợp lệ.`);
                    }
                }

            } catch (err: any) {
                console.error("Error during loadData:", err); // Log lỗi chi tiết hơn
                const errorMessage = err?.message || "Đã xảy ra lỗi không xác định.";
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải dữ liệu."); // Thông báo lỗi chung hơn
                Alert.alert("Lỗi", `Đã xảy ra lỗi khi tải dữ liệu: ${errorMessage}`); // Hiển thị lỗi chi tiết hơn
            } finally {
                setLoading(false);
                console.log("[App] Loading finished.");
            }
        };

        loadData();
    }, []);

    // --- Navigation Handler ---
    const handleGoBack = () => { console.log('Go back pressed'); };

    // --- Render Logic ---
    if (loading && !userData) {
     return ( <View style={[styles.container, styles.centerContent]}><ImageBackground source={BACKGROUND_IMAGE} style={StyleSheet.absoluteFill} /><ActivityIndicator size="large" color="#ffffff" /><Text style={{ color: 'white', marginTop: 10 }}>Đang tải dữ liệu...</Text></View> );
    }
    return (
        <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="light-content" />
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={28} color="white" /></TouchableOpacity>
                    <View style={styles.titleContainer}><Text style={styles.title}>H3</Text></View>
                    <View style={styles.backButtonPlaceholder} />
                </View>
                <View style={styles.content}>
                    <View style={styles.circle}>
                        {(loading && yearNumber === null) ? (<ActivityIndicator size="small" color="#E6007E" />) : yearNumber !== null ? (<Text style={styles.number}>{yearNumber}</Text>) : (<Text style={styles.number}>-</Text>)}
                    </View>
                    <View style={styles.textBox}>
                        <Text style={styles.descriptionText}>{loading ? "Đang tải mô tả..." : mandalaDescription ? mandalaDescription : error ? "Lỗi khi tải mô tả." : "Không có mô tả."}</Text>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}
// --- End of Component Definition ---