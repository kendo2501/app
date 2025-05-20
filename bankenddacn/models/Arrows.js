// models/Arrows.js (ĐÃ SỬA ĐỔI)
const mongoose = require('mongoose');

// Định nghĩa schema cơ bản cho các trường chung (nếu có)
const baseArrowFields = {
    arrow: { type: String, required: true }
    // Thêm các trường chung khác nếu có
};

// 1. Schema và Model cho collection 'advantageArrow'
const AdvantageArrowSchema = new mongoose.Schema({
    ...baseArrowFields,
    advantage: { type: String, required: true }
}, { collection: 'advantageArrow' }); // Chỉ định đúng tên collection
const AdvantageArrow = mongoose.model('AdvantageArrow', AdvantageArrowSchema);

// 2. Schema và Model cho collection 'defectArrow'
const DefectArrowSchema = new mongoose.Schema({
    ...baseArrowFields,
    defect: { type: String, required: true }
}, { collection: 'defectArrow' }); // Chỉ định đúng tên collection
const DefectArrow = mongoose.model('DefectArrow', DefectArrowSchema);

// 3. Schema và Model cho collection 'Arrows' (nếu bạn có collection này riêng
//    hoặc muốn dùng nó để lưu dữ liệu đã kết hợp, hoặc như model gốc của bạn)
const CombinedArrowsSchema = new mongoose.Schema({
    ...baseArrowFields,
    advantage: { type: String }, // Có thể có hoặc không
    defect: { type: String }     // Có thể có hoặc không
}, { collection: 'Arrows' }); // Model này sẽ trỏ đến collection 'Arrows'
const CombinedArrow = mongoose.model('Arrows', CombinedArrowsSchema); // Giữ tên model gốc là 'Arrows'

// Export các model bạn cần sử dụng
module.exports = {
    AdvantageArrow,
    DefectArrow,
    Arrow: CombinedArrow // Export model cho collection 'Arrows' dưới tên 'Arrow' (hoặc 'CombinedArrow' tùy bạn)
};