import React, { useState, useEffect } from 'react';
import {
  StyleSheet, View, Text, TextInput, ImageBackground, TouchableOpacity,
  Dimensions, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard,
  Platform, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { useUserData } from '../../context/userDataContext'; // Context lưu dữ liệu người dùng
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function InfoFormScreen() {
  const router = useRouter();
  const {
    saveUserData,
    isLoading,
    fullName: initialName,
    day: initialDay,
    month: initialMonth,
    year: initialYear,
    clearUserData,
  } = useUserData();

  const [fullName, setFullName] = useState('');
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khi load context xong -> tự động điền vào form
  useEffect(() => {
    const loadStoredUserData = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        console.log('Dữ liệu từ AsyncStorage:', userInfoString); // Ghi lại dữ liệu để kiểm tra
    
        if (userInfoString && userInfoString !== 'undefined') {
          try {
            const userInfo = JSON.parse(userInfoString);
            if (userInfo) {
              // Đảm bảo rằng tất cả các trường đều tồn tại và hợp lệ
              setFullName(userInfo.fullName || '');
              setDay(userInfo.dd || '');   // day = dd
              setMonth(userInfo.mm || '');  // month = mm
              setYear(userInfo.yyyy || ''); // year = yyyy
            } else {
              console.warn('Dữ liệu không hợp lệ trong AsyncStorage.');
            }
          } catch (parseError) {
            console.warn('Lỗi phân tích JSON:', parseError);
          }
        } else {
          console.log('Không có dữ liệu trong AsyncStorage hoặc dữ liệu không hợp lệ.');
        }
      } catch (error) {
        console.error('Lỗi đọc AsyncStorage:', error);
      }
    };
  
    if (!isLoading) {
      loadStoredUserData();
    }
  }, [isLoading, initialName, initialDay, initialMonth, initialYear]);

  const handleNameChange = (text: string) => {
    const sanitized = text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z\s]/g, '');
    setFullName(sanitized);
  };

  const clearInput = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter('');
  };

  const isValidDate = (d: string, m: string, y: string): boolean => {
    const dayInt = parseInt(d, 10);
    const monthInt = parseInt(m, 10);
    const yearInt = parseInt(y, 10);
    if (isNaN(dayInt) || isNaN(monthInt) || isNaN(yearInt)) return false;
    if (monthInt < 1 || monthInt > 12 || dayInt < 1 || yearInt < 1900 || yearInt > new Date().getFullYear() + 1) return false;
    const date = new Date(yearInt, monthInt - 1, dayInt);
    return date.getFullYear() === yearInt && date.getMonth() === monthInt - 1 && date.getDate() === dayInt;
  };

  const handleSubmit = async () => {
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên.');
      return;
    }
    if (!day || !month || !year) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ ngày, tháng, năm sinh.');
      return;
    }
    if (!isValidDate(day, month, year)) {
      Alert.alert('Lỗi', 'Ngày sinh không hợp lệ. Vui lòng kiểm tra lại.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveUserData({ fullName, day, month, year });
      router.push('index.ts'); // Điều hướng sau khi lưu thành công
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu. Vui lòng thử lại.');
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAndRestart = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa thông tin đã lưu và nhập lại?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đồng ý',
          onPress: async () => {
            await clearUserData();
            setFullName('');
            setDay('');
            setMonth('');
            setYear('');
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContainerForm}>
            <View style={styles.formContainer}>
              {/* Họ và tên */}
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="HỌ VÀ TÊN (KHÔNG DẤU)"
                  placeholderTextColor="#aaa"
                  value={fullName}
                  onChangeText={handleNameChange}
                  autoCapitalize="characters"
                  returnKeyType="next"
                  editable={!isSubmitting}
                />
                {fullName.length > 0 && !isSubmitting && (
                  <TouchableOpacity onPress={() => clearInput(setFullName)} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Ngày / Tháng / Năm */}
              <View style={styles.dateRow}>
                <View style={[styles.inputContainer, styles.dateInputContainer, { flex: 2 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="DD"
                    placeholderTextColor="#aaa"
                    value={day}
                    onChangeText={setDay}
                    keyboardType="number-pad"
                    maxLength={2}
                    returnKeyType="next"
                    editable={!isSubmitting}
                  />
                  {day.length > 0 && !isSubmitting && (
                    <TouchableOpacity onPress={() => clearInput(setDay)} style={styles.clearButton}>
                      <Text style={styles.clearButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.inputContainer, styles.dateInputContainer, { flex: 2 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="MM"
                    placeholderTextColor="#aaa"
                    value={month}
                    onChangeText={setMonth}
                    keyboardType="number-pad"
                    maxLength={2}
                    returnKeyType="next"
                    editable={!isSubmitting}
                  />
                  {month.length > 0 && !isSubmitting && (
                    <TouchableOpacity onPress={() => clearInput(setMonth)} style={styles.clearButton}>
                      <Text style={styles.clearButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.inputContainer, styles.dateInputContainer, { flex: 3 }]}>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY"
                    placeholderTextColor="#aaa"
                    value={year}
                    onChangeText={setYear}
                    keyboardType="number-pad"
                    maxLength={4}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    editable={!isSubmitting}
                  />
                  {year.length > 0 && !isSubmitting && (
                    <TouchableOpacity onPress={() => clearInput(setYear)} style={styles.clearButton}>
                      <Text style={styles.clearButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Nút Submit */}
              <TouchableOpacity
                style={[styles.submitButton, isSubmitting && styles.submittingButton]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Xem Kết Quả</Text>
                )}
              </TouchableOpacity>

              {/* Nút Nhập lại */}
              {(initialName || initialDay || initialMonth || initialYear) && !isSubmitting && (
                <TouchableOpacity style={styles.clearOldDataButton} onPress={handleClearAndRestart}>
                  <Text style={styles.clearOldDataButtonText}>Nhập lại từ đầu</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

// --- Style ---
const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#333' },
  background: { flex: 1, width: '100%', height: '100%' },
  keyboardAvoidingContainer: { flex: 1 },
  scrollContainerForm: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 50, paddingHorizontal: 15 },
  formContainer: { width: '100%', maxWidth: 500, padding: 20, alignItems: 'center' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 25, marginBottom: 15, width: '100%', paddingHorizontal: 15, height: 50, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 },
  input: { flex: 1, height: 50, fontSize: 16, padding: 0 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  dateInputContainer: { marginRight: 10 },
  clearButton: { position: 'absolute', top: 5, right: 5 },
  clearButtonText: { fontSize: 20, color: '#aaa' },
  submitButton: { backgroundColor: '#3a5', paddingVertical: 12, borderRadius: 25, width: '100%', alignItems: 'center' },
  submittingButton: { backgroundColor: '#666' },
  submitButtonText: { fontSize: 18, color: 'white' },
  clearOldDataButton: { marginTop: 20, paddingVertical: 10 },
  clearOldDataButtonText: { fontSize: 16, color: '#f00' },
});
