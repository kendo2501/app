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

// --- TypeScript Interface for UserInfo (H6 specific) ---
interface UserInfo {
    dd: number;
    mm: number;
}

const { width } = Dimensions.get('window'); // Thêm để style động giống H5Screen

// --- Helper Functions (Giữ nguyên logic H6 của bạn) ---
const sumDigits = (num: number): number => {
    try {
        if (num < 0) {
            console.warn(`[sumDigits H6] Input is negative (${num}), returning 0.`);
            return 0;
        }
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum);
            }, 0);
    } catch (e) { console.error(`[sumDigits H6] Error for input ${num}:`, e); return 0; }
};

const calculateH1InitialValue = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || typeof day !== 'number' || day <= 0 || day > 31) {
        console.warn(`[calculateH1InitialValue H6] Invalid day input: ${day}`);
        return null;
    }
    if (day <= 22) return day;
    return sumDigits(day);
};

const calculateH2InitialValue = (monthInput: number | null | undefined): number | null => {
    if (monthInput === null || monthInput === undefined || typeof monthInput !== 'number' || monthInput < 1 || monthInput > 12) {
        console.warn(`[calculateH2InitialValue H6] Invalid month input: ${monthInput}`);
        return null;
    }
    return monthInput;
};

const getFinalH6Value = (day: number | null | undefined, month: number | null | undefined): number | null => {
    const resultH1 = calculateH1InitialValue(day);
    const resultH2 = calculateH2InitialValue(month);

    if (resultH1 === null || resultH2 === null) {
        console.error(`[getFinalH6Value H6] Failed due to null intermediate: H1=${resultH1}, H2=${resultH2}`);
        return null;
    }
    let finalH6 = resultH1 + resultH2;
    console.log(`[getFinalH6Value H6] Initial sum (H1i+H2i): ${resultH1}+${resultH2} = ${finalH6}`);
    while (finalH6 > 22) {
        const prevSum = finalH6;
        finalH6 = sumDigits(finalH6);
        console.log(`[getFinalH6Value H6] Reducing H6 sum ${prevSum} -> ${finalH6}`);
    }
    console.log(`[getFinalH6Value H6] final H6: ${finalH6}`);
    return finalH6;
};
// --- End of Helper Functions ---

// --- Interface cho Props (Thêm onBack) ---
interface Props {
    onBack: () => void;
}

// --- Component H6Screen (Sửa đổi để giống H5Screen) ---
export default function H6Screen({ onBack }: Props) { // Thêm onBack vào props
    const [h6Number, setH6Number] = useState<number | null>(null);
    // Bỏ state userInfo riêng nếu không cần hiển thị gì đặc biệt từ nó ngoài việc tính toán
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setH6Number(null); // Reset các state khi load lại
            setMandalaDescription(null);

            try {
                console.log("[H6Screen] Fetching user data from AsyncStorage key: 'userInfo'");
                const storedUserInfo = await AsyncStorage.getItem('userInfo');

                if (storedUserInfo) {
                    const parsedFullUserInfo = JSON.parse(storedUserInfo);

                    if (typeof parsedFullUserInfo.dd === 'number' &&
                        typeof parsedFullUserInfo.mm === 'number') {

                        const componentSpecificUserInfo: UserInfo = {
                            dd: parsedFullUserInfo.dd,
                            mm: parsedFullUserInfo.mm,
                        };
                        console.log("[H6Screen] Relevant user data for H6:", componentSpecificUserInfo);

                        const finalH6 = getFinalH6Value(
                            componentSpecificUserInfo.dd,
                            componentSpecificUserInfo.mm
                        );
                        setH6Number(finalH6);

                        if (finalH6 !== null) {
                            const description = await searchMandalaInfoByNumber(finalH6);
                            if (typeof description === 'string' && description.trim().length > 0) {
                                setMandalaDescription(description);
                            } else {
                                setMandalaDescription(`Không tìm thấy mô tả cho số H6: ${finalH6}.`);
                                console.warn(`[H6Screen] No valid description found for H6=${finalH6}. API returned:`, description);
                            }
                        } else {
                            // Lỗi này đã được console.error bên trong getFinalH6Value nếu có
                            setError("Lỗi tính toán H6."); // Thông báo lỗi chung hơn
                            setMandalaDescription("Lỗi tính toán H6 từ ngày và tháng cung cấp.");
                        }
                    } else {
                        console.warn("[H6Screen] dd or mm field is missing or not a number in stored userInfo.");
                        const missingFields = ['dd', 'mm'].filter(f => typeof parsedFullUserInfo[f] !== 'number').join(', ');
                        setError(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu.`);
                        setMandalaDescription(`Dữ liệu (${missingFields}) không hợp lệ hoặc bị thiếu từ thông tin đã lưu.`);
                    }
                } else {
                    console.warn("[H6Screen] No 'userInfo' found in AsyncStorage.");
                    setError("Không tìm thấy thông tin người dùng đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra lại thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
                console.error("[H6Screen] Error during loadData:", err);
                let errorMessage = "Đã xảy ra lỗi không xác định.";
                if (err instanceof SyntaxError) {
                    errorMessage = "Lỗi định dạng dữ liệu người dùng đã lưu.";
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage); // Set lỗi để có thể hiển thị nếu cần
                setMandalaDescription("Lỗi khi tải dữ liệu."); // Cập nhật mandalaDescription để hiển thị lỗi
                Alert.alert("Lỗi H6", errorMessage);
            } finally {
                setLoading(false);
                console.log("[H6Screen] Loading finished.");
            }
        };
        loadData();
    }, []);

    // Không cần hàm handleGoBack riêng nếu dùng onBack từ props

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
                    <Text style={styles.title}>H6</Text> {/* Thay title thành H6 */}
                </View>

                {/* Number circle - Giống H5Screen */}
                <View style={styles.circle}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#E600E6" /> 
                    ) : (
                        <Text style={styles.number}>{h6Number ?? '-'}</Text>
                    )}
                </View>

                {/* Description - Giống H5Screen */}
                <View style={styles.textBox}>
                    <Text style={styles.descriptionText}>
                        {loading
                            ? 'Đang tải mô tả...'
                            : mandalaDescription || error /* Hiển thị error nếu có */ || 'Không có mô tả.'}
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
    header: { // Style header của H5Screen
        position: 'absolute',
        top: 40, // Điều chỉnh nếu cần cho SafeAreaView hoặc status bar ở app level
        left: 20,
        zIndex: 10,
    },
    backButton: { // Style backButton của H5Screen
        padding: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
    },
    scrollContainer: { // Style scrollContainer của H5Screen
        flexGrow: 1,
        paddingHorizontal: 20,
        paddingTop: 100, // Đủ không gian cho header/nút back
        paddingBottom: 100,
        alignItems: 'center',
    },
    titleContainer: { // Style titleContainer của H5Screen
        paddingVertical: 6,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginBottom: 20,
        // backgroundColor: 'rgba(0,0,0,0.2)', // Tùy chọn nền cho title nếu muốn
    },
    title: { // Style title của H5Screen
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFF00', // Màu vàng cho tiêu đề
    },
    circle: { // Style circle của H5Screen
        width: width * 0.5,
        height: width * 0.5,
        borderRadius: (width * 0.5) / 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        // backgroundColor: 'rgba(255,255,255,0.1)', // Tùy chọn nền cho circle
    },
    number: { // Style number của H5Screen
        fontSize: width * 0.2,
        fontWeight: 'bold',
        color: '#E600E6', // Màu tím cho số
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    textBox: { // Style textBox của H5Screen
        marginTop: 30,
        padding: 20,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 120,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    descriptionText: { // Style descriptionText của H5Screen
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 24,
    },
});