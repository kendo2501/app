import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView, // Thêm ScrollView
    Dimensions,   // Thêm Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchMandalaInfoByNumber } from '../../api/apiMandala'; // Đảm bảo đường dẫn đúng

const BACKGROUND_IMAGE = require('../../assets/images/background.jpg');

// --- TypeScript Interface for UserInfo (H11 specific) ---
interface UserInfo {
    dd: number;
    mm: number;
    yyyy: number;
}

const { width } = Dimensions.get('window');

// --- Helper Functions (Giữ nguyên logic H11 của bạn) ---
const sumDigits = (num: number): number => {
    try {
        if (num < 0) {
            // console.warn(`[sumDigits H11] Input is negative (${num}), returning 0.`);
            return 0;
        }
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum);
            }, 0);
    } catch (e) { 
        // console.error(`[sumDigits H11] Error for input ${num}:`, e); 
        return 0; 
    }
};

const calculateH1InitialValue = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || typeof day !== 'number' || day <= 0 || day > 31) return null;
    if (day <= 22) return day;
    return sumDigits(day);
};

const calculateH2InitialValue = (monthInput: number | null | undefined): number | null => {
    if (monthInput === null || monthInput === undefined || typeof monthInput !== 'number' || monthInput < 1 || monthInput > 12) return null;
    return monthInput;
};

const calculateH3InitialValue = (year: number | null | undefined): number | null => {
    if (year === null || year === undefined || typeof year !== 'number' || year <= 0) return null;
    try {
        const sum = sumDigits(year);
        // console.log(`[calculateH3InitialValue H11] Initial H3 for H11 calculation: ${sum}`); // Giảm console log
        return sum;
    }
    catch (e) { return null; }
};

const getFinalH6Value = (day: number | null | undefined, month: number | null | undefined): number | null => {
    const resultH1 = calculateH1InitialValue(day);
    const resultH2 = calculateH2InitialValue(month);
    if (resultH1 === null || resultH2 === null) return null;
    let finalH6 = resultH1 + resultH2;
    while (finalH6 > 22) { finalH6 = sumDigits(finalH6); }
    return finalH6;
};

const getFinalH7Value = (month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH2 = calculateH2InitialValue(month);
    const resultH3 = calculateH3InitialValue(year); 
    if (resultH2 === null || resultH3 === null) return null;
    const difference = resultH2 - resultH3;
    let finalH7 = Math.abs(difference);
    while (finalH7 > 22) { finalH7 = sumDigits(finalH7); }
    // console.log(`[getFinalH7Value H11] Final H7 for H11 calculation: ${finalH7}`); // Giảm console log
    return finalH7;
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
    const finalH10 = 22 - finalH9Result;
    // console.log(`[getFinalH10Value H11] Final H10 for H11 calculation: ${finalH10}`); // Giảm console log
    return finalH10;
};

const getFinalH11Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH3_initial = calculateH3InitialValue(year); 
    const finalH7Result = getFinalH7Value(month, year); 
    const finalH10Result = getFinalH10Value(day, month, year);

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
// --- End of Helper Functions ---

// --- Interface cho Props (Thêm onBack) ---
interface Props {
    onBack: () => void;
}

// --- Component H11Screen (Sửa đổi để giống H5Screen) ---
export default function H11Screen({ onBack }: Props) {
    const [h11Number, setH11Number] = useState<number | null>(null);
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setH11Number(null);
            setMandalaDescription(null);

            try {
                // console.log("[H11Screen] Fetching user data from AsyncStorage key: 'userInfo'");
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
                        // console.log("[H11Screen] Relevant user data for H11:", componentSpecificUserInfo);

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
                                // console.warn(`[H11Screen] No valid description found for H11=${finalH11}. API returned:`, description);
                            }
                        } else {
                            setError("Lỗi tính toán H11.");
                            setMandalaDescription("Lỗi tính toán H11 từ ngày, tháng và năm cung cấp.");
                        }
                    } else {
                        // console.warn("[H11Screen] dd, mm, or<y_bin_46> field is missing or not a number in stored userInfo.");
                        const missingFields = ['dd', 'mm', 'yyyy'].filter(f => typeof parsedFullUserInfo[f] !== 'number').join(', ');
                        setError(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu.`);
                        setMandalaDescription(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu từ thông tin đã lưu.`);
                    }
                } else {
                    // console.warn("[H11Screen] No 'userInfo' found in AsyncStorage.");
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
                // console.error("[H11Screen] Error during loadData:", err);
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
                // console.log("[H11Screen] Loading finished.");
            }
        };
        loadData();
    }, []);

    return (
        <ImageBackground source={BACKGROUND_IMAGE} style={styles.background} resizeMode="cover">
            {/* Header chứa nút Back - Giống H5Screen */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Title - Giống H5Screen */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>H11</Text> {/* Thay title thành H11 */}
                </View>

                {/* Number circle - Giống H5Screen */}
                <View style={styles.circle}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#E600E6" />
                    ) : (
                        <Text style={styles.number}>{h11Number ?? '-'}</Text>
                    )}
                </View>

                {/* Description - Giống H5Screen */}
                <View style={styles.textBox}>
                    <Text style={styles.descriptionText}>
                        {loading
                            ? 'Đang tải mô tả...'
                            : mandalaDescription || error || 'Không có mô tả.'}
                    </Text>
                </View>
            </ScrollView>
        </ImageBackground>
    );
}

// --- Styles (Áp dụng style của H5Screen) ---
const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    header: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 10,
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 100,
        paddingBottom: 100,
        alignItems: 'center',
    },
    titleContainer: {
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFF00',
    },
    circle: {
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: (width * 0.5) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    number: {
        fontSize: width * 0.2,
        fontWeight: 'bold',
        color: '#E600E6',
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    textBox: {
        marginTop: 30,
        padding: 20,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    descriptionText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 24,
    },
});