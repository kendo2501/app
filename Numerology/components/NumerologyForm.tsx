import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { calculateNumerology, generatePyramidData } from "./ui/calculateNumerology";
import { fetchResult } from "../api/fetchResult";
import PyramidChart from "./PyramidChart";

// Định nghĩa kiểu dữ liệu cho PyramidData
interface PyramidData {
  year: number;
  number: number;
}

const NumerologyForm = () => {
  const [day, setDay] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [result, setResult] = useState<{ text: string } | null>(null);
  const [numerologyNumber, setNumerologyNumber] = useState<number | null>(null);
  const [pyramidData, setPyramidData] = useState<PyramidData[]>([]);

  // Kiểm tra dữ liệu đầu vào
  const validateInput = () => {
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);

    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
      Alert.alert("Lỗi", "Vui lòng nhập đúng định dạng ngày, tháng, năm.");
      return false;
    }

    if (dayNum < 1 || dayNum > 31) {
      Alert.alert("Lỗi", "Ngày không hợp lệ (1-31).");
      return false;
    }

    if (monthNum < 1 || monthNum > 12) {
      Alert.alert("Lỗi", "Tháng không hợp lệ (1-12).");
      return false;
    }

    if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
      Alert.alert("Lỗi", "Năm không hợp lệ.");
      return false;
    }

    return true;
  };

  // Xử lý khi người dùng nhấn "Tra cứu"
  const handleSubmit = async () => {
    if (!validateInput()) return;

    const num = calculateNumerology(parseInt(day, 10), parseInt(month, 10), parseInt(year, 10));
    setNumerologyNumber(num);

    // Lấy dữ liệu tháp số
    const pyramid = generatePyramidData(num);
    setPyramidData(pyramid);

    // Gọi API lấy kết quả
    try {
      const data = await fetchResult(num);
      setResult(data || { text: "Không có dữ liệu" });
    } catch (error) {
      console.error("Lỗi khi lấy kết quả:", error);
      setResult({ text: "Không thể lấy kết quả, vui lòng thử lại." });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thần Số Học</Text>

      <TextInput
        style={styles.input}
        placeholder="Ngày (dd)"
        value={day}
        onChangeText={setDay}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Tháng (mm)"
        value={month}
        onChangeText={setMonth}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Năm (yyyy)"
        value={year}
        onChangeText={setYear}
        keyboardType="numeric"
      />

      <Button title="Tra cứu" onPress={handleSubmit} />

      {numerologyNumber !== null && <Text style={styles.result}>Con số: {numerologyNumber}</Text>}
      {result && <Text style={styles.result}>Kết quả: {result.text}</Text>}

      {/* Gọi PyramidChart với data đúng kiểu */}
      <PyramidChart data={pyramidData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  input: { borderWidth: 1, marginVertical: 10, padding: 8, borderRadius: 5 },
  result: { fontSize: 18, marginVertical: 10 }
});

export default NumerologyForm;
