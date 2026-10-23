import { useSyncExternalStore } from "react";

export type CartProduct = { code: string; title: string; brand: string; image: string; price: number };
export type CartItem = CartProduct & { quantity: number };
export type CheckoutMode = "b2b" | "dropship";
export type CheckoutStatus = "draft" | "b2b-confirmed" | "awaiting-payment" | "paid";
export type Recipient = {
  name: string; document: string; phone: string; email: string;
  street: string; number: string; apartment: string; city: string; province: string; postalCode: string;
};
export type CheckoutData = {
  mode: CheckoutMode;
  recipient: Recipient;
  salePrice: number;
  shippingCost: number;
  buyerPaysShipping: boolean;
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
  return { mode: "b2b", recipient: { ...EMPTY_RECIPIENT }, salePrice: 0,
    shippingCost: 0, buyerPaysShipping: true, status: "draft" };
}
function validCheckout(value: any): CheckoutData {
  const fallback = defaultCheckout();
  const recipient = Object.fromEntries(Object.keys(EMPTY_RECIPIENT).map((key) =>
    [key, typeof value?.recipient?.[key] === "string" ? value.recipient[key] : ""])) as Recipient;
  return {
    mode: value?.mode === "dropship" ? "dropship" : "b2b",
    recipient,
    salePrice: typeof value?.salePrice === "number" && Number.isFinite(value.salePrice) && value.salePrice >= 0 ? value.salePrice : 0,
    shippingCost: typeof value?.shippingCost === "number" && Number.isFinite(value.shippingCost) && value.shippingCost >= 0 ? value.shippingCost : 0,
    buyerPaysShipping: typeof value?.buyerPaysShipping === "boolean" ? value.buyerPaysShipping : true,
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

function makeCart(index: number, items: CartItem[] = []): SavedCart {
  return { id: crypto.randomUUID(), number: index, name: `Carrito #${String(index).padStart(6, "0")}`,
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
            checkout: validCheckout(cart.checkout),
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
export function setCartQuantity(code: string, quantity: number) {
  if (!Number.isSafeInteger(quantity)) return;
  updateActiveItems((items) => quantity <= 0
    ? items.filter((item) => item.code !== code)
    : items.map((item) => item.code === code ? { ...item, quantity } : item));
}
export function removeFromCart(code: string) {
  updateActiveItems((items) => items.filter((item) => item.code !== code));
}
export function clearCart() { if (state.activeId) updateActiveItems(() => []); }
