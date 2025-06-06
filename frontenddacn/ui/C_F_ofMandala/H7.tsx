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

const BACKGROUND_IMAGE = require('../../assets/images/background.jpg'); // Giữ nguyên

// --- TypeScript Interface for UserInfo (H7 specific) ---
interface UserInfo {
    mm: number;
    yyyy: number;
}

const { width } = Dimensions.get('window'); // Thêm để style động giống H5Screen

// --- Helper Functions (Giữ nguyên logic H7 của bạn) ---
const sumDigits = (num: number): number => {
    try {
        if (num < 0) {
            console.warn(`[sumDigits H7] Input is negative (${num}), returning 0.`);
            return 0;
        }
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum);
            }, 0);
    } catch (e) { console.error(`[sumDigits H7] Error for input ${num}:`, e); return 0; }
};

const calculateH2InitialValue = (monthInput: number | null | undefined): number | null => {
    if (monthInput === null || monthInput === undefined || typeof monthInput !== 'number' || monthInput < 1 || monthInput > 12) {
        console.warn(`[calculateH2InitialValue H7] Invalid month input: ${monthInput}`);
        return null;
    }
    return monthInput;
};

const calculateH3InitialValue = (year: number | null | undefined): number | null => {
    if (year === null || year === undefined || typeof year !== 'number' || year <= 0) {
        console.warn(`[calculateH3InitialValue H7] Invalid year input: ${year}`);
        return null;
    }
    try { return sumDigits(year); }
    catch (e) {
        console.error(`[calculateH3InitialValue H7] Error summing digits for year ${year}:`, e);
        return null;
    }
};

const getFinalH7Value = (month: number | null | undefined, year: number | null | undefined): number | null => {
    const resultH2 = calculateH2InitialValue(month);
    const resultH3 = calculateH3InitialValue(year);

    if (resultH2 === null || resultH3 === null) {
        console.error(`[getFinalH7Value H7] Failed due to null intermediate: H2=${resultH2}, H3=${resultH3}`);
        return null;
    }
    const difference = resultH2 - resultH3;
    let finalH7 = Math.abs(difference);
    console.log(`[getFinalH7Value H7] Initial |H2i - H3i|: |${resultH2} - ${resultH3}| = ${finalH7}`);

    while (finalH7 > 22) {
        const prevSum = finalH7;
        finalH7 = sumDigits(finalH7);
        console.log(`[getFinalH7Value H7] Reducing H7 result ${prevSum} -> ${finalH7}`);
    }
    console.log(`[getFinalH7Value H7] final H7: ${finalH7}`);
    return finalH7;
};
// --- End of Helper Functions ---

// --- Interface cho Props (Thêm onBack) ---
interface Props {
    onBack: () => void;
}

// --- Component H7Screen (Sửa đổi để giống H5Screen) ---
export default function H7Screen({ onBack }: Props) { // Thêm onBack vào props
    const [h7Number, setH7Number] = useState<number | null>(null);
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setH7Number(null); 
            setMandalaDescription(null);

            try {
                console.log("[H7Screen] Fetching user data from AsyncStorage key: 'userInfo'");
                const storedUserInfo = await AsyncStorage.getItem('userInfo');

                if (storedUserInfo) {
                    const parsedFullUserInfo = JSON.parse(storedUserInfo);

                    if (typeof parsedFullUserInfo.mm === 'number' &&
                        typeof parsedFullUserInfo.yyyy === 'number') {

                        const componentSpecificUserInfo: UserInfo = {
                            mm: parsedFullUserInfo.mm,
                            yyyy: parsedFullUserInfo.yyyy,
                        };
                        console.log("[H7Screen] Relevant user data for H7:", componentSpecificUserInfo);

                        const finalH7 = getFinalH7Value(
                            componentSpecificUserInfo.mm,
                            componentSpecificUserInfo.yyyy
                        );
                        setH7Number(finalH7);

                        if (finalH7 !== null) {
                            const description = await searchMandalaInfoByNumber(finalH7);
                            if (typeof description === 'string' && description.trim().length > 0) {
                                setMandalaDescription(description);
                            } else {
                                setMandalaDescription(`Không tìm thấy mô tả cho số H7: ${finalH7}.`);
                                console.warn(`[H7Screen] No valid description found for H7=${finalH7}. API returned:`, description);
                            }
                        } else {
                            setError("Lỗi tính toán H7.");
                            setMandalaDescription("Lỗi tính toán H7 từ tháng và năm cung cấp.");
                        }
                    } else {
                        console.warn("[H7Screen] mm or yyyy field is missing or not a number in stored userInfo.");
                        const missingFields = ['mm', 'yyyy'].filter(f => typeof parsedFullUserInfo[f] !== 'number').join(', ');
                        setError(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu.`);
                        setMandalaDescription(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu từ thông tin đã lưu.`);
                    }
                } else {
                    console.warn("[H7Screen] No 'userInfo' found in AsyncStorage.");
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
                console.error("[H7Screen] Error during loadData:", err);
                let errorMessage = "Đã xảy ra lỗi không xác định.";
                if (err instanceof SyntaxError) {
                    errorMessage = "Lỗi định dạng dữ liệu người dùng đã lưu.";
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải dữ liệu.");
                Alert.alert("Lỗi H7", errorMessage);
            } finally {
                setLoading(false);
                console.log("[H7Screen] Loading finished.");
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
                    <Text style={styles.title}>H7</Text> {/* Thay title thành H7 */}
                </View>

                {/* Number circle - Giống H5Screen */}
                <View style={styles.circle}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#E600E6" /> 
                    ) : (
                        <Text style={styles.number}>{h7Number ?? '-'}</Text>
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