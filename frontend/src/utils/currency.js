export function formatCurrency(amount, currency) {
  if (currency === "IDR") {
    return "Rp " + amount.toLocaleString("id-ID");
  }
  if (currency === "USD") {
    return "$" + amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return String(amount);
}
