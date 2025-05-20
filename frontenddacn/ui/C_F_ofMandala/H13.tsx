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

// --- TypeScript Interface for UserInfo (H13 specific) ---
// H13 Screen needs day, month, and year for its calculation.
interface UserInfo {
  dd: number;
  mm: number;
  yyyy: number;
}

// --- Helper Functions (Đầy đủ các hàm cần thiết) ---

// Tính tổng các chữ số
const sumDigits = (num: number): number => {
    try {
        if (num < 0) {
            console.warn(`[sumDigits H13] Input is negative (${num}), returning 0.`);
            return 0;
        }
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum);
            }, 0);
    } catch (e) { console.error(`[sumDigits H13] Error for input ${num}:`, e); return 0; }
};

// --- Logic Tính Toán BAN ĐẦU cho H1, H2, H3 ---
const calculateH1InitialValue = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || typeof day !== 'number' || day <= 0 || day > 31) {
        return null;
    }
    if (day <= 22) return day;
    return sumDigits(day);
};
const calculateH2InitialValue = (monthInput: number | null | undefined): number | null => {
    if (monthInput === null || monthInput === undefined || typeof monthInput !== 'number' || monthInput < 1 || monthInput > 12) {
        return null;
    }
    return monthInput;
};
const calculateH3InitialValue = (year: number | null | undefined): number | null => {
    if (year === null || year === undefined || typeof year !== 'number' || year <= 0) {
        return null;
    }
    try { return sumDigits(year); } catch (e) { return null; }
};

// --- Hàm tính KẾT QUẢ CUỐI CÙNG (đã rút gọn <= 22, trừ H2, H10) ---

const getFinalH1Value = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || typeof day !== 'number') return null;
    let initialResult = calculateH1InitialValue(day);
    if (initialResult === null) return null;
    // H1 initial already handles reduction for day > 22 by sumDigits,
    // but standard life path often reduces further if sumDigits > 22.
    // This seems to intend H1 itself to be <=22 if it's a final value.
    while (initialResult > 22) { initialResult = sumDigits(initialResult); }
    return initialResult;
};

const getFinalH2Value = (monthInput: number | null | undefined): number | null => {
    return calculateH2InitialValue(monthInput); // H2 không rút gọn cuối, just validated month
};

const getFinalH3Value = (year: number | null | undefined): number | null => {
    if (year === null || year === undefined || typeof year !== 'number') return null;
    let initialResult = calculateH3InitialValue(year);
    if (initialResult === null) return null;
    while (initialResult > 22) { initialResult = sumDigits(initialResult); }
    return initialResult;
};

const getFinalH4Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const dayNum = day;
    const monthNum = calculateH2InitialValue(month);
    const yearNum = year;
    if (dayNum === null || monthNum === null || yearNum === null || dayNum <=0 || yearNum <=0 ) return null;
    try {
        let currentSum = dayNum + monthNum + yearNum;
        while (currentSum > 22) { currentSum = sumDigits(currentSum); }
        return currentSum;
    } catch (e) { return null; }
};

const getFinalH6Value = (day: number | null | undefined, month: number | null | undefined): number | null => {
    const resultH1 = calculateH1InitialValue(day); // Uses initial H1
    const resultH2 = calculateH2InitialValue(month); // Uses initial H2
    if (resultH1 === null || resultH2 === null) return null;
    let finalH6 = resultH1 + resultH2;
    while (finalH6 > 22) { finalH6 = sumDigits(finalH6); }
    return finalH6;
};

const getFinalH7Value = (month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH2 = calculateH2InitialValue(month); // Uses initial H2
    const resultH3 = calculateH3InitialValue(year); // Uses initial H3
    if (resultH2 === null || resultH3 === null) return null;
    let finalH7 = Math.abs(resultH2 - resultH3);
    while (finalH7 > 22) { finalH7 = sumDigits(finalH7); }
    return finalH7;
};

const getFinalH5Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH1_initial = calculateH1InitialValue(day);
    const resultH2_initial = calculateH2InitialValue(month);
    const resultH3_initial = calculateH3InitialValue(year);
    const finalH4 = getFinalH4Value(day, month, year);
    if (resultH1_initial === null || resultH2_initial === null || resultH3_initial === null || finalH4 === null) return null;
    let finalH5 = resultH1_initial + resultH2_initial + resultH3_initial + finalH4;
    while (finalH5 > 22) { finalH5 = sumDigits(finalH5); }
    console.log(`[getFinalH5Value H13] Final H5 for H13 calculation: ${finalH5}`);
    return finalH5;
};

const getFinalH9Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const finalH6Result = getFinalH6Value(day, month);
    const finalH7Result = getFinalH7Value(month, year);
    if (finalH6Result === null || finalH7Result === null) return null;
    let finalH9 = finalH6Result + finalH7Result;
    while (finalH9 > 22) { finalH9 = sumDigits(finalH9); }
    return finalH9;
};

const getFinalH10Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const finalH9Result = getFinalH9Value(day, month, year);
    if (finalH9Result === null) return null;
    return 22 - finalH9Result; // Not reduced
};

const getFinalH11Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH3_initial = calculateH3InitialValue(year);
    const finalH7Result = getFinalH7Value(month, year);
    const finalH10Result = getFinalH10Value(day, month, year);
    if (resultH3_initial === null || finalH7Result === null || finalH10Result === null) return null;
    let finalH11 = resultH3_initial + finalH7Result + finalH10Result;
    while (finalH11 > 22) { finalH11 = sumDigits(finalH11); }
    return finalH11;
};

const getFinalH12Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH2_initial = calculateH2InitialValue(month);
    const finalH4Result = getFinalH4Value(day, month, year);
    const finalH6Result = getFinalH6Value(day, month);
    if (resultH2_initial === null || finalH4Result === null || finalH6Result === null) return null;
    let finalH12 = resultH2_initial + finalH4Result + finalH6Result;
    while (finalH12 > 22) { finalH12 = sumDigits(finalH12); }
    return finalH12;
};

// H13 Final (<=22) - ĐÃ SỬA CÔNG THỨC
const getFinalH13Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const finalH1 = getFinalH1Value(day);
    const finalH2 = getFinalH2Value(month); // This is initial H2, not reduced beyond validation.
    const finalH3 = getFinalH3Value(year);
    const finalH4 = getFinalH4Value(day, month, year);
    const finalH5 = getFinalH5Value(day, month, year);
    const finalH9 = getFinalH9Value(day, month, year);
    const finalH11 = getFinalH11Value(day, month, year);
    const finalH12 = getFinalH12Value(day, month, year);

    const intermediates = [finalH1, finalH2, finalH3, finalH4, /* finalH5 is added separately below */ finalH9, finalH11, finalH12];
    if (intermediates.some(val => val === null) || finalH5 === null) { // Check finalH5 as well
        console.error("[getFinalH13Value H13] Failed due to null intermediate results. H1,H2,H3,H4,H9,H11,H12 then H5:",
            {finalH1, finalH2, finalH3, finalH4, finalH5, finalH9, finalH11, finalH12});
        return null;
    }

    // Formula from user code: sum of (H1,H2,H3,H4,H9,H11,H12) + H5.
    // So H5 is effectively added twice if it's included in the initial reduce.
    // Let's stick to the user's provided logic: sum of array + finalH5
    // The array `intermediates` was defined to include H5, then sum was reduce + H5. This means H5 was counted twice.
    // Correcting based on the structure `intermediates.reduce(...) + (finalH5 as number)`
    // where `intermediates` itself lists H5 once. So `finalH5` is indeed added twice.

    const sumOfListedIntermediates = (finalH1 as number) +
                                   (finalH2 as number) +
                                   (finalH3 as number) +
                                   (finalH4 as number) +
                                   (finalH5 as number) + // H5 is in the list
                                   (finalH9 as number) +
                                   (finalH11 as number) +
                                   (finalH12 as number);

    // The original code had: intermediates.reduce(...) + (finalH5 as number)
    // where intermediates = [finalH1, finalH2, finalH3, finalH4, finalH5, finalH9, finalH11, finalH12];
    // This meant finalH5 was summed twice. I will replicate this logic.
    let initialH13Sum = sumOfListedIntermediates + (finalH5 as number); // H5 is added again
    console.log(`[getFinalH13Value H13] Sum(H1f,H2f,H3f,H4f,H5f,H9f,H11f,H12f) + H5f = ${sumOfListedIntermediates} + ${finalH5} = ${initialH13Sum}`);

    let finalH13 = initialH13Sum;
    while (finalH13 > 22) {
        const prevSum = finalH13;
        finalH13 = sumDigits(finalH13);
        console.log(`[getFinalH13Value H13] Reducing H13 sum ${prevSum} -> ${finalH13}`);
    }
    console.log(`[getFinalH13Value H13] final H13: ${finalH13}`);
    return finalH13;
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

// --- Component H13 (Đã sửa) ---
export default function H13Screen() {
    const [h13Number, setH13Number] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Typed with H13-specific UserInfo
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setUserInfo(null);
            setH13Number(null);
            setMandalaDescription(null);

            try {
                console.log("[H13Screen] Fetching user data from AsyncStorage key: 'userInfo'");
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
                        console.log("[H13Screen] Relevant user data for H13:", componentSpecificUserInfo);

                        const finalH13 = getFinalH13Value(
                            componentSpecificUserInfo.dd,
                            componentSpecificUserInfo.mm,
                            componentSpecificUserInfo.yyyy
                        );
                        setH13Number(finalH13);

                        if (finalH13 !== null) {
                            const description = await searchMandalaInfoByNumber(finalH13);
                            if (typeof description === 'string' && description.trim().length > 0) {
                                setMandalaDescription(description);
                            } else {
                                setMandalaDescription(`Không tìm thấy mô tả cho số H13: ${finalH13}.`);
                                console.warn(`[H13Screen] No valid description found for H13=${finalH13}. API returned:`, description);
                            }
                        } else {
                            setError("Lỗi tính toán H13 (do lỗi các H con hoặc dữ liệu không hợp lệ).");
                            setMandalaDescription("Lỗi tính toán H13.");
                        }
                    } else {
                        console.warn("[H13Screen] dd, mm, or<y_bin_46> field is missing or not a number in stored userInfo.");
                        const missingFields = ['dd', 'mm', 'yyyy'].filter(f => typeof parsedFullUserInfo[f] !== 'number').join(', ');
                        setError(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu từ thông tin đã lưu.`);
                        setMandalaDescription(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu.`);
                    }
                } else {
                    console.warn("[H13Screen] No 'userInfo' found in AsyncStorage.");
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
                console.error("[H13Screen] Error during loadData:", err);
                let errorMessage = "Đã xảy ra lỗi không xác định.";
                if (err instanceof SyntaxError) {
                    errorMessage = "Lỗi định dạng dữ liệu người dùng đã lưu.";
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải dữ liệu.");
                Alert.alert("Lỗi H13", errorMessage);
            } finally {
                setLoading(false);
                console.log("[H13Screen] Loading finished.");
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
                    <View style={styles.titleContainer}><Text style={styles.title}>H13</Text></View>
                    <View style={styles.backButtonPlaceholder} />
                </View>
                <View style={styles.content}>
                    <View style={styles.circle}>
                        {(loading && h13Number === null && userInfo !== null) ? (
                            <ActivityIndicator size="small" color="#E6007E" />
                        ) : h13Number !== null ? (
                            <Text style={styles.number}>{h13Number}</Text>
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