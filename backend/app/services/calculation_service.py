from typing import Dict, List, Any
from app.models.invoice import Invoice

def _normalize(name: str) -> str:
    return "".join(name.lower().split())

def recalculate_split_by_item(
    invoice: Invoice,
    assignments: Dict[str, List[str]],
    charge_assignments: Dict[str, str] = None,
) -> Dict[str, float]:
    """
    Recalculates the total for each person based on assigned items.
    charge_assignments: optional dict mapping "tax"/"service_charge" to the person
    who pays the full amount. Falls back to proportional for unspecified charges.
    """
    person_subtotals = {name: 0.0 for name in assignments.keys()}

    item_usage = {}
    normalized_items = {_normalize(item.name): item for item in invoice.items}

    for person, items in assignments.items():
        for item_name in items:
            norm_name = _normalize(item_name)
            if norm_name in normalized_items:
                item_usage[norm_name] = item_usage.get(norm_name, 0) + 1

    for person, items in assignments.items():
        for item_name in items:
            norm_name = _normalize(item_name)
            if norm_name in normalized_items:
                invoice_item = normalized_items[norm_name]
                share = invoice_item.subtotal / item_usage[norm_name]
                person_subtotals[person] += share

    charge_assignments = charge_assignments or {}
    results = {}
    for person, subtotal in person_subtotals.items():
        proportion = subtotal / invoice.subtotal if invoice.subtotal > 0 else 0

        if charge_assignments.get("tax") == person:
            person_tax = invoice.tax
        elif charge_assignments.get("tax") in assignments:
            person_tax = 0.0
        else:
            person_tax = invoice.tax * proportion

        if charge_assignments.get("service_charge") == person:
            person_service = invoice.service_charge
        elif charge_assignments.get("service_charge") in assignments:
            person_service = 0.0
        else:
            person_service = invoice.service_charge * proportion

        total = subtotal + person_tax + person_service
        if invoice.currency == "IDR":
            results[person] = round(total)
        else:
            results[person] = round(total, 2)

    return results

def recalculate_split_equal(invoice: Invoice, people_count: int) -> float:
    """Recalculates an equal split."""
    if people_count <= 0:
        return invoice.total
    
    share = invoice.total / people_count
    if invoice.currency == "IDR":
        return round(share)
    return round(share, 2)

def recalculate_total(invoice: Invoice) -> float:
    """Recalculates the total of an invoice."""
    total = invoice.subtotal + invoice.tax + invoice.service_charge
    if invoice.currency == "IDR":
        return round(total)
    return round(total, 2)
