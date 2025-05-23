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

// --- TypeScript Interface for UserInfo (H13 specific) ---
interface UserInfo {
    dd: number;
    mm: number;
    yyyy: number;
}

const { width } = Dimensions.get('window');

// --- Helper Functions (Đầy đủ các hàm cần thiết cho H13) ---
const sumDigits = (num: number): number => {
    try {
        if (num < 0) return 0;
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum);
            }, 0);
    } catch (e) { return 0; }
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
    try { return sumDigits(year); } catch (e) { return null; }
};

const getFinalH1Value = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || typeof day !== 'number') return null;
    let initialResult = calculateH1InitialValue(day);
    if (initialResult === null) return null;
    while (initialResult > 22) { initialResult = sumDigits(initialResult); }
    return initialResult;
};

const getFinalH2Value = (monthInput: number | null | undefined): number | null => {
    return calculateH2InitialValue(monthInput);
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
    // console.log(`[getFinalH5Value H13] Final H5 for H13 calculation: ${finalH5}`);
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
    return 22 - finalH9Result;
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

const getFinalH13Value = (day: number | null | undefined, month: number | null | undefined, year: number | null | undefined): number | null => {
    const finalH1 = getFinalH1Value(day);
    const finalH2 = getFinalH2Value(month); 
    const finalH3 = getFinalH3Value(year);
    const finalH4 = getFinalH4Value(day, month, year);
    const finalH5 = getFinalH5Value(day, month, year); // Tính finalH5
    const finalH9 = getFinalH9Value(day, month, year);
    const finalH11 = getFinalH11Value(day, month, year);
    const finalH12 = getFinalH12Value(day, month, year);

    if (finalH1 === null || finalH2 === null || finalH3 === null || finalH4 === null || 
        finalH5 === null || finalH9 === null || finalH11 === null || finalH12 === null) {
        console.error("[getFinalH13Value H13] Failed due to null intermediate results.");
        return null;
    }

    const sumOfListedIntermediates = finalH1 + finalH2 + finalH3 + finalH4 + finalH5 + 
                                     finalH9 + finalH11 + finalH12;
    
    let initialH13Sum = sumOfListedIntermediates + finalH5; // Cộng finalH5 thêm một lần nữa
    console.log(`[getFinalH13Value H13] Sum(H1f..H12f excluding H6,H7,H10) + H5f = ${sumOfListedIntermediates} + ${finalH5} = ${initialH13Sum}`);

    let finalH13 = initialH13Sum;
    while (finalH13 > 22) {
        const prevSum = finalH13;
        finalH13 = sumDigits(finalH13);
        console.log(`[getFinalH13Value H13] Reducing H13 sum ${prevSum} -> ${finalH13}`);
    }
    console.log(`[getFinalH13Value H13] final H13: ${finalH13}`);
    return finalH13;
};
// --- End of Helper Functions ---

// --- Interface cho Props (Thêm onBack) ---
interface Props {
    onBack: () => void;
}

// --- Component H13Screen (Sửa đổi để giống H5Screen) ---
export default function H13Screen({ onBack }: Props) {
    const [h13Number, setH13Number] = useState<number | null>(null);
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setH13Number(null);
            setMandalaDescription(null);

            try {
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
                            }
                        } else {
                            setError("Lỗi tính toán H13.");
                            setMandalaDescription("Lỗi tính toán H13 từ ngày, tháng và năm cung cấp.");
                        }
                    } else {
                        const missingFields = ['dd', 'mm', 'yyyy'].filter(f => typeof parsedFullUserInfo[f] !== 'number').join(', ');
                        setError(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu.`);
                        setMandalaDescription(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu từ thông tin đã lưu.`);
                    }
                } else {
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
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
                    <Text style={styles.title}>H13</Text> {/* Thay title thành H13 */}
                </View>

                {/* Number circle - Giống H5Screen */}
                <View style={styles.circle}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#E600E6" />
                    ) : (
                        <Text style={styles.number}>{h13Number ?? '-'}</Text>
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