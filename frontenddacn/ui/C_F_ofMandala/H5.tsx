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

const BACKGROUND_IMAGE = require('../../assets/images/background.jpg');

interface Props {
    onBack: () => void;
}

interface UserInfo {
    dd: number;
    mm: number;
    yyyy: number;
}

const { width } = Dimensions.get('window');

const sumDigits = (num: number): number => {
    return String(num)
        .split('')
        .reduce((sum, digit) => sum + parseInt(digit, 10), 0);
};

const getFinalH5Value = (dd: number, mm: number, yyyy: number): number | null => {
    if (!dd || !mm || !yyyy) return null;

    const h1 = dd <= 22 ? dd : sumDigits(dd);
    const h2 = mm;
    const h3 = sumDigits(yyyy);
    let h4 = dd + mm + yyyy;
    while (h4 > 22) h4 = sumDigits(h4);

    let h5 = h1 + h2 + h3 + h4;
    while (h5 > 22) h5 = sumDigits(h5);

    return h5;
};

export default function H5Screen({ onBack }: Props) {
    const [h5Number, setH5Number] = useState<number | null>(null);
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
                    const parsed: UserInfo = JSON.parse(storedUserInfo);
                    const h5 = getFinalH5Value(parsed.dd, parsed.mm, parsed.yyyy);
                    setH5Number(h5);

                    if (h5 !== null) {
                        const desc = await searchMandalaInfoByNumber(h5);
                        setMandalaDescription(desc || `Không tìm thấy mô tả cho số ${h5}.`);
                    } else {
                        setMandalaDescription("Lỗi tính toán H5.");
                    }
                } else {
                    setError("Không tìm thấy thông tin người dùng.");
                    setMandalaDescription("Vui lòng đăng nhập lại.");
                }
            } catch (err: any) {
                const message = err?.message || 'Lỗi không xác định.';
                setError(message);
                setMandalaDescription("Đã xảy ra lỗi.");
                Alert.alert("Lỗi", message);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    return (
        <ImageBackground source={BACKGROUND_IMAGE} style={styles.background} resizeMode="cover">
            {/* Back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>H5</Text>
                </View>

                {/* Number circle */}
                <View style={styles.circle}>
                    {loading ? (
                        <ActivityIndicator size="small" color="#E600E6" />
                    ) : (
                        <Text style={styles.number}>{h5Number ?? '-'}</Text>
                    )}
                </View>

                {/* Description */}
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
