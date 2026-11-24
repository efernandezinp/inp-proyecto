import { useSyncExternalStore } from "react";
import { updateOrders } from "./orders-store";

export type CartProduct = { code: string; title: string; brand: string; image: string; price: number };
export type PendingOrigin = { orderId: string; sku: string; quantity: number; pendingUnitsDeducted?: boolean };
export type CartItem = CartProduct & { quantity: number; pendingOrigins?: PendingOrigin[] };
export type CheckoutMode = "b2b" | "dropship";
export type CheckoutStatus = "draft" | "b2b-confirmed" | "awaiting-payment" | "paid";
export type Recipient = {
  name: string; document: string; phone: string; email: string;
  street: string; number: string; apartment: string; city: string; province: string; postalCode: string;
};
export type CheckoutData = {
  mode: CheckoutMode;
  recipient: Recipient;
  markupPercent: number;
  shippingCost: number;
  status: CheckoutStatus;
};
export type SavedCart = {
  id: string;
  number: number;
  name: string;
  notes: string;
  address: string;
  createdAt: string;
  items: CartItem[];
  checkout: CheckoutData;
};
type CartState = { carts: SavedCart[]; activeId: string | null };

const STORAGE_KEY = "intercap-carts-v2";
const OLD_STORAGE_KEY = "intercap-cart-v1";
export const WHOLESALE_ADDRESSES = [
  "(1000) A Definir - CIUDAD AUTONOMA DE BUENOS AIRES - C.A.B.A.",
  "(3560) Dirección 2 Test - RECONQUISTA - Santa Fe",
  "RETIRAR EN DEPOSITO INTERCAP",
] as const;
const DEFAULT_ADDRESS = WHOLESALE_ADDRESSES[0];
const listeners = new Set<() => void>();
const EMPTY_ITEMS: CartItem[] = [];
const SERVER_STATE: CartState = { carts: [], activeId: null };
const EMPTY_RECIPIENT: Recipient = {
  name: "", document: "", phone: "", email: "", street: "", number: "",
  apartment: "", city: "", province: "", postalCode: "",
};
function defaultCheckout(): CheckoutData {
  return { mode: "b2b", recipient: { ...EMPTY_RECIPIENT }, markupPercent: 0,
    shippingCost: 0, status: "draft" };
}
function validCheckout(value: any, items: CartItem[]): CheckoutData {
  const fallback = defaultCheckout();
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = typeof value?.shippingCost === "number" && Number.isFinite(value.shippingCost) && value.shippingCost > 0 ? value.shippingCost : 13000;
  const legacyMarkup = typeof value?.salePrice === "number" && Number.isFinite(value.salePrice) && subtotal + shippingCost > 0
    ? Math.max(0, (value.salePrice - subtotal) / (subtotal + shippingCost) * 100) : 0;
  const recipient = Object.fromEntries(Object.keys(EMPTY_RECIPIENT).map((key) =>
    [key, typeof value?.recipient?.[key] === "string" ? value.recipient[key] : ""])) as Recipient;
  return {
    mode: value?.mode === "dropship" ? "dropship" : "b2b",
    recipient,
    markupPercent: typeof value?.markupPercent === "number" && Number.isFinite(value.markupPercent) && value.markupPercent >= 0 ? value.markupPercent : legacyMarkup,
    shippingCost: typeof value?.shippingCost === "number" && Number.isFinite(value.shippingCost) && value.shippingCost >= 0 ? value.shippingCost : 0,
    status: ["b2b-confirmed", "awaiting-payment", "paid"].includes(value?.status) ? value.status : fallback.status,
  };
}

function validItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is CartItem =>
    typeof item?.code === "string" && typeof item?.title === "string" &&
    typeof item?.brand === "string" && typeof item?.image === "string" &&
    typeof item?.price === "number" && Number.isFinite(item.price) && item.price >= 0 &&
    Number.isSafeInteger(item?.quantity) && item.quantity > 0
  );
}

function createCartId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();

  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function makeCart(index: number, items: CartItem[] = []): SavedCart {
  return { id: createCartId(), number: index, name: `Carrito #${String(index).padStart(6, "0")}`,
    notes: "", address: DEFAULT_ADDRESS, createdAt: new Date().toISOString(), items, checkout: defaultCheckout() };
}

function loadState(): CartState {
  if (typeof window === "undefined") return SERVER_STATE;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed?.carts)) {
        const carts: SavedCart[] = parsed.carts
          .filter((cart: any) => typeof cart?.id === "string")
          .map((cart: any, index: number) => ({
            id: cart.id,
            number: Number.isSafeInteger(cart.number) && cart.number > 0 ? cart.number : Number(cart.name?.match?.(/^Carrito #(\d+)$/)?.[1]) || index + 1,
            name: typeof cart.name === "string" ? cart.name : `Carrito #${String(index + 1).padStart(6, "0")}`,
            notes: typeof cart.notes === "string" ? cart.notes : "",
            address: typeof cart.address === "string" ? cart.address : DEFAULT_ADDRESS,
            createdAt: typeof cart.createdAt === "string" ? cart.createdAt : new Date().toISOString(),
            items: validItems(cart.items),
            checkout: validCheckout(cart.checkout, validItems(cart.items)),
          }));
        return { carts, activeId: carts.some((cart) => cart.id === parsed.activeId) ? parsed.activeId : carts[0]?.id ?? null };
      }
    }
    const oldItems = validItems(JSON.parse(window.localStorage.getItem(OLD_STORAGE_KEY) || "[]"));
    const first = makeCart(1, oldItems);
    return { carts: [first], activeId: first.id };
  } catch {
    const first = makeCart(1);
    return { carts: [first], activeId: first.id };
  }
}

let state = loadState();

function publish(next: CartState) {
  state = next;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* session only */ }
  listeners.forEach((listener) => listener());
}
function subscribe(listener: () => void) { listeners.add(listener); return () => listeners.delete(listener); }

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) { state = loadState(); listeners.forEach((listener) => listener()); }
  });
}

export function useCarts() { return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE); }
export function useCart() {
  return useSyncExternalStore(subscribe,
    () => state.carts.find((cart) => cart.id === state.activeId)?.items ?? EMPTY_ITEMS,
    () => EMPTY_ITEMS);
}

export function createCart() {
  const number = state.carts.reduce((max, cart) => Math.max(max, cart.number), 0) + 1;
  const cart = makeCart(number);
  publish({ carts: [...state.carts, cart], activeId: cart.id });
  return cart.id;
}
export function selectCart(id: string) {
  if (state.carts.some((cart) => cart.id === id)) publish({ ...state, activeId: id });
}
export function updateCart(id: string, updates: Partial<Pick<SavedCart, "name" | "notes" | "address">>) {
  publish({ ...state, carts: state.carts.map((cart) => cart.id === id
    ? { ...cart, ...updates, checkout: "address" in updates ? { ...cart.checkout, status: "draft" as const } : cart.checkout }
    : cart) });
}
export function updateCheckout(id: string, updates: Partial<Omit<CheckoutData, "recipient">> & { recipient?: Partial<Recipient> }) {
  publish({ ...state, carts: state.carts.map((cart) => {
    if (cart.id !== id) return cart;
    return { ...cart, checkout: {
      ...cart.checkout, ...updates,
      recipient: { ...cart.checkout.recipient, ...updates.recipient },
      status: "status" in updates ? updates.status! : "draft",
    } };
  }) });
}
export function deleteCart(id: string) {
  const index = state.carts.findIndex((cart) => cart.id === id);
  if (index < 0) return;
  restorePending(state.carts[index].items);
  const carts = state.carts.filter((cart) => cart.id !== id);
  publish({ carts, activeId: state.activeId === id ? (carts[Math.max(0, index - 1)]?.id ?? null) : state.activeId });
}

function updateActiveItems(change: (items: CartItem[]) => CartItem[]) {
  let activeId = state.activeId;
  let carts = state.carts;
  if (!activeId || !carts.some((cart) => cart.id === activeId)) {
    const cart = makeCart(carts.length + 1);
    activeId = cart.id;
    carts = [...carts, cart];
  }
  publish({ activeId, carts: carts.map((cart) => cart.id === activeId
    ? { ...cart, items: change(cart.items), checkout: { ...cart.checkout, status: "draft" } } : cart) });
}
export function addToCart(product: CartProduct, quantity = 1) {
  if (!Number.isSafeInteger(quantity) || quantity < 1) return;
  updateActiveItems((items) => {
    const existing = items.find((item) => item.code === product.code);
    return existing
      ? items.map((item) => item.code === product.code ? { ...item, quantity: item.quantity + quantity } : item)
      : [...items, { ...product, quantity }];
  });
}
export function addPendingToCart(product: CartProduct, origin: PendingOrigin) {
  if (!Number.isSafeInteger(origin.quantity) || origin.quantity < 1) return;
  updateActiveItems(items => {
    const existing = items.find(item => item.code === product.code);
    return existing
      ? items.map(item => item.code === product.code
        ? { ...item, quantity: item.quantity + origin.quantity, pendingOrigins: [...(item.pendingOrigins ?? []), origin] }
        : item)
      : [...items, { ...product, quantity: origin.quantity, pendingOrigins: [origin] }];
  });
}

function restorePending(items: CartItem[]) {
  const origins = items.flatMap(item => item.pendingOrigins ?? []);
  if (!origins.length) return;
  updateOrders(orders => orders.map(order => ({
    ...order,
    items: order.items.map(item => {
      const matching = origins.filter(origin => origin.orderId === order.id && origin.sku === item.sku);
      return matching.length ? {
        ...item,
        requestedQty: item.requestedQty + matching.filter(origin => origin.pendingUnitsDeducted).reduce((sum, origin) => sum + origin.quantity, 0),
        pendingAction: matching.some(origin => !origin.pendingUnitsDeducted) ? undefined : item.pendingAction,
      } : item;
    }),
  })));
}

export function setCartQuantity(code: string, quantity: number) {
  if (!Number.isSafeInteger(quantity)) return;
  const current = state.carts.find(cart => cart.id === state.activeId)?.items.find(item => item.code === code);
  if (!current) return;
  const next = Math.max(0, quantity);
  if (next === current.quantity) return;

  const origins = current.pendingOrigins?.map(origin => ({ ...origin })) ?? [];
  const reserved = origins.reduce((sum, origin) => sum + origin.quantity, 0);
  let unitsToDiscard = Math.max(0, reserved - next);
  for (let index = origins.length - 1; index >= 0 && unitsToDiscard > 0; index--) {
    const count = Math.min(origins[index].quantity, unitsToDiscard);
    origins[index].quantity -= count;
    unitsToDiscard -= count;
  }

  updateActiveItems(items => items.flatMap(item => item.code !== code ? [item] : next > 0
    ? [{ ...item, quantity: next, pendingOrigins: origins.filter(origin => origin.quantity > 0) }]
    : []));
}
export function removeFromCart(code: string) {
  const item = state.carts.find(cart => cart.id === state.activeId)?.items.find(item => item.code === code);
  if (item) restorePending([item]);
  updateActiveItems((items) => items.filter((item) => item.code !== code));
}
export function clearCart() {
  const cart = state.carts.find(cart => cart.id === state.activeId);
  if (cart) { restorePending(cart.items); updateActiveItems(() => []); }
}
