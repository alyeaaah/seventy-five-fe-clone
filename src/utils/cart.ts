import { useEffect, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { accessTokenAtom, cartAtom, userAtom } from './store';
import { CartProduct, CartProductDetail, cartProductSchema } from './schema';
import { clientEnv } from '@/env';
import { useDebounceFn } from 'ahooks';
import { MerchProductsData } from '@/pages/Admin/Merchandise/api/schema';

export const useCart = () => {
  const cart = useAtomValue(cartAtom);
  const accessToken = useAtomValue(accessTokenAtom);
  const userInfo = useAtomValue(userAtom);
  const setCart = useSetAtom(cartAtom);
  // Debounced function using ahooks
  const { run: debouncedUpdateCartDb } = useDebounceFn(
    (products: CartProduct[]) => {
      try {
        if (!userInfo?.uuid) return;
        fetch(`${clientEnv.API_BASE_URL}/public/merchandise/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          Authorization: `${accessToken}`,
        },
        body: JSON.stringify(products),
        }).then(async res => {
          const data = await res.json();
          if (cartProductSchema.array().safeParse(data.cart).success) {
            setCart(data.cart);
          }
        }).catch(console.error);
      } catch (error) {
        console.error("failed to update cart",error);
      }
    },
    { wait: 1000 }
  );
  const { run: debouncedGetCartDb } = useDebounceFn(
    () => {
      if (!userInfo?.uuid) return;
      fetch(`${clientEnv.API_BASE_URL}/public/merchandise/cart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${accessToken}`,
        },
      }).then(res => res.json()).then(data => {
        if (JSON.stringify(data) !== JSON.stringify(cart) && cartProductSchema.array().safeParse(data).success) {
          setCart(data);
        }
      }).catch(console.error);
    },
    { wait: 1500 }
  );
  const addToCart = (product: MerchProductsData, productDetailUuid: string, qty: number) => {
      // check if there is same product.uuid
    const cartProductIndex = cart?.findIndex((item) => item.uuid === product.uuid);
    // check if there is same product.detail.uuid
    let cartDetailIndex = -1;
    if (cartProductIndex !== -1) {
      cartDetailIndex = cart?.[cartProductIndex].details.findIndex((detail) => detail.uuid === productDetailUuid);
    }
    // check productDetailIndex
    const productDetailIndex = product.details.findIndex((detail) => detail.uuid === productDetailUuid);

      // check if there is no product detail with same uuid
    if (cartDetailIndex !== -1 && cartProductIndex !== -1) {
      updateCartQty(cart?.[cartProductIndex], productDetailUuid, cart?.[cartProductIndex].details[cartDetailIndex].qty + qty);
    } else if (cartProductIndex !== -1 && cartDetailIndex === -1 && productDetailIndex !== -1) {
      const newCart = cart?.map((cartItem) => {
        if (cartItem.uuid === product.uuid) {
          return {
            ...cartItem,
            details: [
              ...cartItem.details,
              {
                ...product.details[productDetailIndex],
                qty: qty,
              }
            ]
          };
        }
        return cartItem;
      }) || [];
      setCart(newCart);
      debouncedUpdateCartDb(newCart);
    } else if (cartProductIndex === -1 && cartDetailIndex === -1) {
      const newCart: CartProduct[] = [...(cart || []), {
        ...product,
        details: product.details.filter((detail) => detail.uuid === productDetailUuid).map((detail) => ({
          ...detail,
          qty: qty,
        }))
      }];
      setCart(newCart);
      debouncedUpdateCartDb(newCart);
    }
  }; 
  
  const updateCartQty = (product: CartProduct, productDetailUuid: string, qty: number) => {
      // check if there is same product.uuid
    const cartProductIndex = cart?.findIndex((item) => item.uuid === product.uuid);
    // check if there is same product.detail.uuid
    let cartDetailIndex = -1;
    if (cartProductIndex !== -1) {
      cartDetailIndex = cart?.[cartProductIndex].details.findIndex((detail) => detail.uuid === productDetailUuid);
    }
    // check productDetailIndex
    const productDetailIndex = product.details.findIndex((detail) => detail.uuid === productDetailUuid);
    qty = qty > product.details[productDetailIndex].quantity ? product.details[productDetailIndex].quantity : qty;

      // check if there is no product detail with same uuid
    if (cartDetailIndex !== -1 && cartProductIndex !== -1) {
      const newCart = cart?.map((cartItem) => {
        if (cartItem.uuid === product.uuid) {
          return {
            ...cartItem,
            details: cartItem.details.map((detail) => detail.uuid === productDetailUuid ? { ...detail, qty: qty } : detail)
          };
        }
        return cartItem;
      }) || [];
      setCart(newCart);
      debouncedUpdateCartDb(newCart);
    } else if (cartProductIndex !== -1 && cartDetailIndex === -1 && productDetailIndex !== -1) {
      const newCart = cart?.map((cartItem) => {
        if (cartItem.uuid === product.uuid) {
          return {
            ...cartItem,
            details: [
              ...cartItem.details,
              {
                ...product.details[productDetailIndex],
                qty: qty,
              }
            ]
          };
        }
        return cartItem;
      }) || [];
      setCart(newCart);
      debouncedUpdateCartDb(newCart);
    } else if (cartProductIndex === -1 && cartDetailIndex === -1) {
      const newCart = [...(cart || []), {
        ...product,
        details: product.details.filter((detail) => detail.uuid === productDetailUuid).map((detail) => ({
          ...detail,
          qty: qty,
        }))
      }];
      setCart(newCart);
      debouncedUpdateCartDb(newCart);
    }
  };

  const removeFromCart = (productDetailUuid: CartProductDetail['uuid']) => {
    const newCart = (cart || []).map(item => (item.details.some(detail => detail.uuid === productDetailUuid) ? {
      ...item,
      details: item.details.filter(detail => detail.uuid !== productDetailUuid)
    } : item)).filter(item => item.details.length > 0);
    setCart(newCart);
    debouncedUpdateCartDb(newCart);
  };

  const clearCart = () => {
    setCart([]);
    debouncedUpdateCartDb([]);
  };

  const getCart = (): CartProduct[] => {
    if (userInfo?.uuid && accessToken) {
      debouncedGetCartDb();
    };
    return cart || []
  };
  const getCartCount = (): number => cart?.length || 0;
  const getCartSubtotal = (): number =>
    cart?.reduce((total, item) => total + item.details.reduce((detailTotal, detail) => detailTotal + detail.price * detail.qty, 0), 0) || 0;
  const getCartQty = (): number =>
    cart?.reduce((total, item) => total + (item?.details?.reduce((detailTotal, detail) => detailTotal + detail.qty, 0) || 0), 0) || 0;
  
  return {
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    getCart,
    getCartCount,
    getCartSubtotal,
    getCartQty,
  };
};
