"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.satsToBitcoin = satsToBitcoin;
exports.bitcoinToSats = bitcoinToSats;
exports.fmtSatoshiToBitcoin = fmtSatoshiToBitcoin;
exports.fmtMicroToStx = fmtMicroToStx;
exports.tsToDate = tsToDate;
exports.fmtAmount = fmtAmount;
exports.convertDatToBH = convertDatToBH;
exports.fmtNumber = fmtNumber;
exports.truncate = truncate;
exports.truncateId = truncateId;
const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    // These options are needed to round to whole numbers if that's what you want.
    // minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    // maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
});
const btcPrecision = 100000000;
const stxPrecision = 1000000;
function satsToBitcoin(amountSats) {
    return Math.round(amountSats) / btcPrecision;
}
function bitcoinToSats(amountBtc) {
    return Math.round(amountBtc * btcPrecision);
    //  return btc.Decimal.decode(amountBtc)
}
function fmtSatoshiToBitcoin(amountSats) {
    return (Math.round(amountSats) / btcPrecision).toFixed(8);
}
function fmtMicroToStx(amountStx) {
    return (Math.round(amountStx) / stxPrecision).toFixed(6);
}
function tsToDate(updated) {
    let d = new Date();
    if (updated)
        d = new Date(updated);
    return d.toLocaleDateString("en-US", { hour: "2-digit", minute: "2-digit" });
    //return d.getHours() + ':' + d.getMinutes() + ' ' + d.getDate() + "/" + d.getMonth() + 1 + "/" + d.getFullYear();
}
function fmtAmount(amount, currency) {
    if (currency === "stx") {
        return formatter.format(amount).replace("$", ""); // &#931;
    }
    else if (currency === "usd") {
        return formatter.format(amount).replace("$", ""); // &#931;
    }
    else {
        return "" + amount;
    }
}
function convertDatToBH(date, currentBH) {
    const now = new Date().getTime();
    const minsInFuture = (date - now) / 60000;
    if (minsInFuture <= 0)
        return 0;
    return Math.floor(currentBH + minsInFuture / 10);
}
function fmtNumber(amount) {
    if (amount === 0)
        return 0;
    if (amount)
        return new Intl.NumberFormat().format(amount);
}
function truncate(stringy, amount) {
    if (!stringy)
        return "?";
    if (!amount)
        amount = 4;
    return (stringy.substring(0, amount) +
        "..." +
        stringy.substring(stringy.length - amount));
}
function truncateId(stringy, amount) {
    if (!stringy)
        return "?";
    if (!amount)
        amount = 4;
    return "#" + stringy.substring(stringy.length - amount);
}
