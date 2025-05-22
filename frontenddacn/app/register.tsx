import React, { useState } from 'react';
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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const isValidDate = (day: string, month: string, year: string) => {
    const d = parseInt(day, 10),
      m = parseInt(month, 10),
      y = parseInt(year, 10);

    if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
    if (y < 1900 || y > new Date().getFullYear()) return false;

    const date = new Date(`${y}-${m}-${d}`);
    return (
      date.getFullYear() === y &&
      date.getMonth() + 1 === m &&
      date.getDate() === d
    );
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
        setTimeout(() => {
          router.replace('/login');
        }, 1000);
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
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
          style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 20 }}
        >
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
              <Picker selectedValue={dd} onValueChange={setDd} style={styles.picker}>
                <Picker.Item label="Ngày sinh" value="" />
                {Array.from({ length: 31 }, (_, i) => (
                  <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
                ))}
              </Picker>
            </View>

            <View style={styles.datePicker}>
              <Picker selectedValue={mm} onValueChange={setMm} style={styles.picker}>
                <Picker.Item label="Tháng sinh" value="" />
                {Array.from({ length: 12 }, (_, i) => (
                  <Picker.Item key={i + 1} label={`${i + 1}`} value={`${i + 1}`} />
                ))}
              </Picker>
            </View>

            <TextInput
              style={styles.inputYYYY}
              placeholder="Năm"
              placeholderTextColor="#FFFFFF"
              value={yyyy}
              onChangeText={setYyyy}
              keyboardType="numeric"
              maxLength={4}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Đăng ký'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/login')}>
            <Text style={styles.linkButtonText}>Đã có tài khoản? Đăng nhập ngay</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  toastText: {
    textAlign: 'center',
    color: '#FFFFFF',
  },
  input: {
    height: 40,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  datePicker: {
    flex: 1,
    height: 40,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
  },
  picker: {
    color: '#FFFFFF',
    height: Platform.OS === 'ios' ? 160 : 40,
    width: '100%',
  },
  inputYYYY: {
    flex: 1,
    height: 40,
    borderColor: '#888',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1e90ff',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toast: {
    padding: 10,
    marginBottom: 12,
    borderRadius: 4,
  },
  toastSuccess: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  toastError: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#87cefa',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
