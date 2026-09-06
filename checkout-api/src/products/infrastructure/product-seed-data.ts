type ProductSeed = {
  title: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  deliveryFee: number;
  images: string[];
};

export const PRODUCT_SEED_DATA: ProductSeed[] = [
  {
    title: 'Wireless Earbuds Pro',
    description:
      'Audífonos inalámbricos de última generación con cancelación activa de ruido (ANC) de doble micrófono, que bloquea el ruido ambiental para una experiencia de audio inmersiva. Su estuche de carga compacto ofrece hasta 30 horas de batería total (6 horas en los audífonos + 24 horas adicionales en el estuche), con carga rápida que te da 1 hora de uso con solo 10 minutos de carga. Resistencia al agua y sudor certificada IPX5, controles táctiles intuitivos, y conexión Bluetooth 5.3 de baja latencia, perfecta para llamadas, música y hasta gaming móvil sin retrasos perceptibles.',
    price: 189000,
    currency: 'COP',
    stock: 8,
    deliveryFee: 8000,
    images: [
      'https://images.unsplash.com/photo-1783890848515-c0dc28b25ef2?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHdpcmVsZXNzJTIwZWFyYnVkc3xlbnwwfDJ8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1783890848512-f5fa2dba2d5d?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    ],
  },
  {
    title: 'Mechanical Keyboard 65%',
    description:
      'Teclado mecánico compacto en formato 65%, con switches hot-swappable, estructura en aluminio y retroiluminación RGB personalizable. Ideal para escritorios minimalistas que no quieren sacrificar la experiencia de escritura.',
    price: 289000,
    currency: 'COP',
    stock: 8,
    deliveryFee: 15000,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=800&auto=format&fit=crop&q=60',
    ],
  },
  {
    title: 'Smart Watch Band Edition',
    description:
      'Reloj inteligente con pantalla AMOLED, monitoreo de frecuencia cardíaca y sueño, GPS integrado y hasta 7 días de batería. Correa intercambiable incluida.',
    price: 459000,
    currency: 'COP',
    stock: 5,
    deliveryFee: 10000,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1434493907317-a46b5bbe7834?w=800&auto=format&fit=crop&q=60',
    ],
  },
  {
    title: 'Portable Bluetooth Speaker',
    description:
      'Parlante portátil resistente al agua (IPX7), con 360° de sonido envolvente y hasta 20 horas de reproducción continua. Perfecto para exteriores.',
    price: 149000,
    currency: 'COP',
    stock: 15,
    deliveryFee: 9000,
    images: [
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=60',
    ],
  },
  {
    title: 'Noise Cancelling Headphones',
    description:
      'Audífonos over-ear con cancelación activa de ruido premium, drivers de 40mm y hasta 35 horas de batería. Incluye estuche rígido de viaje.',
    price: 329000,
    currency: 'COP',
    stock: 6,
    deliveryFee: 12000,
    images: [
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=60',
    ],
  },
  {
    title: 'Minimalist Leather Backpack',
    description:
      'Mochila en cuero vegetal con compartimento acolchado para portátil de hasta 15", diseño minimalista y correas ajustables ergonómicas.',
    price: 219000,
    currency: 'COP',
    stock: 0,
    deliveryFee: 18000,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=60',
    ],
  },
];
