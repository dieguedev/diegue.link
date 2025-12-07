import numeral from "numeral";

export const numberFormat = (value: number, decimals: number = 0) => {
    const format = createFormat(decimals);
    return numeral(value).format(format);
}

export const shortNumberFormat = (value: number) => {
    const format = '0.[0]a';
    return numeral(value).format(format);
}

const createFormat = (decimals: number) => {
    const decimalsFormat = createDecimalsFormat(decimals)
    return `0,0.${decimalsFormat}`
}

const createDecimalsFormat = (decimals: number) => {
    if (decimals < 0) {
        return '';
    }
    return Array(decimals + 1).join('0')
}