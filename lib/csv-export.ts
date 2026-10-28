import { TransactionWithCategory } from "@/types/database";

export function exportTransactionsToCSV(
  transactions: TransactionWithCategory[],
  filename = "spendwise-transactions.csv"
) {
  if (!transactions || transactions.length === 0) {
    return;
  }

  const headers = [
    "Date",
    "Type",
    "Category",
    "Amount",
    "Payment Method",
    "Trip",
    "Notes",
  ];

  const escapeCSV = (val: string | number | null | undefined) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = transactions.map((t) => [
    escapeCSV(t.date),
    escapeCSV(t.type.toUpperCase()),
    escapeCSV(t.category?.name || "Uncategorized"),
    escapeCSV(t.amount),
    escapeCSV(t.payment_method),
    escapeCSV(t.trip?.name || ""),
    escapeCSV(t.notes || ""),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
