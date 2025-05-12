// api/mandalaService.js

// Define the Base URL directly in this file
const API_BASE_URL = 'http://192.168.10.7:3001'; // Your specific IP and Port

// Function to search Mandala info (information) by number
export const searchMandalaInfoByNumber = async (number) => {
    // Validate input number
    if (number === null || number === undefined) {
        console.warn("[MandalaService] Search cancelled: Invalid number provided.");
        return null; // Return null or a specific message object/string
    }

    console.log(`[MandalaService] Searching Mandala info (database) for number: ${number}`);
    try {
        // --- Corrected Line: Use API_BASE_URL ---
        // Construct the API endpoint URL using the defined API_BASE_URL
        const searchEndpoint = `${API_BASE_URL}/mysql/search?number=${number}`;
        // -----------------------------------------

        console.log(`[MandalaService] Calling API: ${searchEndpoint}`);

        const response = await fetch(searchEndpoint);

        // Check if the request was successful
        if (!response.ok) {
            let errorBody = null;
            const errorContentType = response.headers.get("content-type");
            // Try to parse error response as JSON or Text
            if (errorContentType && errorContentType.indexOf("application/json") !== -1) {
                 try { errorBody = await response.json(); } catch (e) { console.error("Failed to parse JSON error body:", e)/* ignore parsing error */ }
            } else {
                try { errorBody = await response.text(); } catch(e) { console.error("Failed to parse Text error body:", e) /* ignore text error */}
            }
            console.error("[MandalaService] API Error Response Status:", response.status);
            console.error("[MandalaService] API Error Response Body:", errorBody);
            // Throw a detailed error including status and body if available
            throw new Error(`Lỗi API ${response.status}: ${errorBody?.error || (typeof errorBody === 'string' ? errorBody : 'Không thể tìm thông tin.')}`);
        }

        // Parse the successful JSON response
        const data = await response.json(); // Expecting array like: [{ id, number, information, ... }]
        console.log("[MandalaService] Mandala search result from DB:", data);

        // --- IMPORTANT: Check and adjust the field name if necessary ---
        // Assuming the field containing the description is named 'information'
        const descriptionField = 'information'; // <--- CHANGE 'information' if your field name is different

        // Check if data is an array, has items, and the first item has the required field
        if (Array.isArray(data) && data.length > 0 && data[0] && data[0][descriptionField] !== undefined) {
            // Return the description text
            return data[0][descriptionField];
        } else {
            // Handle cases where data is empty, not an array, or the field doesn't exist
            console.log(`[MandalaService] No valid '${descriptionField}' found in DB response for number:`, number);
            // Return a user-friendly message indicating data wasn't found
            return `Không tìm thấy thông tin trong database cho số ${number}.`;
        }

    } catch (error) {
        // Log the specific error encountered during the fetch or processing
        console.error("[MandalaService] Error searching Mandala info in DB:", error);
        // Rethrow or wrap the error for the calling component to handle
        // Provide a user-friendly message, preserving API error details if available
        throw new Error(error.message.startsWith('Lỗi API') ? error.message : "Không thể tìm kiếm thông tin Mandala. Vui lòng thử lại.");
    }
};

// Add other mandala-related API functions here if needed