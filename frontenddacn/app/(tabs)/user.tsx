<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function InfoStaticScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<{
    fullName: string;
    dd: number;
    mm: number;
    yyyy: number;
  } | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const stored = await AsyncStorage.getItem('userInfo');
      if (stored) {
        setUserInfo(JSON.parse(stored));
      }
    };
    fetchUserInfo();
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

=======
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

  useEffect(() => {
    const loadStoredUserData = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          if (userInfo) {
            setFullName(userInfo.fullName || '');
            setDay(userInfo.dd || '');
            setMonth(userInfo.mm || '');
            setYear(userInfo.yyyy || '');
          }
        }
      } catch (error) {
        console.error('Lỗi đọc AsyncStorage:', error);
      }
    };

    if (!isLoading) {
      loadStoredUserData();
    }
  }, [isLoading]);

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
      router.push('/'); // Điều hướng sau khi lưu thành công
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

  const handleLogout = async () => {
    try {
      // Xóa dữ liệu người dùng khỏi AsyncStorage và context
      await AsyncStorage.removeItem('userInfo');
      await clearUserData(); // Đảm bảo xóa dữ liệu từ context
      router.push('/login'); // Điều hướng về màn hình đăng nhập
    } catch (error) {
      console.error('Lỗi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

>>>>>>> 9f50e10aa843a78bc303a01ea687305b76f34581
  return (
    <ImageBackground
      source={require('../../assets/images/background.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
<<<<<<< HEAD
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>⎋</Text>
      </TouchableOpacity>

      <View style={styles.centerContent}>
        <Text style={styles.name}>
          {userInfo?.fullName || 'Đang tải...'}
        </Text>

        <View style={styles.dateContainer}>
          <Text style={styles.datePart}>
            {userInfo?.dd?.toString().padStart(2, '0') || '--'}
          </Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.datePart}>
            {userInfo?.mm?.toString().padStart(2, '0') || '--'}
          </Text>
          <Text style={styles.separator}>/</Text>
          <Text style={styles.datePart}>
            {userInfo?.yyyy?.toString() || '----'}
          </Text>
        </View>
      </View>
=======
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

              {/* Nút Đăng xuất */}
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
>>>>>>> 9f50e10aa843a78bc303a01ea687305b76f34581
    </ImageBackground>
  );
}

<<<<<<< HEAD
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  logoutText: {
    fontSize: 24,
    color: '#fff',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  datePart: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  separator: {
    fontSize: 24,
    color: '#fff',
    marginHorizontal: 6,
  },
=======
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
  logoutButton: { marginTop: 20, paddingVertical: 10, backgroundColor: '#f00', borderRadius: 25, width: '100%', alignItems: 'center' },
  logoutButtonText: { fontSize: 18, color: 'white' },
>>>>>>> 9f50e10aa843a78bc303a01ea687305b76f34581
});
