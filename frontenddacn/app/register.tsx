import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
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
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success'); // Kiểu thông báo

  const isValidDate = (day: string, month: string, year: string) => {
    const d = parseInt(day, 10), m = parseInt(month, 10), y = parseInt(year, 10);
    if (isNaN(d) || isNaN(m) || isNaN(y)) return false;
    const date = new Date(`${y}-${m}-${d}`);
    return (
      date.getFullYear() === y &&
      date.getMonth() + 1 === m &&
      date.getDate() === d
    );
  };

  const handleRegister = async () => {
    setToastMessage('➡ Đang xử lý đăng ký...');

    if (!user || !pass || !fullName || !dd || !mm || !yyyy) {
      setToastMessage('❌ Vui lòng điền đầy đủ thông tin!');
      setToastType('error'); // Thông báo lỗi
      return;
    }

    if (user.length < 6 || /\s/.test(user)) {
      setToastMessage('❌ Tên người dùng phải có ít nhất 6 ký tự và không có khoảng trắng!');
      setToastType('error'); // Thông báo lỗi
      return;
    }

    const passRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
    if (!passRegex.test(pass)) {
      setToastMessage('❌ Mật khẩu phải có ít nhất 6 ký tự, gồm cả chữ và số!');
      setToastType('error'); // Thông báo lỗi
      return;
    }

    if (fullName.trim().split(' ').length < 2) {
      setToastMessage('❌ Họ tên phải có ít nhất 2 từ!');
      setToastType('error'); // Thông báo lỗi
      return;
    }

    if (!isValidDate(dd, mm, yyyy)) {
      setToastMessage('❌ Ngày sinh không hợp lệ!');
      setToastType('error'); // Thông báo lỗi
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
        setToastMessage('✅ Đăng ký thành công!');
        setToastType('success'); // Thông báo thành công
        
        // Sau khi đăng ký thành công, điều hướng về trang đăng nhập
        setTimeout(() => {
          router.replace('/login');  // Chuyển hướng đến trang login
        }, 1000);  // Đợi một chút để người dùng thấy thông báo
      } else {
        setToastMessage(result.message || '❌ Đăng ký thất bại');
        setToastType('error'); // Thông báo lỗi
      }
    } catch (error) {
      setToastMessage('❌ Không thể kết nối đến máy chủ. Vui lòng thử lại!');
      setToastType('error'); // Thông báo lỗi
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Đăng ký</Text>

      {/* Thông báo đăng ký */}
      {toastMessage ? (
        <View style={[styles.toast, toastType === 'success' ? styles.toastSuccess : styles.toastError]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Tên người dùng"
        value={user}
        onChangeText={setUser}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mật khẩu"
        value={pass}
        onChangeText={setPass}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="Họ và tên (không dấu)"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Ngày sinh (dd)"
        value={dd}
        onChangeText={setDd}
        keyboardType="numeric"
        maxLength={2}
      />
      <TextInput
        style={styles.input}
        placeholder="Tháng sinh (mm)"
        value={mm}
        onChangeText={setMm}
        keyboardType="numeric"
        maxLength={2}
      />
      <TextInput
        style={styles.input}
        placeholder="Năm sinh (yyyy)"
        value={yyyy}
        onChangeText={setYyyy}
        keyboardType="numeric"
        maxLength={4}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Đăng ký</Text>
      </TouchableOpacity>

      {/* Nút chuyển về trang đăng nhập */}
      <TouchableOpacity style={styles.linkButton} onPress={() => router.replace('/login')}>
        <Text style={styles.linkButtonText}>Đã có tài khoản? Đăng nhập ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    paddingLeft: 8,
  },
  button: {
    backgroundColor: '#007bff',
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
    textAlign: 'center',
  },
  toastSuccess: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    color: 'green',
  },
  toastError: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    color: 'red',
  },
  toastText: {
    color: 'inherit',
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
