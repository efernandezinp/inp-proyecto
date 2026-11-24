import { useSyncExternalStore } from "react";
import { initialOrders, type Order } from "./orders-data";

const STORAGE_KEY = "intercap-orders-v1";
const listeners = new Set<() => void>();

function loadOrders(): Order[] {
  if (typeof window === "undefined") return initialOrders;
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}");
    return initialOrders.map(order => ({
      ...order,
      items: order.items.map(item => {
        const previous = saved?.[order.id]?.[item.sku];
        return {
          ...item,
          requestedQty: Number.isSafeInteger(previous?.requestedQty) && previous.requestedQty >= item.allocatedQty
            ? previous.requestedQty : item.requestedQty,
          pendingAction: previous?.pendingAction === "cart" || previous?.pendingAction === "cancelled"
            ? previous.pendingAction : item.pendingAction,
        };
      }),
    }));
  } catch {
    return initialOrders;
  }
}

let orders = loadOrders();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useOrders() {
  return useSyncExternalStore(subscribe, () => orders, () => initialOrders);
}

export function updateOrders(updater: (current: Order[]) => Order[]) {
  orders = updater(orders);
  try {
    const saved = Object.fromEntries(orders.map(order => [order.id, Object.fromEntries(
      order.items.map(item => [item.sku, { requestedQty: item.requestedQty, pendingAction: item.pendingAction }])
    )]));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch { /* Changes remain available for this session. */ }
  listeners.forEach(listener => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", event => {
    if (event.key !== STORAGE_KEY) return;
    orders = loadOrders();
    listeners.forEach(listener => listener());
  });
}
