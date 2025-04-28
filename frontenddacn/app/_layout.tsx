import React from 'react';
import { Stack } from 'expo-router';
import { UserDataProvider } from '../context/userDataContext'; // Đảm bảo đường dẫn này chính xác


export default function RootLayout() {
  return (
    // Bao bọc toàn bộ ứng dụng bằng Provider để chia sẻ dữ liệu
    <UserDataProvider>
      {/* Sử dụng Stack Navigator làm cấu trúc điều hướng chính */}
      <Stack
        screenOptions={{
          headerShown: false // Ẩn header mặc định cho các màn hình cấp cao nhất (index, grid)
        }}
      >
        {/* Khai báo các màn hình được quản lý bởi Stack này */}
        {/* Tên (name) phải khớp với tên file hoặc thư mục trong app/ */}

        {/* Màn hình Form (ví dụ: app/index.tsx) */}
        <Stack.Screen name="index" />

        {/* Màn hình Grid (ví dụ: app/grid.tsx) */}
        <Stack.Screen name="grid" />

        {/* Màn hình chi tiết Số Chủ Đạo (ví dụ: app/main-number.tsx) */}
        <Stack.Screen
          name="main-number"
          options={{
            title: 'Số Chủ Đạo', // Tiêu đề hiển thị trên header
            headerShown: true,    // Hiển thị header cho màn hình này
            // Thêm các tùy chọn header khác nếu cần (màu sắc, nút back...)
            // headerBackTitleVisible: false,
          }}
        />

        {/* Màn hình chi tiết Biểu Đồ Ngày Sinh (ví dụ: app/birth-chart.tsx) */}
        <Stack.Screen
          name="birth-chart"
          options={{
            title: 'Biểu Đồ Ngày Sinh',
            headerShown: true,
            // headerBackTitleVisible: false,
          }}
        />

        {/* --- BẠN CẦN THÊM CÁC Stack.Screen CHO CÁC MÀN HÌNH CHI TIẾT KHÁC Ở ĐÂY --- */}
        {/*
        <Stack.Screen name="name-chart" options={{ title: 'Biểu Đồ Tên', headerShown: true }} />
        <Stack.Screen name="summary-chart" options={{ title: 'Biểu Đồ Tổng Hợp', headerShown: true }} />
        ... vân vân ...
        */}
       


      </Stack>
    </UserDataProvider>
  );
}