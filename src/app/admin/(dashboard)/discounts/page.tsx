import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { toggleDiscountActive, deleteDiscount } from "@/app/actions/admin/discounts";
import { DiscountForm } from "@/components/admin/DiscountForm";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Discount Codes" };

export default async function AdminDiscountsPage() {
  const discounts = await prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink-900">Discount Codes</h1>

      <div className="mt-6 overflow-hidden rounded-3xl border border-ink-200/70 bg-cream-50">
        <table className="w-full text-sm">
          <thead className="border-b border-ink-200 bg-cream-100 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Discount</th>
              <th className="px-4 py-3">Min Spend</th>
              <th className="px-4 py-3">Uses</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {discounts.map((d) => (
              <tr key={d.id} className="hover:bg-cream-100">
                <td className="px-4 py-3 font-medium text-ink-900">{d.code}</td>
                <td className="px-4 py-3 text-ink-700">
                  {d.type === "PERCENT" ? `${d.value}%` : `$${d.value.toFixed(2)}`} off
                </td>
                <td className="px-4 py-3 text-ink-600">${d.minSubtotal.toFixed(2)}</td>
                <td className="px-4 py-3 text-ink-600">
                  {d.usageCount}
                  {d.usageLimit ? ` / ${d.usageLimit}` : ""}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={d.active ? "sage" : "ink"}>{d.active ? "Active" : "Inactive"}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <form action={async () => { "use server"; await toggleDiscountActive(d.id); }}>
                      <button type="submit" className="cursor-pointer text-sm text-terracotta-700 hover:underline">
                        {d.active ? "Deactivate" : "Activate"}
                      </button>
                    </form>
                    <ConfirmDeleteButton action={deleteDiscount} id={d.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {discounts.length === 0 ? <p className="p-8 text-center text-ink-400">No discount codes yet.</p> : null}
      </div>

      <div className="mt-8 max-w-3xl">
        <h2 className="font-display text-lg font-semibold text-ink-900">Add Discount Code</h2>
        <div className="mt-3">
          <DiscountForm />
        </div>
      </div>
    </div>
  );
}
