import { Button, FloatButton, } from "antd";
import Lucide from "@/components/Base/Lucide";
import FloatButtonGroup from "antd/es/float-button/FloatButtonGroup";
import { HTMLAttributes, useState } from "react";
import { useCart } from "@/utils/cart";
import { useNavigate } from "react-router-dom";
import { paths } from "@/router/paths";
interface Props extends HTMLAttributes<HTMLDivElement> {
  position?: "left" | "right";
  visible?: boolean;
}
export const FloatingCartButton = ({ position = "right", visible = true, className, ...props }: Props) => {
  const [open, setOpen] = useState(false);
  const { getCartQty, getCart, getCartSubtotal, removeFromCart } = useCart();
  const navigate = useNavigate();
  return (
    <>
      <FloatButtonGroup
        trigger="click"
        open={open}
        icon={
          <div className="w-12 h-12 flex items-center justify-center relative text-white">
            <Lucide icon="ShoppingCart" className="w-6 h-6 text-emerald-800" />
            {getCartQty() > 0 && <div className="absolute top-1 right-1 min-w-4 p-0.5 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-semibold leading-4">{getCartQty()}</div>}
          </div>
        }
        onOpenChange={setOpen}
        className={`${position === "left" ? "custom-cart-button-left" : "custom-cart-button-right"} custom-cart-button ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-64"} transition-all duration-500 ${className}`}
        placement="bottom"
      >
        <div className={`w-full sm:min-w-[50vw] h-fit bg-white shadow-lg rounded-xl text-emerald-800 block bg-transparent overflow-y-auto max-h-[60vh] ${getCart()?.length > 0 ? "pb-28" : "pb-4"} border`}>
          {getCart()?.length > 0 ? getCart().map((cartItem, index) => (
            <div key={index} className="flex flex-col md:flex-row items-center justify-start w-full p-2 gap-2 border-b border-gray-200 min-h-20">
              <div className="flex flex-row items-start justify-start w-full">
                <img src={cartItem.image_cover || ""} alt={cartItem.name || ""} className="aspect-square border rounded-md md:w-16 md:h-16 w-24 mt-2 h-24 object-cover mx-2" />
                <div className="text-start w-full">
                  <h3 className="text-lg font-semibold line-clamp-2 text-ellipsis">{cartItem.name}</h3>
                  <div className="space-y-1 ">
                    {cartItem.details.map((detail, index) => (
                      <div key={index} className="flex flex-row justify-between items-center border-b pb-1 last:border-b-0 last:pb-0">
                        <div className="flex flex-col items-start justify-start w-full">
                          <p className="text-xs text-gray-500 font-semibold block md:hidden">IDR {Intl.NumberFormat('id-ID').format(detail.price)}</p>
                          <p className="text-sm text-gray-500"><span className="md:hidden">{detail.qty} {cartItem.unit}, </span>Variant: {detail.size}</p>
                          <p className="text-sm text-gray-500 font-semibold md:block hidden">IDR {Intl.NumberFormat('id-ID').format(detail.price)}</p>
                          <p className="text-[16px] text-emerald-800 font-semibold md:hidden block">IDR {Intl.NumberFormat('id-ID').format(detail.price * detail.qty)}</p>
                        </div>
                        <div className="md:min-w-24 hidden md:block">
                          {detail.qty} {cartItem.unit}
                        </div>
                        <div className="md:min-w-36 text-end font-semibold text-lg mr-2 hidden md:block">
                          IDR {Intl.NumberFormat('id-ID').format(detail.price * detail.qty)}
                        </div>
                        <div key={index} className="min-w-8 text-danger text-center h-full items-center justify-center cursor-pointer" onClick={() => removeFromCart(detail.uuid)}>
                          <Lucide icon="Trash" className="w-4 h-4" />
                        </div>

                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center w-full p-4 m-2">
              <Lucide icon="ShoppingCart" className="w-12 h-12 text-gray-500" />
              <p className="text-sm font-semibold text-gray-500 mt-2">Your cart is empty</p>
            </div>
          )}
        </div>
        {getCart()?.length > 0 && <div className="flex flex-col items-start justify-center w-full absolute bg-white bottom-0 rounded-xl p-2">
          <div className="flex flex-row items-center justify-between w-full p-2">
            <p className="text-sm font-semibold text-gray-950">Total:</p>
            <p className="text-xl text-gray-950 font-bold">IDR {Intl.NumberFormat('id-ID').format(getCartSubtotal())}</p>
          </div>
          <Button
            // variant="outline-primary"
            className="border-emerald-800 text-emerald-800 py-2 px-6 rounded-xl w-full hover:bg-yellow-500 !h-12 !capitalize"
            onClick={() => {
              setOpen(false);
              navigate(paths.shop.cart);
            }}
          >
            Begin Checkout
          </Button>
        </div>}
      </FloatButtonGroup>
    </>
  );
};