def detect_currency(text: str) -> str:
    if "Rp" in text or "IDR" in text:
        return "IDR"
    if "$" in text or "USD" in text:
        return "USD"
    return "IDR"
