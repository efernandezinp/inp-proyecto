import { useState } from "react";
import { Product, isStockAvailable } from "@/lib/products";
import { Heart, ArrowRightLeft, Link as LinkIcon, Info, Bike, ShoppingCart, Trash2, ChevronUp, ChevronDown, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import styles from "./ProductCard.module.css";
import { addToCart, removeFromCart, useCart } from "@/lib/cart";

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list';
  showOfferDetails?: boolean;
}

export function ProductCard({ product, viewMode = 'grid', showOfferDetails = false }: ProductCardProps) {
  const { id, title, price, originalPrice, image, brand, stock, isNew, code, weightKg, weightEstimated } = product;
  const weightLabel = weightKg == null ? null : `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 3 }).format(weightKg)} kg`;
  const [quantity, setQuantity] = useState(1);
  const addedQuantity = useCart().find((item) => item.code === code)?.quantity ?? 0;

  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  
  // Precio público = precio original, Precio lista = precio original + 10%
  const precioPublico = originalPrice;
  const precioLista = originalPrice ? originalPrice * 1.1 : price * 1.1;

  const handleAdd = () => {
    addToCart(product, quantity);
    setQuantity(1);
  };

  const handleRemove = () => {
    removeFromCart(code);
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const regions = ['NOA', 'NEA', 'BUE', 'CUYO'] as const;

  const getStockColor = (qty: number) => {
    return isStockAvailable(qty) ? '#ffb400' : '#ff5c65';
  };

  const StockBars = () => (
    <div className={styles.stockBars}>
      {regions.map(region => {
        const qty = stock[region] ?? 0;
        return (
          <div key={region} className={styles.stockBarRegion}>
            <span className={styles.regionLabel}>{region === 'CUYO' ? 'CUY' : region}</span>
            <div className={styles.stockAmount}>
              <span className={styles.stockBar} style={{ backgroundColor: region === 'BUE' ? '#16b967' : getStockColor(qty) }} aria-hidden="true" />
              {region === 'BUE'
                ? <Check className={styles.stockCheck} aria-label="BUE" />
                : <span className={styles.stockQuantity}>{qty}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

  const ActionIcons = () => (
    <div className={styles.actionIcons}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger><Heart className={styles.actionIcon} /></TooltipTrigger>
          <TooltipContent><p>Favoritos</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger><ArrowRightLeft className={styles.actionIcon} /></TooltipTrigger>
          <TooltipContent><p>Comparar</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger><LinkIcon className={styles.actionIcon} /></TooltipTrigger>
          <TooltipContent><p>Copiar Link</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger><Bike className={styles.actionIcon} /></TooltipTrigger>
          <TooltipContent><p>Vehículos compatibles</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger><Info className={styles.actionIcon} /></TooltipTrigger>
          <TooltipContent><p>Más información</p></TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className={styles.listCard} data-testid={`card-product-${id}`}>
        {showOfferDetails && discount > 0 && (
          <div className={styles.listBadges}>
            <Badge className="bg-red-600 hover:bg-red-700 text-[11px] font-bold rounded-full px-2">{discount}%</Badge>
          </div>
        )}
        
        <div className={styles.listImageWrapper}>
          <img src={image} alt={title} className="max-w-full max-h-full object-contain mix-blend-multiply" />
        </div>
        
        <div className={styles.listContent}>
          <div className={styles.listHeader}>
            <div className={styles.listInfo}>
              <div className={styles.listBrand}>{brand}</div>
              <h3 className={styles.listTitle}>{title}</h3>
              <div className={styles.codeInfo}>Cod: {code}</div>
              
              <div className={styles.presentacion}>
                <div className={styles.presentacionTitle}>PRESENTACIÓN</div>
                <ul className={styles.presentacionList}>
                  <li>1° Envase Botella 1 UNI</li>
                  <li>2° Envase Cajas 12 UNI</li>
                  {weightLabel && <li>Peso {weightEstimated ? 'aproximado' : 'unitario'}: {weightLabel}</li>}
                </ul>
              </div>

              <StockBars />
            </div>

            <div className={styles.listPriceSection}>
              <div className={styles.priceRow}>
                <span className={styles.priceLabelSmall}>PRECIO FINAL:</span>
                <span className={styles.priceFinal}>${price.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.priceLabelSmall}>PRECIO LISTA:</span>
                <span className={styles.priceStriked}>${precioLista.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className={styles.priceRow}>
                <span className={styles.priceLabelSmall}>PRECIO PÚBLICO:</span>
                <span className={styles.pricePublico}>${precioPublico?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                {showOfferDetails && discount > 0 && <Badge className="bg-orange-500 hover:bg-orange-600 text-[10px] ml-2">{discount}%</Badge>}
              </div>

              {addedQuantity === 0 ? (
                <div className={styles.addSection}>
                  <button className={styles.addButton} onClick={handleAdd} data-testid={`button-add-${id}`}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    AGREGAR AL CARRO
                  </button>
                  <div className={styles.quantitySelector}>
                    <span className={styles.quantityValue}>{quantity}</span>
                    <div className={styles.quantityControls}>
                      <button onClick={incrementQuantity} className={styles.quantityBtn} data-testid={`button-increment-${id}`}>
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button onClick={decrementQuantity} className={styles.quantityBtn} data-testid={`button-decrement-${id}`}>
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.removeSection}>
                  <button className={styles.removeButton} onClick={handleRemove} data-testid={`button-remove-${id}`}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    QUITAR
                  </button>
                  <div className={styles.addedBadge}>{addedQuantity} UNI</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className={styles.gridCard} data-testid={`card-product-${id}`}>
      {showOfferDetails && discount > 0 && (
        <div className={styles.badges}>
          <span className={styles.offerBadge}>OFERTA {discount}%</span>
        </div>
      )}

      <div className={styles.imageWrapper}>
        <div className={styles.imageContainer}>
          <img src={image} alt={title} className={styles.productImage} />
        </div>
        <div className={styles.imageDots} aria-hidden="true">
          <span className={styles.dot + " " + styles.dotActive}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
          <span className={styles.dot}></span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.brand}>{brand}</div>
        <h3 className={styles.title} title={title}>{title}</h3>
        <div className={styles.code}>Cod: {code}</div>
        <div className={styles.presentacion}>1° Envase Caja 1 UNI</div>
        {weightLabel && <div className={styles.weightLine}>Peso {weightEstimated ? 'aprox.' : 'unitario'}: {weightLabel}</div>}

        <div className={styles.prices}>
          <div className={styles.priceLabel}>PRECIO FINAL:</div>
          <div className={styles.priceLine}>
            <span className={styles.price}>$ {price.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className={styles.priceStrikedSmall}>$ {originalPrice.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className={styles.priceLabel}>PRECIO PÚBLICO:</div>
          <div className={styles.pricePublicoValue}>
            $ {(originalPrice * 1.1).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {showOfferDetails && discount > 0 && (
          <div className={styles.offerPanel}>
            <div className={styles.offerPanelHeading}>
              <span>OFERTA {brand}</span>
              <span>HASTA {discount}% OFF</span>
            </div>
            <div className={styles.offerTrack}><span /></div>
            <div className={styles.offerStatus}>OFERTA DISPONIBLE</div>
          </div>
        )}

        <StockBars />

        {showOfferDetails && discount > 0 && (
          <div className={styles.bonusRow}>
            <span>BONIFICACIÓN %:</span>
            <span className={styles.bonusValue}>0</span>
          </div>
        )}

        {addedQuantity === 0 ? (
          <div className={styles.addSectionGrid}>
            <button className={styles.addButtonGrid} onClick={handleAdd} data-testid={`button-add-${id}`}>
              <ShoppingCart size={17} />
              AGREGAR
            </button>
            <div className={styles.quantitySelectorGrid}>
              <input type="number" min="1" value={quantity} aria-label={`Cantidad de ${title}`}
                onChange={(event) => setQuantity(Math.max(1, Number(event.target.value) || 1))} />
            </div>
          </div>
        ) : (
          <div className={styles.removeSectionGrid}>
            <button className={styles.removeButtonGrid} onClick={handleRemove} data-testid={`button-remove-${id}`}>
              <Trash2 size={16} />
              QUITAR
            </button>
            <div className={styles.addedBadgeGrid}>{addedQuantity} UNI</div>
          </div>
        )}
      </div>
    </div>
  );
}
