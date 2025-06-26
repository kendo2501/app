// api/mandalaService.ts

import { BASE_URL } from '../untils/url';
 
export const searchMandalaInfoByNumber = async (number: string | number): Promise<string | null> => {
    if (!number || String(number).trim() === "") {
        console.warn("[MandalaService] Tìm kiếm bị hủy: Số cung cấp không hợp lệ.");
        return null;
    }

    console.log(`[MandalaService] Đang tìm kiếm thông tin Mandala cho số: ${number}`);

    try {
        const searchEndpoint = `${BASE_URL}/mongo/mandala/search?number=${encodeURIComponent(String(number))}`;
        console.log(`[MandalaService] Gọi API: ${searchEndpoint}`);

        // ⏱️ Thiết lập timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(searchEndpoint, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) {
            let errorBody: any = null;
            const errorContentType = response.headers.get("content-type");

            if (errorContentType?.includes("application/json")) {
                try {
                    errorBody = await response.json();
                } catch (e) {
                    console.error("[MandalaService] Không thể phân tích nội dung lỗi JSON:", e);
                }
            } else {
                try {
                    errorBody = await response.text();
                } catch (e) {
                    console.error("[MandalaService] Không thể phân tích nội dung lỗi Text:", e);
                }
            }

            console.error("[MandalaService] Trạng thái lỗi API:", response.status);
            console.error("[MandalaService] Nội dung lỗi API:", errorBody);

            const errorMessage =
                errorBody?.error ||
                (typeof errorBody === 'string' && errorBody.trim() !== '' ? errorBody : `Không thể tìm thông tin cho số ${number}.`);
            throw new Error(`Lỗi API ${response.status}: ${errorMessage}`);
        }

        const data: any = await response.json();
        console.log("[MandalaService] Kết quả từ MongoDB:", data);

        const descriptionField = 'information';

        if (Array.isArray(data) && data.length > 0 && data[0] && data[0][descriptionField] !== undefined) {
            return data[0][descriptionField];
        } else {
            console.log(`[MandalaService] Không tìm thấy '${descriptionField}' trong phản hồi DB cho số ${number}`);
            return `Không tìm thấy thông tin trong database cho số ${number}.`;
        }

    } catch (error: unknown) {
        if (error instanceof Error) {
            if (error.message.startsWith('Lỗi API')) {
                throw error;
            } else if (error instanceof TypeError && error.message.toLowerCase().includes("failed to fetch")) {
                throw new Error("Lỗi mạng hoặc không thể kết nối tới máy chủ.");
            } else if (error.name === "AbortError") {
                throw new Error("Yêu cầu đã bị hủy do quá thời gian chờ (timeout).");
            } else {
                throw new Error("Không thể tìm kiếm thông tin Mandala.");
            }
        } else {
            throw new Error("Đã xảy ra lỗi không xác định.");
        }
    }
};
