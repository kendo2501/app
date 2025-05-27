import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { BASE_URL } from '@/untils/url';

const RegisterScreen = () => {
  const router = useRouter();

  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [fullName, setFullName] = useState('');
  const [dd, setDd] = useState('');
  const [mm, setMm] = useState('');
  const [yyyy, setYyyy] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const today = new Date();
    setDd(today.getDate().toString());
    setMm((today.getMonth() + 1).toString());
    setYyyy(today.getFullYear().toString());
  }, []);

  const getDaysInMonth = (month: number, year: number) => {
    if (!month || !year) return 31;
    return new Date(year, month, 0).getDate();
  };

  const maxDays = getDaysInMonth(parseInt(mm) || 0, parseInt(yyyy) || 0);

  useEffect(() => {
    if (dd && parseInt(dd) > maxDays) setDd('');
  }, [mm, yyyy, dd, maxDays]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const isValidDate = (day: string, month: string, year: string) => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
    if (y < 1900 || y > new Date().getFullYear()) return false;
    const date = new Date(y, m - 1, d);
    return date.getFullYear() === y && date.getMonth() + 1 === m && date.getDate() === d;
  };

  const handleRegister = async () => {
    if (loading) return;

    showToast('➡ Đang xử lý đăng ký...');
    setLoading(true);

    if (!user || !pass || !fullName || !dd || !mm || !yyyy) {
      showToast('Vui lòng điền đầy đủ thông tin!', 'error');
      setLoading(false);
      return;
    }

    if (user.length < 6 || /\s/.test(user)) {
      showToast('Tên người dùng phải có ít nhất 6 ký tự và không có khoảng trắng!', 'error');
      setLoading(false);
      return;
    }

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passRegex.test(pass)) {
      showToast('Mật khẩu phải có ít nhất 6 ký tự, gồm cả chữ và số!', 'error');
      setLoading(false);
      return;
    }

    if (fullName.trim().split(' ').length < 2) {
      showToast('Họ tên phải có ít nhất 2 từ!', 'error');
      setLoading(false);
      return;
    }

    if (!isValidDate(dd, mm, yyyy)) {
      showToast('Ngày sinh không hợp lệ!', 'error');
      setLoading(false);
      return;
    }

    const payload = {
      user,
      pass,
      fullName: fullName.trim(),
      dd: parseInt(dd, 10),
      mm: parseInt(mm, 10),
      yyyy: parseInt(yyyy, 10),
    };

    try {
      const response = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        showToast('Đăng ký thành công!', 'success');
        setTimeout(() => router.replace('/login'), 1000);
      } else {
        showToast(result.message || 'Đăng ký thất bại', 'error');
      }
    } catch (error) {
      showToast('Không thể kết nối đến máy chủ. Vui lòng thử lại!', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require('../assets/images/backgound(login).jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.header}>Đăng ký</Text>

            {toastMessage ? (
              <View style={[styles.toast, toastType === 'success' ? styles.toastSuccess : styles.toastError]}>
                <Text style={styles.toastText}>{toastMessage}</Text>
              </View>
            ) : null}

            <TextInput
              style={styles.input}
              placeholder="Tên người dùng"
              placeholderTextColor="#FFFFFF"
              value={user}
              onChangeText={setUser}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#FFFFFF"
              value={pass}
              onChangeText={setPass}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Họ và tên (không dấu)"
              placeholderTextColor="#FFFFFF"
              value={fullName}
              onChangeText={setFullName}
            />

            <View style={styles.dateRow}>
              <View style={styles.datePicker}>
                <Picker
                  selectedValue={dd}
                  onValueChange={setDd}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Ngày" value="" />
                  {Array.from({ length: maxDays }, (_, i) => (
                    <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
                  ))}
                </Picker>
              </View>

              <View style={styles.datePicker}>
                <Picker
                  selectedValue={mm}
                  onValueChange={setMm}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Tháng" value="" />
                  {Array.from({ length: 12 }, (_, i) => (
                    <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
                  ))}
                </Picker>
              </View>

              <View style={styles.datePicker}>
                <Picker
                  selectedValue={yyyy}
                  onValueChange={setYyyy}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                  dropdownIconColor="#fff"
                >
                  <Picker.Item label="Năm" value="" />
                  {Array.from({ length: 121 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <Picker.Item key={year} label={`${year}`} value={`${year}`} />;
                  })}
                </Picker>
              </View>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Đăng ký'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/login')}>
              <Text style={styles.linkButtonText}>Đã có tài khoản? Đăng nhập ngay</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFD700',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 10,
    marginBottom: 30,
  },
  toastText: { textAlign: 'center', color: '#FFFFFF', fontSize: 16 },
  input: {
    height: 50,
    borderColor: '#FFD700',
    borderWidth: 2,
    borderRadius: 12,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#FFFFFF',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '100%',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
    width: '100%',
  },
  datePicker: {
    flex: 1,
    height: Platform.OS === 'ios' ? 60 : 50,
    borderColor: '#FFD700',
    borderWidth: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'center',
  },
  picker: {
    color: '#FFFFFF',
    height: '100%',
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    height: 50,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: '#1A1A1A',
    fontWeight: 'bold',
    fontSize: 18,
  },
  toast: { padding: 12, marginBottom: 15, borderRadius: 10 },
  toastSuccess: { backgroundColor: 'rgba(0, 255, 0, 0.2)' },
  toastError: { backgroundColor: 'rgba(255, 0, 0, 0.2)' },
  linkButton: { marginTop: 20, marginBottom: 20, alignItems: 'center' },
  linkButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;
