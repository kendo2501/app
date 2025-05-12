import { StatusBar } from 'expo-status-bar';
import React from 'react'; // Import React (không bắt buộc trong các phiên bản React mới hơn nhưng vẫn là thực hành tốt)
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    // View là component container cơ bản, tương tự như <div> trong web
    <View style={styles.container}>
      {/* Text là component để hiển thị văn bản */}
      <Text>4</Text>

      {/* StatusBar cho phép bạn tùy chỉnh thanh trạng thái của thiết bị */}
      <StatusBar style="auto" />
    </View>
  );
}

// StyleSheet.create được dùng để tạo các đối tượng kiểu dáng (style)
// Giúp tối ưu hóa và tổ chức code CSS-in-JS
const styles = StyleSheet.create({
  container: {
    flex: 1, // Chiếm toàn bộ không gian màn hình có sẵn
    backgroundColor: '#fff', // Màu nền trắng
    alignItems: 'center', // Căn chỉnh các phần tử con theo chiều ngang (ở giữa)
    justifyContent: 'center', // Căn chỉnh các phần tử con theo chiều dọc (ở giữa)
  },
});