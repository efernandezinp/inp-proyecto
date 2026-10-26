import type { SavedCart } from "./cart";

export const DEFAULT_SHIPPING_ESTIMATE = 13000;
export const shippingEstimate = (cart: SavedCart) => cart.checkout.shippingCost > 0 ? cart.checkout.shippingCost : DEFAULT_SHIPPING_ESTIMATE;

export function calculateCheckout(cart: SavedCart) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = shippingEstimate(cart);
  const baseTotal = subtotal + shippingCost;
  const markupAmount = baseTotal * cart.checkout.markupPercent / 100;
  const customerTotal = baseTotal + markupAmount;
  return { subtotal, shippingCost, baseTotal, markupAmount, customerTotal };
}

export function checkoutErrors(cart: SavedCart): string[] {
  const errors: string[] = [];
  if (cart.items.length === 0) errors.push("Agregá al menos un producto.");
  if (cart.checkout.mode === "b2b") {
    if (!cart.address.trim()) errors.push("Seleccioná una dirección de entrega.");
    return errors;
  }
  const { recipient, markupPercent } = cart.checkout;
  if (!recipient.name.trim()) errors.push("Ingresá el nombre del destinatario.");
  if (!recipient.document.trim()) errors.push("Ingresá el DNI o CUIT del destinatario.");
  if (!recipient.phone.trim()) errors.push("Ingresá un teléfono de contacto.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email.trim())) errors.push("Ingresá un correo electrónico válido.");
  if (!recipient.street.trim() || !recipient.number.trim()) errors.push("Completá la calle y el número.");
  if (!recipient.city.trim() || !recipient.province.trim() || !recipient.postalCode.trim()) errors.push("Completá localidad, provincia y código postal.");
  if (!Number.isFinite(markupPercent) || markupPercent < 0) errors.push("Ingresá un markup válido.");
  return errors;
}
