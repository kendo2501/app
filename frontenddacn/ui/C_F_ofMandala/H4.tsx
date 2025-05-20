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

const BACKGROUND_IMAGE = require('../../assets/images/background.jpg');

// --- TypeScript Interface for UserInfo (H4 specific) ---
// H4 Screen needs day, month, and year for its calculation.
interface UserInfo {
  dd: number;
  mm: number;
  yyyy: number;
}

// --- Helper Functions ---

// Tính tổng các chữ số (Cần cho rút gọn H4)
const sumDigits = (num: number): number => {
    try {
        if (num < 0) {
            console.warn(`[sumDigits H4] Input is negative (${num}), returning 0.`);
            return 0; // Or handle as an error, though typically numerology deals with positive integers.
        }
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum); // Treat non-digits as 0
            }, 0);
    } catch (e) {
        console.error(`[sumDigits H4] Error for input ${num}:`, e);
        return 0; // Return a neutral value or throw error
    }
};

// H2 Ban đầu (Cần để lấy số tháng hợp lệ cho H4) - validates month is 1-12
const calculateH2InitialValue = (monthInput: number | string | null | undefined): number | null => {
    if (monthInput === null || monthInput === undefined || monthInput === '') return null;
    const monthValue = Number(monthInput);
    if (!isNaN(monthValue) && Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12) return monthValue;
    console.warn(`[calculateH2InitialValue H4] Invalid month input: ${monthInput}`);
    return null;
};

// H4 Final (<=22 - Life Path)
const getFinalH4Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    // Directly use validated numbers from UserInfo, no need for string conversion here if UserInfo has numbers
    const dayNum = (day !== null && day !== undefined && day > 0) ? day : null;
    const monthNum = calculateH2InitialValue(month); // Validates month is 1-12
    const yearNum = (year !== null && year !== undefined && year > 0) ? year : null;

    if (dayNum === null || monthNum === null || yearNum === null ) {
        console.warn(`[getFinalH4Value H4] Invalid inputs after validation: d=${dayNum}, m=${monthNum}, y=${yearNum}`);
        return null;
    }

    try {
        let currentSum = dayNum + monthNum + yearNum;
        console.log(`[getFinalH4Value H4] Initial sum (d+m+y): ${dayNum}+${monthNum}+${yearNum} = ${currentSum}`);

        // Rút gọn tổng nếu lớn hơn 22 (và không phải 11 hoặc 22 nếu those are master numbers - this logic correctly keeps 11, 22 as they are not > 22)
        while (currentSum > 22) {
            const previousSum = currentSum;
            currentSum = sumDigits(currentSum);
            console.log(`[getFinalH4Value H4] Reducing ${previousSum} -> ${currentSum}`);
        }
        console.log(`[getFinalH4Value H4] Final H4: ${currentSum}`);
        return currentSum;
    } catch (e) {
        console.error("[getFinalH4Value H4] Error during calculation:", e);
        return null;
    }
};
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

// --- Component H4 ---
export default function H4Screen() {
    const [h4Number, setH4Number] = useState<number | null>(null);
    // userInfo state is now typed with the H4-specific UserInfo interface
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setUserInfo(null);
            setH4Number(null);
            setMandalaDescription(null);

            try {
                console.log("[H4Screen] Fetching user data from AsyncStorage key: 'userInfo'");
                const storedUserInfo = await AsyncStorage.getItem('userInfo');

                if (storedUserInfo) {
                    const parsedFullUserInfo = JSON.parse(storedUserInfo);

                    // Validate presence and type of dd, mm, yyyy
                    if (typeof parsedFullUserInfo.dd === 'number' &&
                        typeof parsedFullUserInfo.mm === 'number' &&
                        typeof parsedFullUserInfo.yyyy === 'number') {

                        const componentSpecificUserInfo: UserInfo = {
                            dd: parsedFullUserInfo.dd,
                            mm: parsedFullUserInfo.mm,
                            yyyy: parsedFullUserInfo.yyyy,
                        };
                        setUserInfo(componentSpecificUserInfo);
                        console.log("[H4Screen] Relevant user data for H4:", componentSpecificUserInfo);

                        const finalH4 = getFinalH4Value(
                            componentSpecificUserInfo.dd,
                            componentSpecificUserInfo.mm,
                            componentSpecificUserInfo.yyyy
                        );
                        setH4Number(finalH4);

                        if (finalH4 !== null) {
                            const description = await searchMandalaInfoByNumber(finalH4);
                            if (typeof description === 'string' && description.trim().length > 0) {
                                setMandalaDescription(description);
                            } else {
                                setMandalaDescription(`Không tìm thấy mô tả cho số H4: ${finalH4}.`);
                                console.warn(`[H4Screen] No valid description found for H4=${finalH4}. API returned:`, description);
                            }
                        } else {
                            setError("Lỗi tính toán H4 do dữ liệu ngày/tháng/năm không hợp lệ sau khi kiểm tra.");
                            setMandalaDescription("Lỗi tính toán H4.");
                        }
                    } else {
                        console.warn("[H4Screen] dd, mm, or yyyy field is missing or not a number in stored userInfo.");
                        const missingFields = ['dd', 'mm', 'yyyy'].filter(f => typeof parsedFullUserInfo[f] !== 'number').join(', ');
                        setError(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu từ thông tin đã lưu.`);
                        setMandalaDescription(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu.`);
                    }
                } else {
                    console.warn("[H4Screen] No 'userInfo' found in AsyncStorage.");
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
                console.error("[H4Screen] Error during loadData:", err);
                let errorMessage = "Đã xảy ra lỗi không xác định.";
                if (err instanceof SyntaxError) {
                    errorMessage = "Lỗi định dạng dữ liệu người dùng đã lưu.";
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải dữ liệu.");
                Alert.alert("Lỗi H4", errorMessage);
            } finally {
                setLoading(false);
                console.log("[H4Screen] Loading finished.");
            }
        };
        loadData();
    }, []);

    const handleGoBack = () => { console.log('Go back pressed'); };

    if (loading && !userInfo) {
        return (
            <View style={[styles.container, styles.centerContent, {backgroundColor: '#2c3e50'}]}>
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
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={28} color="white" /></TouchableOpacity>
                    <View style={styles.titleContainer}><Text style={styles.title}>H4</Text></View>
                    <View style={styles.backButtonPlaceholder} />
                </View>
                <View style={styles.content}>
                    <View style={styles.circle}>
                        {(loading && h4Number === null && userInfo !== null) ? (
                            <ActivityIndicator size="small" color="#E6007E" />
                        ) : h4Number !== null ? (
                            <Text style={styles.number}>{h4Number}</Text>
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
                                error ?
                                error : // Display the specific error message
                                "Không có mô tả hoặc không thể tải."
                            }
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}