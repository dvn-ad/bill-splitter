import { formatCurrency } from "../utils/currency.js";
import { Users, User, Receipt, CreditCard } from "lucide-react";

export default function SplitBreakdown({ splitData, currency }) {
  if (!splitData || !splitData.operation || !splitData.result) return null;

  const { operation, variables = {}, result } = splitData;
  const fmt = (n) => formatCurrency(n, currency);

  // Helper to generate a nice gradient avatar based on the first letter of a name
  const getAvatarColor = (name) => {
    const code = name.charCodeAt(0) % 5;
    const gradients = [
      "from-pink-500 to-rose-500",
      "from-purple-500 to-indigo-500",
      "from-blue-500 to-cyan-500",
      "from-teal-500 to-emerald-500",
      "from-amber-500 to-orange-500",
    ];
    return gradients[code];
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-500" />
          Split Breakdown
        </h3>
        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase tracking-wide rounded-md border border-indigo-100/50 dark:border-indigo-900/30">
          {operation === "split_by_item" ? "By Item" : "Equally"}
        </span>
      </div>

      {operation === "split_by_item" && typeof result === "object" && !Array.isArray(result) && (
        <div className="space-y-3">
          {Object.entries(result).map(([person, amount]) => {
            const items = variables.item_assignments?.[person] || [];
            return (
              <div
                key={person}
                className="bg-white dark:bg-gray-800/40 rounded-2xl p-4 border border-gray-100 dark:border-gray-800/80 shadow-sm flex items-start gap-3 hover:border-indigo-200 dark:hover:border-indigo-900/50 transition-all duration-300 group"
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(person)} flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 uppercase`}>
                  {person.charAt(0)}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="font-bold text-gray-900 dark:text-white truncate uppercase text-sm tracking-tight">
                      {person}
                    </span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm shrink-0 font-mono">
                      {fmt(amount)}
                    </span>
                  </div>

                  {/* Items assigned */}
                  {items.length > 0 ? (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {items.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-gray-50 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 text-[10px] font-medium rounded-md border border-gray-100 dark:border-gray-700/60 truncate max-w-[120px]"
                          title={item}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 italic">
                      No items assigned (only tax/service charges)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {operation === "split_equal" && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-2xl p-5 border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Split equally among {variables.people || 2} people
              </div>
              <div className="text-lg font-black text-gray-950 dark:text-white mt-0.5">
                {fmt(result)} <span className="text-xs font-medium text-gray-500 dark:text-gray-400">each</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
