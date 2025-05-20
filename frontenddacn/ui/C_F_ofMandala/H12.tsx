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

// --- TypeScript Interface for UserInfo (H12 specific) ---
// H12 Screen needs day, month, and year for its calculation (via H2, H4, H6).
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
            console.warn(`[sumDigits H12] Input is negative (${num}), returning 0.`);
            return 0;
        }
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum);
            }, 0);
    } catch (e) { console.error(`[sumDigits H12] Error for input ${num}:`, e); return 0; }
};

// H1 Ban đầu (Cần cho H6)
const calculateH1InitialValue = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || typeof day !== 'number' || day <= 0 || day > 31) {
        // console.warn(`[calculateH1InitialValue H12] Invalid day input: ${day}`); // Reduce noise
        return null;
    }
    if (day <= 22) return day;
    return sumDigits(day);
};

// H2 Ban đầu (Đã sửa, cần cho H12, H4, H6)
const calculateH2InitialValue = (monthInput: number | null | undefined): number | null => {
    if (monthInput === null || monthInput === undefined || typeof monthInput !== 'number' || monthInput < 1 || monthInput > 12) {
        // console.warn(`[calculateH2InitialValue H12] Invalid month input: ${monthInput}`); // Reduce noise
        return null;
    }
    console.log(`[calculateH2InitialValue H12] Initial H2 for H12 calculation: ${monthInput}`);
    return monthInput;
};

// H4 Final (<=22, cần cho H12)
const getFinalH4Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const dayNum = day; // Assumed number from UserInfo
    const monthNum = calculateH2InitialValue(month); // Validates month
    const yearNum = year; // Assumed number from UserInfo

    if (dayNum === null || monthNum === null || yearNum === null || dayNum <=0 || yearNum <=0 ) {
        // console.warn(`[getFinalH4Value H12] Invalid inputs for H4: d=${dayNum}, m=${monthNum}, y=${yearNum}`); // Reduce noise
        return null;
    }
    try {
        let currentSum = dayNum + monthNum + yearNum;
        // console.log(`[getFinalH4Value H12] H4 Initial sum (d+m+y): ${dayNum}+${monthNum}+${yearNum} = ${currentSum}`); // Reduce noise
        while (currentSum > 22) {
            // const prevSum = currentSum; // Reduce noise
            currentSum = sumDigits(currentSum);
            // console.log(`[getFinalH4Value H12] Reducing H4 sum ${prevSum} -> ${currentSum}`); // Reduce noise
        }
        console.log(`[getFinalH4Value H12] Final H4 for H12 calculation: ${currentSum}`);
        return currentSum;
    } catch (e) {
        // console.error(`[getFinalH4Value H12] Error calculating H4 for d=${dayNum}, m=${monthNum}, y=${yearNum}:`, e); // Reduce noise
        return null;
    }
};

// H6 Final (<=22, cần cho H12)
const getFinalH6Value = (day: number | null | undefined, month: number | null | undefined): number | null => {
    const resultH1 = calculateH1InitialValue(day);
    const resultH2 = calculateH2InitialValue(month);
    if (resultH1 === null || resultH2 === null) {
        // console.error(`[getFinalH6Value H12] Null intermediate for H6: H1i=${resultH1}, H2i=${resultH2}`); // Reduce noise
        return null;
    }
    let finalH6 = resultH1 + resultH2;
    // console.log(`[getFinalH6Value H12] H6 Initial sum (H1i+H2i): ${resultH1}+${resultH2} = ${finalH6}`); // Reduce noise
    while (finalH6 > 22) {
        // const prevSum = finalH6; // Reduce noise
        finalH6 = sumDigits(finalH6);
        // console.log(`[getFinalH6Value H12] Reducing H6 sum ${prevSum} -> ${finalH6}`); // Reduce noise
    }
    console.log(`[getFinalH6Value H12] Final H6 for H12 calculation: ${finalH6}`);
    return finalH6;
};

// H12 Final (<=22)
const getFinalH12Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH2_initial = calculateH2InitialValue(month);
    const finalH4Result = getFinalH4Value(day, month, year);
    const finalH6Result = getFinalH6Value(day, month);

    if (resultH2_initial === null || finalH4Result === null || finalH6Result === null) {
        console.error(`[getFinalH12Value H12] Failed due to null intermediate: H2i=${resultH2_initial}, H4f=${finalH4Result}, H6f=${finalH6Result}`);
        return null;
    }
    let finalH12 = resultH2_initial + finalH4Result + finalH6Result;
    console.log(`[getFinalH12Value H12] Initial sum (H2i + H4f + H6f): ${resultH2_initial} + ${finalH4Result} + ${finalH6Result} = ${finalH12}`);

    while (finalH12 > 22) {
        const prevSum = finalH12;
        finalH12 = sumDigits(finalH12);
        console.log(`[getFinalH12Value H12] Reducing H12 sum ${prevSum} -> ${finalH12}`);
    }
    console.log(`[getFinalH12Value H12] Final H12: ${finalH12}`);
    return finalH12;
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

// --- Component H12 ---
export default function H12Screen() {
    const [h12Number, setH12Number] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Typed with H12-specific UserInfo
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setUserInfo(null);
            setH12Number(null);
            setMandalaDescription(null);

            try {
                console.log("[H12Screen] Fetching user data from AsyncStorage key: 'userInfo'");
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
                        console.log("[H12Screen] Relevant user data for H12:", componentSpecificUserInfo);

                        const finalH12 = getFinalH12Value(
                            componentSpecificUserInfo.dd,
                            componentSpecificUserInfo.mm,
                            componentSpecificUserInfo.yyyy
                        );
                        setH12Number(finalH12);

                        if (finalH12 !== null) {
                            const description = await searchMandalaInfoByNumber(finalH12);
                            if (typeof description === 'string' && description.trim().length > 0) {
                                setMandalaDescription(description);
                            } else {
                                setMandalaDescription(`Không tìm thấy mô tả cho số H12: ${finalH12}.`);
                                console.warn(`[H12Screen] No valid description found for H12=${finalH12}. API returned:`, description);
                            }
                        } else {
                            setError("Lỗi tính toán H12 (do lỗi H2, H4, H6 hoặc dữ liệu không hợp lệ).");
                            setMandalaDescription("Lỗi tính toán H12.");
                        }
                    } else {
                        console.warn("[H12Screen] dd, mm, or<y_bin_46> field is missing or not a number in stored userInfo.");
                        const missingFields = ['dd', 'mm', 'yyyy'].filter(f => typeof parsedFullUserInfo[f] !== 'number').join(', ');
                        setError(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu từ thông tin đã lưu.`);
                        setMandalaDescription(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu.`);
                    }
                } else {
                    console.warn("[H12Screen] No 'userInfo' found in AsyncStorage.");
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
                console.error("[H12Screen] Error during loadData:", err);
                let errorMessage = "Đã xảy ra lỗi không xác định.";
                if (err instanceof SyntaxError) {
                    errorMessage = "Lỗi định dạng dữ liệu người dùng đã lưu.";
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải dữ liệu.");
                Alert.alert("Lỗi H12", errorMessage);
            } finally {
                setLoading(false);
                console.log("[H12Screen] Loading finished.");
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
                    <View style={styles.titleContainer}><Text style={styles.title}>H12</Text></View>
                    <View style={styles.backButtonPlaceholder} />
                </View>
                <View style={styles.content}>
                    <View style={styles.circle}>
                        {(loading && h12Number === null && userInfo !== null) ? (
                            <ActivityIndicator size="small" color="#E6007E" />
                        ) : h12Number !== null ? (
                            <Text style={styles.number}>{h12Number}</Text>
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