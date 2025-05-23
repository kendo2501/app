// api/mandalaService.js

// Define the API Base URL directly in this file
// !!! QUAN TRỌNG: Hãy thay thế 'http://your-specific-ip:your-port' bằng IP và Port API thực tế của bạn !!!
import { BASE_URL } from '@/untils/url';

// Lưu ý: Dòng sau đây có vấn đề và đã được xóa:
// const response = await fetch(`${BASE_URL}`) // Your specific IP and Port
// `await` không thể được sử dụng ở cấp cao nhất của một module theo cách này
// và BASE_URL chưa được định nghĩa. Giả định API_BASE_URL là những gì cần thiết.

// Hàm tìm kiếm thông tin Mandala theo số
export const searchMandalaInfoByNumber = async (number) => {
    // Xác thực số đầu vào
    if (number === null || number === undefined || String(number).trim() === "") {
        console.warn("[MandalaService] Tìm kiếm bị hủy: Số cung cấp không hợp lệ.");
        return null; // Trả về null hoặc một đối tượng/chuỗi thông báo cụ thể
    }

    console.log(`[MandalaService] Đang tìm kiếm thông tin Mandala (database) cho số: ${number}`);
    try {
        // Xây dựng URL điểm cuối API bằng API_BASE_URL đã định nghĩa
        // Sử dụng encodeURIComponent để đảm bảo an toàn cho các ký tự đặc biệt trong URL
        const searchEndpoint = `${BASE_URL}/mysql/search?number=${encodeURIComponent(number)}`;

        console.log(`[MandalaService] Đang gọi API: ${searchEndpoint}`);

        const response = await fetch(searchEndpoint);

        // Kiểm tra xem yêu cầu có thành công không
        if (!response.ok) {
            let errorBody = null;
            const errorContentType = response.headers.get("content-type");

            // Cố gắng phân tích phản hồi lỗi dưới dạng JSON hoặc Text
            if (errorContentType && errorContentType.indexOf("application/json") !== -1) {
                try { errorBody = await response.json(); } catch (e) { console.error("[MandalaService] Không thể phân tích nội dung lỗi JSON:", e); /* bỏ qua lỗi phân tích */ }
            } else {
                try { errorBody = await response.text(); } catch (e) { console.error("[MandalaService] Không thể phân tích nội dung lỗi Text:", e); /* bỏ qua lỗi phân tích text */ }
            }

            console.error("[MandalaService] Trạng thái Phản hồi Lỗi API:", response.status);
            console.error("[MandalaService] Nội dung Phản hồi Lỗi API:", errorBody);

            // Ném ra một lỗi chi tiết bao gồm trạng thái và nội dung nếu có
            const errorMessage = errorBody?.error || (typeof errorBody === 'string' && errorBody.trim() !== '' ? errorBody : `Không thể tìm thông tin cho số ${number}.`);
            throw new Error(`Lỗi API ${response.status}: ${errorMessage}`);
        }

        // Phân tích phản hồi JSON thành công
        // Mong đợi mảng dạng: [{ id, number, information, ... }]
        const data = await response.json();
        console.log("[MandalaService] Kết quả tìm kiếm Mandala từ DB:", data);

        // --- QUAN TRỌNG: Kiểm tra và điều chỉnh tên trường nếu cần ---
        // Giả sử trường chứa mô tả có tên là 'information'
        const descriptionField = 'information'; // <--- THAY ĐỔI 'information' nếu tên trường của bạn khác

        // Kiểm tra xem data có phải là mảng, có phần tử, và phần tử đầu tiên có trường yêu cầu không
        if (Array.isArray(data) && data.length > 0 && data[0] && data[0][descriptionField] !== undefined) {
            // Trả về nội dung mô tả
            return data[0][descriptionField];
        } else {
            // Xử lý trường hợp dữ liệu trống, không phải là mảng, hoặc trường không tồn tại
            console.log(`[MandalaService] Không tìm thấy '${descriptionField}' hợp lệ trong phản hồi DB cho số:`, number);
            // Trả về một thông báo thân thiện với người dùng cho biết dữ liệu không được tìm thấy
            return `Không tìm thấy thông tin trong database cho số ${number}.`;
        }

    } catch (error) {
        // Ghi lại lỗi cụ thể gặp phải trong quá trình fetch hoặc xử lý
        console.error("[MandalaService] Lỗi khi tìm kiếm thông tin Mandala trong DB:", error);

        // Ném lại hoặc gói lỗi để thành phần gọi xử lý
        // Cung cấp một thông báo thân thiện với người dùng, giữ lại chi tiết lỗi API nếu có
        if (error.message && error.message.startsWith('Lỗi API')) {
            throw error; // Ném lại lỗi API đã được định dạng
        } else if (error instanceof TypeError && error.message === "Failed to fetch") { // Lỗi mạng
             throw new Error("Lỗi mạng hoặc không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.");
        } else {
            // Đối với các lỗi khác, cung cấp một thông báo chung hơn
            throw new Error("Không thể tìm kiếm thông tin Mandala. Vui lòng thử lại sau.");
        }
    }
};

