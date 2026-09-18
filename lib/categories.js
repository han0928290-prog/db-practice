export const CATEGORIES = {
  expense: ["餐飲", "交通", "購物", "娛樂", "醫療", "教育", "居家", "其他"],
  income: ["薪資", "獎金", "投資", "其他"],
};

// Fixed hue order per category - never cycled, so the same category always
// reads as the same color across every project's chart.
export const EXPENSE_CATEGORY_COLORS = {
  餐飲: "var(--chart-1)",
  交通: "var(--chart-2)",
  購物: "var(--chart-3)",
  娛樂: "var(--chart-4)",
  醫療: "var(--chart-5)",
  教育: "var(--chart-6)",
  居家: "var(--chart-7)",
  其他: "var(--chart-8)",
};
