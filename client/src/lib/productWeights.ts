import type { Product } from "./products";

type WeightInput = Pick<Product, "code" | "title" | "brand" | "width" | "ratio" | "rim">;

const roundKg = (kg: number) => Math.max(0.02, Math.round(kg * 100) / 100);

/** Unit weights for display and planning only. These are not freight quotes. */
export function estimateProductWeightKg(product: WeightInput): number {
  const title = product.title.replace(/\u00a0/g, " ").toUpperCase();
  const family = product.code.slice(0, 3);
  const group = product.code.slice(0, 6);

  if (family === "001") {
    if (group === "001004") return 5;
    const rawWidth = Number(product.width);
    const widthMm = rawWidth > 0 && rawWidth < 20 ? rawWidth * 25.4 : rawWidth || 90;
    const rim = Number(product.rim) || 17;
    const offRoad = /MX|MOTOCROSS|ENDURO|SCORPION|TRAKMASTER|MILLVILLE|SOUTHWICK|GARACROSS/.test(title);
    return roundKg(Math.min(10, Math.max(1.8, 2.45 + (widthMm - 70) * 0.035 + (rim - 14) * 0.1 + (offRoad ? 0.45 : 0))));
  }

  if (family === "002") return /MOUSSE/.test(title) ? 1.2 : /ATV/.test(title) ? 0.9 : 0.55;
  if (family === "003") {
    if (/KIT|JUEGO/.test(title)) return 3.2;
    if (/UNION/.test(title)) return /10 UNIDADES/.test(title) ? 0.35 : 0.06;
    if (/PIÑON/.test(title)) return 0.3;
    if (/CORONA/.test(title)) return 0.85;
    if (/CORREA/.test(title)) return 0.35;
    return 1.65;
  }
  if (family === "004") return /ZAPATA/.test(title) ? 0.55 : /PASTILLA/.test(title) ? 0.2 : 0.3;
  if (family === "005") {
    if (/CIGUEÑAL|CAJA DE CAMBIO/.test(title)) return 3;
    if (/CILINDRO|EMBRAGUE COMPLETO/.test(title)) return 2.3;
    if (/CARBURADOR/.test(title)) return 0.75;
    if (/PISTON|BIELA|DISCOS DE EMBRAGUE/.test(title)) return 0.6;
    if (/FILTRO DE AIRE/.test(title)) return 0.3;
    if (/FILTRO DE ACEITE/.test(title)) return 0.2;
    if (/KIT.*DISCOS/.test(title)) return 1;
    if (/JUEGO.*JUNTAS/.test(title)) return 0.2;
    if (/JUNTA|ORING|ARANDELA/.test(title)) return 0.08;
    if (/VALVULA|ARO|CADENA DISTRIBUCION/.test(title)) return 0.25;
    return 0.5;
  }
  if (family === "006") return 0.08;
  if (family === "007") return 0.07;
  if (family === "008") return 0.06;
  if (family === "009") {
    const volume = title.match(/(\d+(?:[.,]\d+)?)\s*(?:LT\.?|LITROS?|L\b|CC\b|CM3\b|ML\b)/);
    if (volume) {
      const amount = Number(volume[1].replace(",", "."));
      const litres = /CC\b|CM3\b|ML\b/.test(volume[0]) ? amount / 1000 : amount;
      const drum = litres >= 100 ? 18 : litres >= 20 ? 2 : 0.12;
      return roundKg(litres * 0.95 + drum);
    }
    const grams = title.match(/(\d+)\s*(?:GR|GS|G)\b/);
    if (grams) return roundKg(Number(grams[1]) / 1000 + 0.08);
    return 1.1;
  }
  if (family === "010") return /JUEGO|PAR/.test(title) ? 3.5 : /KIT/.test(title) ? 0.4 : 1.8;
  if (family === "011") return 0.3;
  if (family === "012") return /BTX|YT4|YB4/.test(title) ? 1.8 : 2.8;
  if (family === "014") return /100 M|100M/.test(title) ? 4 : 0.25;
  if (family === "016") return 0.15;
  if (family === "018") {
    if (/CAMPERA|CHAQUETA/.test(title)) return 1.5;
    if (/BOTA/.test(title)) return 2;
    if (/TRAJE|PANTALON/.test(title)) return 0.9;
    if (/GUANTE|CODERA|RODILLERA|PROTECTOR/.test(title)) return 0.4;
    return 0.6;
  }
  if (family === "019") return 0.16;
  if (family === "020") {
    if (/MOTOR DE ARRANQUE|VOLANTE MAGNETICO/.test(title)) return 2.3;
    if (/ESTATOR|BOBINA/.test(title)) return 0.6;
    if (/ALARMA|BOCINA/.test(title)) return 0.35;
    return 0.2;
  }
  if (family === "021") return /CAJA DE 10/.test(title) ? 0.5 : 0.08;
  if (family === "023") return /KIT/.test(title) ? 0.35 : 0.06;
  if (family === "025") {
    if (/PORTABAUL|PORTAEQUIPAJE|PROTECTOR CARTER/.test(title)) return 2;
    if (/ESPEJO/.test(title)) return 0.8;
    if (/LINGA|CINTA DE AMARRE/.test(title)) return 1.1;
    return 0.55;
  }
  if (family === "028") {
    if (/ELEVADOR/.test(title)) return 12;
    if (/COMPRESOR|LLAVE DE IMPACTO|JUEGO DE TUBOS/.test(title)) return 3;
    if (/MARTILLO|TORQUIMETRO|KIT DE HERRAMIENTAS/.test(title)) return 1;
    return 0.45;
  }
  if (family === "029") return /FARO DELANTERO/.test(title) ? 0.8 : 0.4;
  if (family === "030") return /MANUBRIO/.test(title) ? 1.1 : 0.35;
  if (family === "031") return /HORQUILLON|CABALLETE/.test(title) ? 3 : 0.85;
  if (family === "033") return /AEROSOL/.test(title) ? 0.5 : 0.3;
  if (family === "999") {
    if (group === "999031") return /JUEGO/.test(title) ? 9 : 4.5;
    if (/CUBIERTA/.test(title)) return /JUEGO|PAR/.test(title) ? 8 : 5;
    if (/CAMARA/.test(title)) return 1.1;
    if (/FILTRO/.test(title)) return 0.5;
    if (/BUJIA/.test(title)) return /3 CAJAS/.test(title) ? 2.5 : 0.8;
    if (/CABLE/.test(title)) return 0.5;
    if (/LUBRICANTE|ACEITE|LUBERY/.test(title)) return 15;
    if (/TRANSMISION/.test(title)) return 3.5;
    return 1.5;
  }
  return 0.5;
}
