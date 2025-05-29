// api/mandalaService.js

// !!! QUAN TRỌNG: Hãy đảm bảo file '@/utils/url.js' (hoặc tên đúng) export BASE_URL chính xác !!!
import { BASE_URL } from '../untils/url'; // <<< SỬA LỖI CHÍNH TẢ 'untils' thành 'utils' (nếu cần)

// Hàm tìm kiếm thông tin Mandala theo số
export const searchMandalaInfoByNumber = async (number) => {
    // Xác thực số đầu vào
    if (number === null || number === undefined || String(number).trim() === "") {
        console.warn("[MandalaService] Tìm kiếm bị hủy: Số cung cấp không hợp lệ.");
        return null; // Trả về null hoặc một đối tượng/chuỗi thông báo cụ thể
    }

    console.log(`[MandalaService] Đang tìm kiếm thông tin Mandala (database) cho số: ${number}`);
    try {
        // Xây dựng URL điểm cuối API bằng BASE_URL đã định nghĩa
        // Sử dụng encodeURIComponent để đảm bảo an toàn cho các ký tự đặc biệt trong URL
        // <<< THAY ĐỔI QUAN TRỌNG: Cập nhật endpoint từ /mysql/search sang /mongo/mandala/search
        const searchEndpoint = `${BASE_URL}/mongo/mandala/search?number=${encodeURIComponent(String(number))}`;

        console.log(`[MandalaService] Đang gọi API: ${searchEndpoint}`);

        const response = await fetch(searchEndpoint);

        // Kiểm tra xem yêu cầu có thành công không
        if (!response.ok) {
            let errorBody = null;
            const errorContentType = response.headers.get("content-type");

            // Cố gắng phân tích phản hồi lỗi dưới dạng JSON hoặc Text
            if (errorContentType && errorContentType.includes("application/json")) {
                try { errorBody = await response.json(); } catch (e) { console.error("[MandalaService] Không thể phân tích nội dung lỗi JSON:", e); }
            } else {
                try { errorBody = await response.text(); } catch (e) { console.error("[MandalaService] Không thể phân tích nội dung lỗi Text:", e); }
            }

            console.error("[MandalaService] Trạng thái Phản hồi Lỗi API:", response.status);
            console.error("[MandalaService] Nội dung Phản hồi Lỗi API:", errorBody);

            const errorMessage = errorBody?.error || (typeof errorBody === 'string' && errorBody.trim() !== '' ? errorBody : `Không thể tìm thông tin cho số ${number}.`);
            throw new Error(`Lỗi API ${response.status}: ${errorMessage}`);
        }

        // Phân tích phản hồi JSON thành công
        const data = await response.json();
        console.log("[MandalaService] Kết quả tìm kiếm Mandala từ DB:", data);

        const descriptionField = 'information'; // Giữ nguyên nếu schema MongoDB có trường 'information'

        // Kiểm tra xem data có phải là mảng, có phần tử, và phần tử đầu tiên có trường yêu cầu không
        if (Array.isArray(data) && data.length > 0 && data[0] && data[0][descriptionField] !== undefined) {
            return data[0][descriptionField];
        } else {
            console.log(`[MandalaService] Không tìm thấy '${descriptionField}' hợp lệ trong phản hồi DB cho số:`, number);
            return `Không tìm thấy thông tin trong database cho số ${number}.`;
        }

    } catch (error) {
        console.error("[MandalaService] Lỗi khi tìm kiếm thông tin Mandala trong DB:", error);

        if (error.message && error.message.startsWith('Lỗi API')) {
            throw error;
        } else if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) { // Kiểm tra linh hoạt hơn cho "Failed to fetch"
            throw new Error("Lỗi mạng hoặc không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.");
        } else {
            throw new Error("Không thể tìm kiếm thông tin Mandala. Vui lòng thử lại sau.");
        }
    }
};