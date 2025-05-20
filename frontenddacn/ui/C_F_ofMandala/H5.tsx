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

// --- TypeScript Interface for UserInfo (H5 specific) ---
// H5 Screen needs day, month, and year for its comprehensive calculation.
interface UserInfo {
  dd: number;
  mm: number;
  yyyy: number;
}

// --- Helper Functions ---

// Tính tổng các chữ số (Dùng cho H1, H3, H4, H5)
const sumDigits = (num: number): number => {
    try {
        if (num < 0) {
            console.warn(`[sumDigits H5] Input is negative (${num}), returning 0.`);
            return 0;
        }
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum);
            }, 0);
    } catch (e) { console.error(`[sumDigits H5] Error for input ${num}:`, e); return 0; }
};

// H1 Ban đầu (Mới - dựa trên dd)
const calculateH1InitialValue = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || typeof day !== 'number' || day <= 0 || day > 31) { // Added day > 31 check
        console.warn(`[calculateH1InitialValue H5] Invalid day input: ${day}`);
        return null;
    }
    if (day <= 22) return day;
    return sumDigits(day); // e.g., day 23 -> 5
};

// H2 Ban đầu (Tháng hợp lệ)
const calculateH2InitialValue = (monthInput: number | null | undefined): number | null => {
    // Expects monthInput to be a number from UserInfo
    if (monthInput === null || monthInput === undefined || typeof monthInput !== 'number' || monthInput < 1 || monthInput > 12) {
        console.warn(`[calculateH2InitialValue H5] Invalid month input: ${monthInput}`);
        return null;
    }
    return monthInput; // Month 1-12 is directly used
};

// H3 Ban đầu (Cũ - dựa trên Vishal - sum of year digits)
const calculateH3InitialValue = (year: number | null | undefined): number | null => {
    if (year === null || year === undefined || typeof year !== 'number' || year <= 0) {
        console.warn(`[calculateH3InitialValue H5] Invalid year input: ${year}`);
        return null;
    }
    try { return sumDigits(year); }
    catch (e) {
        console.error(`[calculateH3InitialValue H5] Error summing digits for year ${year}:`, e);
        return null;
    }
};

// H4 Final (<=22 - Life Path)
const getFinalH4Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const dayNum = day; // Already number from UserInfo
    const monthNum = calculateH2InitialValue(month); // Validates month
    const yearNum = year; // Already number from UserInfo

    if (dayNum === null || monthNum === null || yearNum === null || dayNum <=0 || yearNum <=0 ) { // monthNum already validated by calculateH2InitialValue
        console.warn(`[getFinalH4Value H5] Invalid inputs: d=${dayNum}, m=${monthNum}, y=${yearNum}`);
        return null;
    }
    try {
        let currentSum = dayNum + monthNum + yearNum;
        console.log(`[getFinalH4Value H5] Initial H4 sum (d+m+y): ${dayNum}+${monthNum}+${yearNum} = ${currentSum}`);
        while (currentSum > 22) {
            const prevSum = currentSum;
            currentSum = sumDigits(currentSum);
            console.log(`[getFinalH4Value H5] Reducing H4 sum ${prevSum} -> ${currentSum}`);
        }
        return currentSum;
    } catch (e) {
        console.error(`[getFinalH4Value H5] Error calculating H4 for d=${dayNum}, m=${monthNum}, y=${yearNum}:`, e);
        return null;
    }
};

// H5 Final (<=22)
const getFinalH5Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH1 = calculateH1InitialValue(day);
    const resultH2 = calculateH2InitialValue(month);
    const resultH3 = calculateH3InitialValue(year);
    const finalH4 = getFinalH4Value(day, month, year);

    if (resultH1 === null || resultH2 === null || resultH3 === null || finalH4 === null) {
        console.error(`[getFinalH5Value H5] Failed due to null intermediate: H1i=${resultH1}, H2i=${resultH2}, H3i=${resultH3}, H4f=${finalH4}`);
        return null;
    }
    let finalH5 = resultH1 + resultH2 + resultH3 + finalH4;
    console.log(`[getFinalH5Value H5] Initial H5 sum (H1i+H2i+H3i+H4f): ${resultH1}+${resultH2}+${resultH3}+${finalH4} = ${finalH5}`);
    while (finalH5 > 22) {
        const prevSum = finalH5;
        finalH5 = sumDigits(finalH5);
        console.log(`[getFinalH5Value H5] Reducing H5 sum ${prevSum} -> ${finalH5}`);
    }
    console.log(`[getFinalH5Value H5] Final H5: ${finalH5}`);
    return finalH5;
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

// --- Component H5 ---
export default function H5Screen() {
    const [h5Number, setH5Number] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null); // Typed with H5-specific UserInfo
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setUserInfo(null);
            setH5Number(null);
            setMandalaDescription(null);

            try {
                console.log("[H5Screen] Fetching user data from AsyncStorage key: 'userInfo'");
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
                        console.log("[H5Screen] Relevant user data for H5:", componentSpecificUserInfo);

                        const finalH5 = getFinalH5Value(
                            componentSpecificUserInfo.dd,
                            componentSpecificUserInfo.mm,
                            componentSpecificUserInfo.yyyy
                        );
                        setH5Number(finalH5);

                        if (finalH5 !== null) {
                            const description = await searchMandalaInfoByNumber(finalH5);
                            if (typeof description === 'string' && description.trim().length > 0) {
                                setMandalaDescription(description);
                            } else {
                                setMandalaDescription(`Không tìm thấy mô tả cho số H5: ${finalH5}.`);
                                console.warn(`[H5Screen] No valid description found for H5=${finalH5}. API returned:`, description);
                            }
                        } else {
                            setError("Lỗi tính toán H5 do dữ liệu ngày/tháng/năm không hợp lệ sau khi kiểm tra.");
                            setMandalaDescription("Lỗi tính toán H5.");
                        }
                    } else {
                        console.warn("[H5Screen] dd, mm, or yyyy field is missing or not a number in stored userInfo.");
                        const missingFields = ['dd', 'mm', 'yyyy'].filter(f => typeof parsedFullUserInfo[f] !== 'number').join(', ');
                        setError(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu từ thông tin đã lưu.`);
                        setMandalaDescription(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu.`);
                    }
                } else {
                    console.warn("[H5Screen] No 'userInfo' found in AsyncStorage.");
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
                console.error("[H5Screen] Error during loadData:", err);
                let errorMessage = "Đã xảy ra lỗi không xác định.";
                if (err instanceof SyntaxError) {
                    errorMessage = "Lỗi định dạng dữ liệu người dùng đã lưu.";
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải dữ liệu.");
                Alert.alert("Lỗi H5", errorMessage);
            } finally {
                setLoading(false);
                console.log("[H5Screen] Loading finished.");
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
                    <View style={styles.titleContainer}><Text style={styles.title}>H5</Text></View>
                    <View style={styles.backButtonPlaceholder} />
                </View>
                <View style={styles.content}>
                    <View style={styles.circle}>
                        {(loading && h5Number === null && userInfo !== null) ? (
                            <ActivityIndicator size="small" color="#E6007E" />
                        ) : h5Number !== null ? (
                            <Text style={styles.number}>{h5Number}</Text>
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