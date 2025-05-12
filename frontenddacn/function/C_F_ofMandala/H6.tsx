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
import { searchMandalaInfoByNumber } from '../../api/apiMandala'; // Đảm bảo đường dẫn đúng

// --- Cấu hình ---
const USER_ID_TO_FETCH = 1;
const BACKGROUND_IMAGE = require('../assets/images/background.jpg');

// --- Helper Functions ---

// Tính tổng các chữ số (Dùng cho H1 và rút gọn H6)
const sumDigits = (num: number): number => {
    try {
        if (num < 0) return 0;
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum);
            }, 0);
    } catch (e) { console.error(`[sumDigits H6] Error:`, e); return 0; }
};

// H1 Ban đầu (Mới - dựa trên dd)
const calculateH1InitialValue = (day: number | null | undefined): number | null => {
    if (day === null || day === undefined || typeof day !== 'number' || day <= 0) return null;
    if (day <= 22) return day;
    return sumDigits(day);
};

// H2 Ban đầu (Tháng hợp lệ - ĐÃ SỬA ĐỂ NHẬN CẢ STRING "0X")
const calculateH2InitialValue = (monthInput: number | string | null | undefined): number | null => {
    if (monthInput === null || monthInput === undefined || monthInput === '') return null;
    const monthValue = Number(monthInput);
    if (!isNaN(monthValue) && Number.isInteger(monthValue) && monthValue >= 1 && monthValue <= 12) return monthValue;
    console.warn(`[calculateH2InitialValue H6] Invalid month input: ${monthInput}`);
    return null;
};

// H6 Final (<=22)
const getFinalH6Value = (day: number | string | null | undefined, month: number | string | null | undefined): number | null => {
    const resultH1 = calculateH1InitialValue(typeof day === 'string' ? Number(day) : day); // H1 ban đầu
    const resultH2 = calculateH2InitialValue(month); // Sử dụng H2 đã sửa

    if (resultH1 === null || resultH2 === null) {
         console.error(`[getFinalH6Value H6] Failed due to null intermediate: H1=${resultH1}, H2=${resultH2}`);
         return null;
    }
    let finalH6 = resultH1 + resultH2;
     console.log(`[getFinalH6Value H6] Initial sum (H1i+H2i): ${finalH6}`);
    while (finalH6 > 22) {
         console.log(`[getFinalH6Value H6] Reducing H6 sum ${finalH6} (> 22)...`);
         finalH6 = sumDigits(finalH6);
    }
    console.log(`[getFinalH6Value H6] final H6: ${finalH6}`);
    return finalH6;
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

// --- Component H6 ---
export default function H6Screen() {
    const [h6Number, setH6Number] = useState<number | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
             setLoading(true); setError(null); setUserData(null);
             setH6Number(null); setMandalaDescription(null);
             try {
                const fetchedUserData = await getUserById(USER_ID_TO_FETCH);
                setUserData(fetchedUserData);
                const dayValue = fetchedUserData?.dd;
                const monthValue = fetchedUserData?.mm; // Input tháng (có thể là string "0X")

                console.log(`[H6] Inputs: dd=${dayValue}, mm=${monthValue}`);

                const finalH6 = getFinalH6Value(dayValue, monthValue); // Tính H6 cuối cùng
                setH6Number(finalH6);
                // Log giá trị cuối đã có trong getFinalH6Value

                 if (finalH6 !== null) {
                    const description = await searchMandalaInfoByNumber(finalH6);
                    if (typeof description === 'string' && description.trim().length > 0) {
                        setMandalaDescription(description);
                    } else {
                        setMandalaDescription(`Không tìm thấy mô tả cho số H6: ${finalH6}.`);
                        console.warn(`[H6] No valid description found for H6=${finalH6}. API returned:`, description);
                    }
                 } else {
                     setError("Lỗi tính toán H6 do dữ liệu ngày/tháng không hợp lệ.");
                     setMandalaDescription("Lỗi tính toán H6.");
                 }
             } catch (err: any) {
                 console.error("[H6] Error loading data:", err);
                 const errorMessage = err?.message || "Đã xảy ra lỗi không xác định.";
                 setError(errorMessage);
                 setMandalaDescription("Lỗi khi tải dữ liệu.");
                 Alert.alert("Lỗi H6", errorMessage);
             }
             finally { setLoading(false); console.log("[H6] Loading finished."); }
        };
        loadData();
    }, []);

      const handleGoBack = () => { console.log('Go back pressed'); };

     // --- Render Logic ---
      if (loading && !userData) {
        return ( <View style={[styles.container, styles.centerContent]}><ImageBackground source={BACKGROUND_IMAGE} style={StyleSheet.absoluteFill} /><ActivityIndicator size="large" color="#ffffff" /><Text style={{ color: 'white', marginTop: 10 }}>Đang tải dữ liệu...</Text></View> );
      }
      return (
          <ImageBackground source={BACKGROUND_IMAGE} style={styles.background}>
              <SafeAreaView style={styles.safeArea}>
                  <StatusBar barStyle="light-content" />
                  <View style={styles.header}>
                      <TouchableOpacity onPress={handleGoBack} style={styles.backButton}><Ionicons name="arrow-back" size={28} color="white" /></TouchableOpacity>
                      <View style={styles.titleContainer}><Text style={styles.title}>H6</Text></View>
                      <View style={styles.backButtonPlaceholder} />
                  </View>
                  <View style={styles.content}>
                      <View style={styles.circle}>
                          {(loading && h6Number === null) ? (<ActivityIndicator size="small" color="#E6007E" />) : h6Number !== null ? (<Text style={styles.number}>{h6Number}</Text>) : (<Text style={styles.number}>-</Text>)}
                      </View>
                      <View style={styles.textBox}>
                           <Text style={styles.descriptionText}>{loading ? "Đang tải mô tả..." : mandalaDescription ? mandalaDescription : error ? error : "Không có mô tả."}</Text>
                      </View>
                  </View>
              </SafeAreaView>
          </ImageBackground>
       );
}