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

// Tính tổng các chữ số (Dùng cho H1, H3, H4, H5)
const sumDigits = (num: number): number => {
    try {
        if (num < 0) return 0;
        return String(num)
            .split('')
            .reduce((s, digit) => {
                const digitNum = parseInt(digit, 10);
                return s + (isNaN(digitNum) ? 0 : digitNum);
            }, 0);
    } catch (e) { console.error(`[sumDigits H5] Error:`, e); return 0; }
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
    console.warn(`[calculateH2InitialValue H5] Invalid month input: ${monthInput}`);
    return null;
};

// H3 Ban đầu (Cũ - dựa trên Vishal)
const calculateH3InitialValue = (year: number | null | undefined): number | null => {
    if (year === null || year === undefined || typeof year !== 'number' || year <= 0) return null;
    try { return sumDigits(year); } catch (e) { return null; }
};

// H4 Final (<=22 - Life Path)
const getFinalH4Value = (day: number | string | null | undefined, month: number | string | null | undefined, year: number | string | null | undefined): number | null => {
    const dayNum = (typeof day === 'string') ? Number(day) : day;
    const monthNum = calculateH2InitialValue(month); // Sử dụng H2 đã sửa
    const yearNum = (typeof year === 'string') ? Number(year) : year;
     if (dayNum === null || monthNum === null || yearNum === null || isNaN(dayNum) || isNaN(yearNum) || dayNum <=0 || yearNum <=0 ) return null;
    try {
        let currentSum = dayNum + monthNum + yearNum;
        while (currentSum > 22) { currentSum = sumDigits(currentSum); }
        // console.log(`[getFinalH4Value H5] final H4: ${currentSum}`);
        return currentSum;
    } catch (e) { return null; }
};

// H5 Final (<=22)
const getFinalH5Value = (day: number | string | null | undefined, month: number | string | null | undefined, year: number | string | null | undefined): number | null => {
     const resultH1 = calculateH1InitialValue(typeof day === 'string' ? Number(day) : day); // H1 ban đầu
     const resultH2 = calculateH2InitialValue(month); // Sử dụng H2 đã sửa
     const resultH3 = calculateH3InitialValue(typeof year === 'string' ? Number(year) : year); // H3 ban đầu
     const finalH4 = getFinalH4Value(day, month, year); // H4 cuối

     if (resultH1 === null || resultH2 === null || resultH3 === null || finalH4 === null) {
         console.error(`[getFinalH5Value H5] Failed due to null intermediate: H1=${resultH1}, H2=${resultH2}, H3=${resultH3}, H4=${finalH4}`);
         return null;
     }
     let finalH5 = resultH1 + resultH2 + resultH3 + finalH4;
     console.log(`[getFinalH5Value H5] Initial sum (H1i+H2i+H3i+H4f): ${finalH5}`);
     while (finalH5 > 22) {
         console.log(`[getFinalH5Value H5] Reducing H5 sum ${finalH5} (> 22)...`);
         finalH5 = sumDigits(finalH5);
     }
     console.log(`[getFinalH5Value H5] final H5: ${finalH5}`);
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
    const [userData, setUserData] = useState<any>(null);
    const [mandalaDescription, setMandalaDescription] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
             setLoading(true); setError(null); setUserData(null);
             setH5Number(null); setMandalaDescription(null);
             try {
                const fetchedUserData = await getUserById(USER_ID_TO_FETCH);
                setUserData(fetchedUserData);
                const dayValue = fetchedUserData?.dd;
                const monthValue = fetchedUserData?.mm; // Input tháng (có thể là string "0X")
                const yearValue = fetchedUserData?.yyyy;

                console.log(`[H5] Inputs: dd=${dayValue}, mm=${monthValue}, Vishal=${yearValue}`);

                const finalH5 = getFinalH5Value(dayValue, monthValue, yearValue); // Tính H5 cuối cùng
                setH5Number(finalH5);
                // Log giá trị cuối đã có trong getFinalH5Value

                 if (finalH5 !== null) {
                    const description = await searchMandalaInfoByNumber(finalH5);
                    if (typeof description === 'string' && description.trim().length > 0) {
                        setMandalaDescription(description);
                    } else {
                        setMandalaDescription(`Không tìm thấy mô tả cho số H5: ${finalH5}.`);
                         console.warn(`[H5] No valid description found for H5=${finalH5}. API returned:`, description);
                    }
                 } else {
                     setError("Lỗi tính toán H5 do dữ liệu ngày/tháng/năm không hợp lệ.");
                     setMandalaDescription("Lỗi tính toán H5.");
                 }
             } catch (err: any) {
                 console.error("[H5] Error loading data:", err);
                 const errorMessage = err?.message || "Đã xảy ra lỗi không xác định.";
                 setError(errorMessage);
                 setMandalaDescription("Lỗi khi tải dữ liệu.");
                 Alert.alert("Lỗi H5", errorMessage);
             }
             finally { setLoading(false); console.log("[H5] Loading finished.");}
        };
        loadData();
    }, []);

      const handleGoBack = () => { console.log('Go back pressed'); };

     // --- Render Logic ---
      if (loading && !userData) {
         // Màn hình loading ban đầu
        return ( <View style={[styles.container, styles.centerContent]}><ImageBackground source={BACKGROUND_IMAGE} style={StyleSheet.absoluteFill} /><ActivityIndicator size="large" color="#ffffff" /><Text style={{ color: 'white', marginTop: 10 }}>Đang tải dữ liệu...</Text></View> );
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
                          {(loading && h5Number === null) ? (<ActivityIndicator size="small" color="#E6007E" />) : h5Number !== null ? (<Text style={styles.number}>{h5Number}</Text>) : (<Text style={styles.number}>-</Text>)}
                      </View>
                      <View style={styles.textBox}>
                           <Text style={styles.descriptionText}>{loading ? "Đang tải mô tả..." : mandalaDescription ? mandalaDescription : error ? error : "Không có mô tả."}</Text>
                      </View>
                  </View>
              </SafeAreaView>
          </ImageBackground>
       );
}