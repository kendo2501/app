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
// Removed: import { getUserById } from '../api/apiUser';
import { searchMandalaInfoByNumber } from '../../api/apiMandala'; // Standardized Path

// --- Cấu hình ---
// Removed: const USER_ID_TO_FETCH = 1;
const BACKGROUND_IMAGE = require('../../assets/images/background.jpg'); // Standardized Path

// --- TypeScript Interface for UserInfo (H11 specific) ---
// H11 Screen needs day, month, and year for its calculation (via H3, H7, H10).
interface UserInfo {
  dd: number;
  mm: number;
  yyyy: number;
}

// --- Helper Functions ---

// Tính tổng các chữ số
const sumDigits = (num: number): number => {
    try {
        if (num < 0) {
            console.warn(`[sumDigits H11] Input is negative (${num}), returning 0.`);
            return 0;
        }
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum);
            }, 0);
    } catch (e) { console.error(`[sumDigits H11] Error for input ${num}:`, e); return 0; }
};

// H1 Ban đầu
const calculateH1InitialValue = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || typeof day !== 'number' || day <= 0 || day > 31) {
        // console.warn(`[calculateH1InitialValue H11] Invalid day input: ${day}`); // Reduce noise
        return null;
    }
    if (day <= 22) return day;
    return sumDigits(day);
};

// H2 Ban đầu
const calculateH2InitialValue = (monthInput: number | null | undefined): number | null => {
    if (monthInput === null || monthInput === undefined || typeof monthInput !== 'number' || monthInput < 1 || monthInput > 12) {
        // console.warn(`[calculateH2InitialValue H11] Invalid month input: ${monthInput}`); // Reduce noise
        return null;
    }
    return monthInput;
};

// H3 Ban đầu
const calculateH3InitialValue = (year: number | null | undefined): number | null => {
    if (year === null || year === undefined || typeof year !== 'number' || year <= 0) {
        // console.warn(`[calculateH3InitialValue H11] Invalid year input: ${year}`); // Reduce noise
        return null;
    }
    try {
        const sum = sumDigits(year);
        console.log(`[calculateH3InitialValue H11] Initial H3 for H11 calculation: ${sum}`);
        return sum;
    }
    catch (e) {
        // console.error(`[calculateH3InitialValue H11] Error summing digits for year ${year}:`, e); // Reduce noise
        return null;
    }
};

// H6 Final (<=22)
const getFinalH6Value = (day: number | null | undefined, month: number | null | undefined): number | null => {
    const resultH1 = calculateH1InitialValue(day);
    const resultH2 = calculateH2InitialValue(month);
    if (resultH1 === null || resultH2 === null) return null;
    let finalH6 = resultH1 + resultH2;
    while (finalH6 > 22) { finalH6 = sumDigits(finalH6); }
    return finalH6;
};

// H7 Final (<=22)
const getFinalH7Value = (month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH2 = calculateH2InitialValue(month);
    const resultH3 = calculateH3InitialValue(year); // Uses initial H3
    if (resultH2 === null || resultH3 === null) return null;
    const difference = resultH2 - resultH3;
    let finalH7 = Math.abs(difference);
    while (finalH7 > 22) { finalH7 = sumDigits(finalH7); }
    console.log(`[getFinalH7Value H11] Final H7 for H11 calculation: ${finalH7}`);
    return finalH7;
};

// H9 Final (<=22)
const getFinalH9Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const finalH6Result = getFinalH6Value(day, month);
    const finalH7Result = getFinalH7Value(month, year);
    if (finalH6Result === null || finalH7Result === null) return null;
    let finalH9 = finalH6Result + finalH7Result;
    while (finalH9 > 22) { finalH9 = sumDigits(finalH9); }
    return finalH9;
};

// H10 Final (KHÔNG rút gọn cuối)
const getFinalH10Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const finalH9Result = getFinalH9Value(day, month, year);
    if (finalH9Result === null) return null;
    const finalH10 = 22 - finalH9Result;
    console.log(`[getFinalH10Value H11] Final H10 for H11 calculation: ${finalH10}`);
    return finalH10;
};

// H11 Final (<=22)
const getFinalH11Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH3_initial = calculateH3InitialValue(year); // H3 ban đầu
    const finalH7Result = getFinalH7Value(month, year);    // H7 cuối (<=22)
    const finalH10Result = getFinalH10Value(day, month, year); // H10 cuối (không rút gọn thêm)

    if (resultH3_initial === null || finalH7Result === null || finalH10Result === null) {
        console.error(`[getFinalH11Value H11] Failed due to null intermediate: H3i=${resultH3_initial}, H7f=${finalH7Result}, H10f=${finalH10Result}`);
        return null;
    }
    let finalH11 = resultH3_initial + finalH7Result + finalH10Result;
    console.log(`[getFinalH11Value H11] Initial sum (H3i + H7f + H10f): ${resultH3_initial} + ${finalH7Result} + ${finalH10Result} = ${finalH11}`);

    while (finalH11 > 22) {
        const prevSum = finalH11;
        finalH11 = sumDigits(finalH11);
        console.log(`[getFinalH11Value H11] Reducing H11 sum ${prevSum} -> ${finalH11}`);
    }
    console.log(`[getFinalH11Value H11] Final H11: ${finalH11}`);
    return finalH11;
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

// --- Component H11 ---
export default function H11Screen() {
    const [h11Number, setH11Number] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Typed with H11-specific UserInfo
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setUserInfo(null);
            setH11Number(null);
            setMandalaDescription(null);

            try {
                console.log("[H11Screen] Fetching user data from AsyncStorage key: 'userInfo'");
                const storedUserInfo = await AsyncStorage.getItem('userInfo');

                if (storedUserInfo) {
                    const parsedFullUserInfo = JSON.parse(storedUserInfo);

                    if (typeof parsedFullUserInfo.dd === 'number' &&
                        typeof parsedFullUserInfo.mm === 'number' &&
                        typeof parsedFullUserInfo.yyyy === 'number') {

                        const componentSpecificUserInfo: UserInfo = {
                            dd: parsedFullUserInfo.dd,
                            mm: parsedFullUserInfo.mm,
                            yyyy: parsedFullUserInfo.yyyy,
                        };
                        setUserInfo(componentSpecificUserInfo);
                        console.log("[H11Screen] Relevant user data for H11:", componentSpecificUserInfo);

                        const finalH11 = getFinalH11Value(
                            componentSpecificUserInfo.dd,
                            componentSpecificUserInfo.mm,
                            componentSpecificUserInfo.yyyy
                        );
                        setH11Number(finalH11);

                        if (finalH11 !== null) {
                            const description = await searchMandalaInfoByNumber(finalH11);
                            if (typeof description === 'string' && description.trim().length > 0) {
                                setMandalaDescription(description);
                            } else {
                                setMandalaDescription(`Không tìm thấy mô tả cho số H11: ${finalH11}.`);
                                console.warn(`[H11Screen] No valid description found for H11=${finalH11}. API returned:`, description);
                            }
                        } else {
                            setError("Lỗi tính toán H11 (do lỗi H3, H7, H10 hoặc dữ liệu không hợp lệ).");
                            setMandalaDescription("Lỗi tính toán H11.");
                        }
                    } else {
                        console.warn("[H11Screen] dd, mm, or<y_bin_46> field is missing or not a number in stored userInfo.");
                        const missingFields = ['dd', 'mm', 'yyyy'].filter(f => typeof parsedFullUserInfo[f] !== 'number').join(', ');
                        setError(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu từ thông tin đã lưu.`);
                        setMandalaDescription(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu.`);
                    }
                } else {
                    console.warn("[H11Screen] No 'userInfo' found in AsyncStorage.");
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
                console.error("[H11Screen] Error during loadData:", err);
                let errorMessage = "Đã xảy ra lỗi không xác định.";
                if (err instanceof SyntaxError) {
                    errorMessage = "Lỗi định dạng dữ liệu người dùng đã lưu.";
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải dữ liệu.");
                Alert.alert("Lỗi H11", errorMessage);
            } finally {
                setLoading(false);
                console.log("[H11Screen] Loading finished.");
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
                    <View style={styles.titleContainer}><Text style={styles.title}>H11</Text></View>
                    <View style={styles.backButtonPlaceholder} />
                </View>
                <View style={styles.content}>
                    <View style={styles.circle}>
                        {(loading && h11Number === null && userInfo !== null) ? (
                            <ActivityIndicator size="small" color="#E6007E" />
                        ) : h11Number !== null ? (
                            <Text style={styles.number}>{h11Number}</Text>
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
                                error :
                                "Không có mô tả hoặc không thể tải."
                            }
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}