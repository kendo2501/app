import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
    Dimensions,
    ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchMandalaInfoByNumber } from '../../api/apiMandala';

interface Props {
    onBack: () => void;
}

interface UserInfo {
    dd: number;
}

const { width } = Dimensions.get('window');

const calculateDayNumber = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || day <= 0) return null;
    if (day <= 22) return day;
    const sum = String(day)
        .split('')
        .reduce((s, digit) => s + parseInt(digit, 10), 0);
    return sum;
};

export default function H1({ onBack }: Props) {
    const [dayNumber, setDayNumber] = useState<number | null>(null);
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const storedUserInfo = await AsyncStorage.getItem('userInfo');
                if (storedUserInfo) {
                    const parsedUserInfo: UserInfo = JSON.parse(storedUserInfo);
                    const calculatedNumber = calculateDayNumber(parsedUserInfo.dd);
                    setDayNumber(calculatedNumber);

                    if (calculatedNumber !== null) {
                        const description = await searchMandalaInfoByNumber(calculatedNumber);
                        if (typeof description === 'string' && description.trim().length > 0) {
                            setMandalaDescription(description);
                        } else {
                            setMandalaDescription(`Không tìm thấy mô tả cho số ${calculatedNumber}.`);
                        }
                    } else {
                        setMandalaDescription("Không thể tính số chủ đạo từ ngày sinh.");
                    }
                } else {
                    setError("Không tìm thấy thông tin người dùng.");
                    setMandalaDescription("Vui lòng đăng nhập lại.");
                }
            } catch (err: any) {
                let errorMessage = "Lỗi không xác định.";
                if (err instanceof SyntaxError) errorMessage = "Lỗi định dạng dữ liệu.";
                else if (err?.message) errorMessage = err.message;
                setError(errorMessage);
                setMandalaDescription("Lỗi khi tải mô tả.");
                Alert.alert("Lỗi", errorMessage);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <ImageBackground
            source={require('../../assets/images/background.jpg')}
            style={styles.background}
            resizeMode="cover"
        >
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* H1 Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>H1</Text>
                </View>

                {/* Circle number */}
                <View style={styles.circle}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#E600E6" />
                    ) : (
                        <Text style={styles.number}>{dayNumber ?? '-'}</Text>
                    )}
                </View>

                {/* Spacer to push description lower */}
                <View style={{ flex: 1 }} />

                {/* Description box */}
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
