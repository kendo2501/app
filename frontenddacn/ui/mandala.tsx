import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
} from 'react-native';

// --- !! QUAN TRỌNG: Import các component từ file tương ứng !! ---
// --- !! Bạn cần tạo các file này và export component từ chúng !! ---
// --- !! Uncomment và sửa đường dẫn/tên file nếu cần !! ---

import H1 from '../ui/C_F_ofMandala/H1';
import H2 from '../ui/C_F_ofMandala/H2';
import H3 from '../ui/C_F_ofMandala/H3';
import H4 from '../ui/C_F_ofMandala/H4';
import H5 from '../ui/C_F_ofMandala/H5';
import H6 from '../ui/C_F_ofMandala/H6';
import H7 from '../ui/C_F_ofMandala/H7';
import H8 from '../ui/C_F_ofMandala/H8';
// import H9 from '../../mandala/H9';
// import H10 from '../../mandala/H10';
// import H11 from '../../mandala/H11';
// import H12 from '../../mandala/H12';
// import H13 from '../../mandala/H13';

// --- Component Chính ---
const MandalaScreen: React.FC = () => {
    const [selectedMandalaId, setSelectedMandalaId] = useState<string | null>(null);

    const handleButtonPress = (mandalaId: string) => {
        console.log(`Attempting to show content for: ${mandalaId}`);
        setSelectedMandalaId(mandalaId);
    };

    const handleBackPress = () => {
        setSelectedMandalaId(null);
    };

    // --- Render nút bấm ---
    const renderButton = (id: string, specificStyle: object) => (
        <TouchableOpacity
            style={[styles.buttonBase, specificStyle]}
            onPress={() => handleButtonPress(id)}
            activeOpacity={0.7}
        >
            <Text style={styles.buttonText}>{id}</Text>
        </TouchableOpacity>
    );
    const renderPlaceholder = () => <View style={styles.placeholder} />;

    // --- Render lưới nút bấm ---
    const renderGridView = () => (
      <View style={styles.gridContainer}>
        {/* Hàng 1 */}
          <View style={styles.row}>
            {renderPlaceholder()}
            {renderButton('H12', styles.buttonYellow)}
            {renderPlaceholder()}
          </View>
          {/* Hàng 2 */}
          <View style={styles.row}>
            {renderButton('H6', styles.buttonYellow)}
            {renderButton('H1', styles.buttonGreen)}
            {renderButton('H8', styles.buttonYellow)}
          </View>
          {/* Hàng 3 (Hàng giữa) */}
          <View style={styles.rowWide}>
             {renderButton('H9', styles.buttonYellow)}
             {renderButton('H2', styles.buttonGreen)}
             {renderButton('H5', styles.buttonBlue)}
             {renderButton('H4', styles.buttonGreen)}
             {renderButton('H13', styles.buttonYellow)}
          </View>
          {/* Hàng 4 */}
          <View style={styles.row}>
            {renderButton('H7', styles.buttonYellow)}
            {renderButton('H3', styles.buttonGreen)}
            {renderButton('H10', styles.buttonYellow)}
          </View>
          {/* Hàng 5 */}
          <View style={styles.row}>
            {renderPlaceholder()}
            {renderButton('H11', styles.buttonYellow)}
            {renderPlaceholder()}
          </View>
      </View>
    );


    // --- Hàm render nội dung chi tiết TỪ FILE COMPONENT ---
    const renderDetailContent = () => {
        if (!selectedMandalaId) {
            return null;
        }

        let DetailComponent: React.ComponentType<any> | null = null;

        switch (selectedMandalaId) {
            case 'H1': DetailComponent = H1; break;
            case 'H2': DetailComponent = H2; break;
            case 'H3': DetailComponent = H3; break;
            case 'H4': DetailComponent = H4; break;
            case 'H5': DetailComponent = H5; break;
            case 'H6': DetailComponent = H6; break;
            case 'H7': DetailComponent = H7; break;
            case 'H8': DetailComponent = H8; break;
            // case 'H9': DetailComponent = H9; break;
            // case 'H10': DetailComponent = H10; break;
            // case 'H11': DetailComponent = H11; break;
            // case 'H12': DetailComponent = H12; break;
            // case 'H13': DetailComponent = H13; break;
            default:
                console.error(`Component for ${selectedMandalaId} not found or not imported.`);
                DetailComponent = () => (
                    <Text style={styles.errorText}>
                        Không thể tải nội dung cho {selectedMandalaId}. Vui lòng kiểm tra lại.
                    </Text>
                );
        }

        return (
            <View style={styles.detailContainer}>
                <ScrollView style={styles.detailScrollView}>
                    <Text style={styles.detailTitle}>Chi tiết cho {selectedMandalaId}</Text>
                    {DetailComponent ? <DetailComponent /> : null}
                </ScrollView>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Quay lại</Text>
                </TouchableOpacity>
            </View>
        );
    };


    // --- Phần return chính ---
    return (
        <ImageBackground
            source={require('../assets/images/background.jpg')} // !!! Nhớ thay đổi đường dẫn này
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.container}>
                    {/* --- Conditional Rendering --- */}
                    {selectedMandalaId === null ? renderGridView() : renderDetailContent()}
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    background: {
        flex: 1, // Đảm bảo ImageBackground chiếm toàn bộ không gian
    },
    safeArea: {
        flex: 1, // Đảm bảo SafeAreaView chiếm toàn bộ không gian trong ImageBackground
    },
    container: {
        flex: 1, // Đảm bảo container chính chiếm toàn bộ không gian trong SafeAreaView
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        width: '100%', // Chiếm toàn bộ chiều rộng của container
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10, // Giữ padding để không sát viền
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center', // Căn giữa các nút trong hàng
        alignItems: 'center',
        marginBottom: 10,
        width: '70%', // Chiều rộng tương đối cho các hàng ít nút hơn
    },
    rowWide: {
        flexDirection: 'row',
        justifyContent: 'center', // Căn giữa các nút trong hàng
        alignItems: 'center',
        marginBottom: 10,
        width: '100%', // Chiều rộng tối đa cho hàng nhiều nút
    },
    buttonBase: {
        width: 65, // Kích thước nút có thể cần điều chỉnh responsive hơn
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#000000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    buttonYellow: { backgroundColor: '#FDE047' },
    buttonGreen: { backgroundColor: '#4ADE80' },
    buttonBlue: { backgroundColor: '#60A5FA' },
    placeholder: {
        width: 65, // Kích thước tương đương nút
        height: 50,
        marginHorizontal: 5,
    },

    // --- Styles cho phần chi tiết ---
    detailContainer: {
        flex: 0.9, // Chiếm 90% chiều cao của container cha (thay vì marginVertical cố định)
        width: '90%', // Giới hạn chiều rộng một chút
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 10,
        // marginVertical: 30, // Loại bỏ margin dọc cố định, thay bằng flex ở trên
        padding: 15,
    },
    detailScrollView: {
        width: '100%',
        marginBottom: 15,
    },
    detailTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 15,
        textAlign: 'center',
    },
    backButton: {
        backgroundColor: '#DDDDDD',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    backButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    }
});

export default MandalaScreen;