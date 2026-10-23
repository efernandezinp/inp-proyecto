import type { SavedCart } from "./cart";

export const SIMULATED_GATEWAY_RATE = 0.056;
export const DEFAULT_SHIPPING_ESTIMATE = 13000;
export const shippingEstimate = (cart: SavedCart) => cart.checkout.shippingCost > 0 ? cart.checkout.shippingCost : DEFAULT_SHIPPING_ESTIMATE;

export function calculateCheckout(cart: SavedCart) {
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const { salePrice, buyerPaysShipping } = cart.checkout;
  const shippingCost = shippingEstimate(cart);
  const customerTotal = salePrice + (buyerPaysShipping ? shippingCost : 0);
  const sellerShipping = buyerPaysShipping ? 0 : shippingCost;
  const gatewayFee = customerTotal * SIMULATED_GATEWAY_RATE;
  const margin = salePrice - subtotal - sellerShipping - gatewayFee;
  return { subtotal, customerTotal, sellerShipping, gatewayFee, margin };
}

export function checkoutErrors(cart: SavedCart): string[] {
  const errors: string[] = [];
  if (cart.items.length === 0) errors.push("Agregá al menos un producto.");
  if (cart.checkout.mode === "b2b") {
    if (!cart.address.trim()) errors.push("Seleccioná una dirección de entrega.");
    return errors;
  }
  const { recipient, salePrice } = cart.checkout;
  if (!recipient.name.trim()) errors.push("Ingresá el nombre del destinatario.");
  if (!recipient.document.trim()) errors.push("Ingresá el DNI o CUIT del destinatario.");
  if (!recipient.phone.trim()) errors.push("Ingresá un teléfono de contacto.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email.trim())) errors.push("Ingresá un correo electrónico válido.");
  if (!recipient.street.trim() || !recipient.number.trim()) errors.push("Completá la calle y el número.");
  if (!recipient.city.trim() || !recipient.province.trim() || !recipient.postalCode.trim()) errors.push("Completá localidad, provincia y código postal.");
  if (salePrice <= 0) errors.push("Definí un precio de venta mayor a cero.");
  return errors;
}
