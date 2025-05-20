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
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import hàm gọi API từ file service
import { searchMandalaInfoByNumber } from '../../api/apiMandala'; // Đảm bảo đường dẫn đúng

// --- Cấu hình ---
const BACKGROUND_IMAGE = require('../../assets/images/background.jpg'); // Đường dẫn tới ảnh nền

// --- TypeScript Interface for UserInfo ---
// Defines the structure of the user information expected from AsyncStorage.
// For this "H1" screen, 'dd' is crucial for calculation.
// 'mm' and 'yyyy' are part of the user's date.
// 'fullName' is optional for this screen's core logic but might be available.
interface UserInfo {
  dd: number;         // Required: Day of birth, used for calculation
}

// Hàm tính toán con số chủ đạo (using only the day 'dd')
const calculateDayNumber = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || day <= 0) {
        return null;
    }
    if (day <= 22) {
        return day;
    } else {
        const sum = String(day)
            .split('')
            .reduce((s, digit) => s + parseInt(digit, 10), 0);
        return sum;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    absoluteFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: undefined,
        height: undefined,
        resizeMode: 'cover',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 15, // Adjust if using react-native-safe-area-context
        paddingBottom: 10,
        width: '100%',
    },
    backButton: {
        padding: 5,
    },
    backButtonPlaceholder: {
        width: 38,
        height: 38,
    },
    titleContainer: {
        backgroundColor: 'white',
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    circle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    number: {
        fontSize: 80,
        fontWeight: 'bold',
        color: '#E6007E',
    },
    textBox: {
        backgroundColor: 'rgba(211, 211, 211, 0.85)',
        padding: 25,
        borderRadius: 10,
        width: '90%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
        elevation: 2,
        minHeight: 100,
        justifyContent: 'center',
    },
    descriptionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default function App() {
    const [dayNumber, setDayNumber] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            setUserInfo(null);
            setDayNumber(null);
            setMandalaDescription(null);

            try {
                console.log("[App] Fetching user data from AsyncStorage key: 'userInfo'");
                const storedUserInfo = await AsyncStorage.getItem('userInfo');

                if (storedUserInfo) {
                    const parsedUserInfo: UserInfo = JSON.parse(storedUserInfo);
                    setUserInfo(parsedUserInfo);
                    console.log("[App] User data (dd, mm, yyyy, ?fullName) received:", parsedUserInfo);

                    // Calculate Day Number using only 'dd' (day of birth)
                    const calculatedNumber = calculateDayNumber(parsedUserInfo.dd);
                    console.log(`[App] Calculated day number from dd=${parsedUserInfo.dd}: ${calculatedNumber}`);
                    setDayNumber(calculatedNumber);

                    if (calculatedNumber !== null) {
                        console.log(`[App] Fetching Mandala description for number: ${calculatedNumber}`);
                        const description = await searchMandalaInfoByNumber(calculatedNumber);
                        console.log(`[App] Mandala description received: "${description}"`);

                        if (typeof description === 'string' && description.trim().length > 0) {
                            setMandalaDescription(description);
                        } else {
                            setMandalaDescription(`Không tìm thấy mô tả cho số ${calculatedNumber}.`);
                        }
                    } else {
                        setMandalaDescription("Không thể tính số chủ đạo từ ngày sinh.");
                    }
                } else {
                    setError("Không tìm thấy thông tin người dùng (ngày tháng năm sinh) đã lưu.");
                    setMandalaDescription("Vui lòng kiểm tra thông tin người dùng hoặc đăng nhập lại.");
                }
            } catch (err: any) {
                console.error("Error in App component loadData:", err);
                let errorMessage = "Đã xảy ra lỗi không xác định khi tải dữ liệu.";
                if (err instanceof SyntaxError) {
                    errorMessage = "Lỗi định dạng dữ liệu người dùng đã lưu.";
                } else if (err?.message) {
                    errorMessage = err.message;
                }
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải dữ liệu mô tả.");
                Alert.alert("Lỗi Tải Dữ Liệu", errorMessage);
            } finally {
                setLoading(false);
                console.log("[App] Loading finished.");
            }
        };

        loadData();
    }, []);

    const handleGoBack = () => {
        console.log('Go back pressed');
        // Add navigation logic (e.g., router.back() if using expo-router)
    };

    if (loading && !userInfo) {
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor: '#2c3e50' }]}>
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
                    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={28} color="white" />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        {/* Title is static "H1". You could display userInfo.fullName if available and desired */}
                        <Text style={styles.title}>H1</Text>
                        {/* Example: <Text style={styles.title}>{userInfo?.fullName || 'H1'}</Text> */}
                    </View>
                    <View style={styles.backButtonPlaceholder} />
                </View>

                <View style={styles.content}>
                    <View style={styles.circle}>
                        {(loading && dayNumber === null && userInfo !== null) ? (
                            <ActivityIndicator size="small" color="#E6007E" />
                        ) : dayNumber !== null ? (
                            <Text style={styles.number}>{dayNumber}</Text>
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
                                error && !mandalaDescription ?
                                "Lỗi: " + error :
                                "Không có mô tả hoặc không thể tải."
                            }
                        </Text>
                    </View>
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
}