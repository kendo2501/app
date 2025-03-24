export const fetchResult = async (num: number) => {
  try {
    const response = await fetch(`http://192.168.10.6:2501/api/numbers/search?n=${num}`);
    return await response.json();
  } catch (error) {
    console.error("Lỗi khi gọi API:", error);
    return null;
  }
};
  