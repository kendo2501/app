// mandalaCalculations.ts
export const sumDigits = (num: number): number => {
    if (num < 0) return 0;
    return String(num)
        .split('')
        .reduce((s, digit) => {
            const digitNum = parseInt(digit, 10);
            return s + (isNaN(digitNum) ? 0 : digitNum);
        }, 0);
};

export const calculateH1InitialValue = (day: number): number | null => {
    if (!day || day < 1 || day > 31) return null;
    return day <= 22 ? day : sumDigits(day);
};

export const calculateH2InitialValue = (month: number): number | null => {
    if (!month || month < 1 || month > 12) return null;
    return month;
};

export const calculateH3InitialValue = (year: number): number | null => {
    if (!year || year < 1) return null;
    return sumDigits(year);
};

export const getFinalH1Value = (day: number): number | null => {
    let result = calculateH1InitialValue(day);
    while (result && result > 22) result = sumDigits(result);
    return result;
};

export const getFinalH2Value = (month: number): number | null => {
    return calculateH2InitialValue(month);
};

export const getFinalH3Value = (year: number): number | null => {
    let result = calculateH3InitialValue(year);
    while (result && result > 22) result = sumDigits(result);
    return result;
};

export const getFinalH4Value = (dd: number, mm: number, yyyy: number): number | null => {
    if (!dd || !mm || !yyyy) return null;
    let sum = dd + mm + yyyy;
    while (sum > 22) sum = sumDigits(sum);
    return sum;
};

export const getFinalH5Value = (dd: number, mm: number, yyyy: number): number | null => {
    const h1 = calculateH1InitialValue(dd);
    const h2 = calculateH2InitialValue(mm);
    const h3 = calculateH3InitialValue(yyyy);
    const h4 = getFinalH4Value(dd, mm, yyyy);
    if (h1 === null || h2 === null || h3 === null || h4 === null) return null;
    let sum = h1 + h2 + h3 + h4;
    while (sum > 22) sum = sumDigits(sum);
    return sum;
};

export const getFinalH6Value = (dd: number, mm: number): number | null => {
    const h1 = calculateH1InitialValue(dd);
    const h2 = calculateH2InitialValue(mm);
    if (h1 === null || h2 === null) return null;
    let sum = h1 + h2;
    while (sum > 22) sum = sumDigits(sum);
    return sum;
};

export const getFinalH7Value = (mm: number, yyyy: number): number | null => {
    const h2 = calculateH2InitialValue(mm);
    const h3 = calculateH3InitialValue(yyyy);
    if (h2 === null || h3 === null) return null;
    let diff = Math.abs(h2 - h3);
    while (diff > 22) diff = sumDigits(diff);
    return diff;
};

export const getFinalH8Value = (dd: number, yyyy: number): number | null => {
    const h1 = calculateH1InitialValue(dd);
    const h3 = calculateH3InitialValue(yyyy);
    if (h1 === null || h3 === null) return null;
    let sum = h1 + h3;
    while (sum > 22) sum = sumDigits(sum);
    return sum;
};

export const getFinalH9Value = (dd: number, mm: number, yyyy: number): number | null => {
    const h6 = getFinalH6Value(dd, mm);
    const h7 = getFinalH7Value(mm, yyyy);
    if (h6 === null || h7 === null) return null;
    let sum = h6 + h7;
    while (sum > 22) sum = sumDigits(sum);
    return sum;
};

export const getFinalH10Value = (dd: number, mm: number, yyyy: number): number | null => {
    const h9 = getFinalH9Value(dd, mm, yyyy);
    if (h9 === null) return null;
    return 22 - h9;
};

export const getFinalH11Value = (dd: number, mm: number, yyyy: number): number | null => {
    const h3 = calculateH3InitialValue(yyyy);
    const h7 = getFinalH7Value(mm, yyyy);
    const h10 = getFinalH10Value(dd, mm, yyyy);
    if (h3 === null || h7 === null || h10 === null) return null;
    let sum = h3 + h7 + h10;
    while (sum > 22) sum = sumDigits(sum);
    return sum;
};

export const getFinalH12Value = (dd: number, mm: number, yyyy: number): number | null => {
    const h2 = calculateH2InitialValue(mm);
    const h4 = getFinalH4Value(dd, mm, yyyy);
    const h6 = getFinalH6Value(dd, mm);
    if (h2 === null || h4 === null || h6 === null) return null;
    let sum = h2 + h4 + h6;
    while (sum > 22) sum = sumDigits(sum);
    return sum;
};

export const getFinalH13Value = (dd: number, mm: number, yyyy: number): number | null => {
    const h1 = getFinalH1Value(dd);
    const h2 = getFinalH2Value(mm);
    const h3 = getFinalH3Value(yyyy);
    const h4 = getFinalH4Value(dd, mm, yyyy);
    const h5 = getFinalH5Value(dd, mm, yyyy);
    const h9 = getFinalH9Value(dd, mm, yyyy);
    const h11 = getFinalH11Value(dd, mm, yyyy);
    const h12 = getFinalH12Value(dd, mm, yyyy);

    if ([h1, h2, h3, h4, h5, h9, h11, h12].some(v => v === null)) return null;

    let sum = h1! + h2! + h3! + h4! + h5! + h9! + h11! + h12! + h5!;
    while (sum > 22) sum = sumDigits(sum);
    return sum;
};
