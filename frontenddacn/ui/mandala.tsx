import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    // Image, // No longer needed
} from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons'

// --- IMPORT CÁC COMPONENT CHI TIẾT MANDALA ---
import H1 from '../ui/C_F_ofMandala/H1';
import H2 from '../ui/C_F_ofMandala/H2';
import H3 from '../ui/C_F_ofMandala/H3';
import H4 from '../ui/C_F_ofMandala/H4';
import H5 from '../ui/C_F_ofMandala/H5';
import H6 from '../ui/C_F_ofMandala/H6';
import H7 from '../ui/C_F_ofMandala/H7';
import H8 from '../ui/C_F_ofMandala/H8';
import H9 from '../ui/C_F_ofMandala/H9';
import H10 from '../ui/C_F_ofMandala/H10';
import H11 from '../ui/C_F_ofMandala/H11';
import H12 from '../ui/C_F_ofMandala/H12';
import H13 from '../ui/C_F_ofMandala/H13';

interface MandalaScreenProps {
    goBack: () => void;
}

const MandalaScreen: React.FC<MandalaScreenProps> = ({ goBack }) => {
    const [selectedMandalaId, setSelectedMandalaId] = useState<string | null>(null);

    const handleButtonPress = (mandalaId: string) => {
        setSelectedMandalaId(mandalaId);
    };

    const handleBackToGridPress = () => {
        setSelectedMandalaId(null);
    };

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

    const renderGridView = () => (
        <View style={styles.gridContainer}>
            {/* Grid rows - giữ nguyên */}
            <View style={styles.row}>
                {renderPlaceholder()}
                {renderButton('H12', styles.buttonYellow)}
                {renderPlaceholder()}
            </View>
            <View style={styles.row}>
                {renderButton('H6', styles.buttonYellow)}
                {renderButton('H1', styles.buttonGreen)}
                {renderButton('H8', styles.buttonYellow)}
            </View>
            <View style={styles.rowWide}>
                {renderButton('H9', styles.buttonYellow)}
                {renderButton('H2', styles.buttonGreen)}
                {renderButton('H5', styles.buttonBlue)}
                {renderButton('H4', styles.buttonGreen)}
                {renderButton('H13', styles.buttonYellow)}
            </View>
            <View style={styles.row}>
                {renderButton('H7', styles.buttonYellow)}
                {renderButton('H3', styles.buttonGreen)}
                {renderButton('H10', styles.buttonYellow)}
            </View>
            <View style={styles.row}>
                {renderPlaceholder()}
                {renderButton('H11', styles.buttonYellow)}
                {renderPlaceholder()}
            </View>
        </View>
    );

    const renderDetailContent = () => {
        if (!selectedMandalaId) return null;
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
            case 'H9': DetailComponent = H9; break;
            case 'H10': DetailComponent = H10; break;
            case 'H11': DetailComponent = H11; break;
            case 'H12': DetailComponent = H12; break;
            case 'H13': DetailComponent = H13; break;
            default:
                DetailComponent = () => (
                    <Text style={styles.errorText}>
                        Không thể tải nội dung cho {selectedMandalaId}. Vui lòng kiểm tra lại.
                    </Text>
                );
        }
        return DetailComponent ? <DetailComponent onBack={handleBackToGridPress} /> : null;
    };

    return (
        <ImageBackground
            source={require('../assets/images/background.jpg')} // Đảm bảo đường dẫn ảnh đúng
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <SafeAreaView style={styles.safeArea}>



                <View style={styles.container}>
                    {selectedMandalaId === null ? renderGridView() : renderDetailContent()}
                </View>
            </SafeAreaView>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    // homeIconImage style không còn cần thiết nếu dùng Icon component
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gridContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        width: '70%',
    },
    rowWide: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        width: '100%',
    },
    buttonBase: {
        width: 65,
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
        width: 65,
        height: 50,
        marginHorizontal: 5,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default MandalaScreen;