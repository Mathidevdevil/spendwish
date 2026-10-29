import {
  ArrowUpRight,
  Briefcase,
  Car,
  Film,
  HeartPulse,
  Home,
  MoreHorizontal,
  PieChart,
  Plane,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Zap,
  type LucideIcon,
} from "lucide-react";

export interface CategoryMeta {
  name: string;
  color: string;
  bgTint: string;
  icon: LucideIcon;
}

export const CATEGORY_MAP: Record<string, CategoryMeta> = {
  food: {
    name: "Food & Dining",
    color: "#F59E0B",
    bgTint: "rgba(245, 158, 11, 0.12)",
    icon: Utensils,
  },
  dining: {
    name: "Food & Dining",
    color: "#F59E0B",
    bgTint: "rgba(245, 158, 11, 0.12)",
    icon: Utensils,
  },
  shopping: {
    name: "Shopping",
    color: "#EC4899",
    bgTint: "rgba(236, 72, 153, 0.12)",
    icon: ShoppingBag,
  },
  housing: {
    name: "Housing & Rent",
    color: "#6366F1",
    bgTint: "rgba(99, 102, 241, 0.12)",
    icon: Home,
  },
  rent: {
    name: "Housing & Rent",
    color: "#6366F1",
    bgTint: "rgba(99, 102, 241, 0.12)",
    icon: Home,
  },
  transportation: {
    name: "Transportation",
    color: "#3B82F6",
    bgTint: "rgba(59, 130, 246, 0.12)",
    icon: Car,
  },
  travel: {
    name: "Travel & Trips",
    color: "#06B6D4",
    bgTint: "rgba(6, 182, 212, 0.12)",
    icon: Plane,
  },
  trip: {
    name: "Travel & Trips",
    color: "#06B6D4",
    bgTint: "rgba(6, 182, 212, 0.12)",
    icon: Plane,
  },
  entertainment: {
    name: "Entertainment",
    color: "#8B5CF6",
    bgTint: "rgba(139, 92, 246, 0.12)",
    icon: Film,
  },
  health: {
    name: "Health & Fitness",
    color: "#10B981",
    bgTint: "rgba(16, 185, 129, 0.12)",
    icon: HeartPulse,
  },
  utilities: {
    name: "Utilities & Bills",
    color: "#EAB308",
    bgTint: "rgba(234, 179, 8, 0.12)",
    icon: Zap,
  },
  salary: {
    name: "Salary & Income",
    color: "#34D399",
    bgTint: "rgba(52, 211, 153, 0.12)",
    icon: ArrowUpRight,
  },
  income: {
    name: "Income",
    color: "#34D399",
    bgTint: "rgba(52, 211, 153, 0.12)",
    icon: ArrowUpRight,
  },
  investment: {
    name: "Investments",
    color: "#14B8A6",
    bgTint: "rgba(20, 184, 166, 0.12)",
    icon: TrendingUp,
  },
  freelance: {
    name: "Freelance / Side",
    color: "#A855F7",
    bgTint: "rgba(168, 85, 247, 0.12)",
    icon: Briefcase,
  },
  other: {
    name: "Other",
    color: "#64748B",
    bgTint: "rgba(100, 116, 139, 0.12)",
    icon: MoreHorizontal,
  },
};

export function resolveCategoryMeta(
  nameOrId?: string | null,
  fallbackColor?: string | null
): CategoryMeta {
  if (!nameOrId) {
    return {
      name: "Other",
      color: fallbackColor || "#64748B",
      bgTint: `${fallbackColor || "#64748B"}20`,
      icon: MoreHorizontal,
    };
  }

  const clean = nameOrId.toLowerCase().trim();
  for (const [key, meta] of Object.entries(CATEGORY_MAP)) {
    if (clean.includes(key)) {
      return {
        ...meta,
        color: fallbackColor || meta.color,
        bgTint: fallbackColor ? `${fallbackColor}20` : meta.bgTint,
      };
    }
  }

  return {
    name: nameOrId,
    color: fallbackColor || "#64748B",
    bgTint: `${fallbackColor || "#64748B"}20`,
    icon: PieChart,
  };
}

