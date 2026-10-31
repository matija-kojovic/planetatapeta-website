import OrdersTable from "@/components/admin/OrdersTable";
import { ORDER_STATUSES, getOrders } from "@/lib/db";

export const metadata = { title: "Porudžbine" };

export default function AdminOrdersPage() {
  return (
    <div className="max-w-6xl">
      <h1 className="t-page">Porudžbine</h1>
      <OrdersTable initialOrders={getOrders()} statuses={ORDER_STATUSES} />
    </div>
  );
}
