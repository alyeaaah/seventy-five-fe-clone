import { InputGroup } from "@/components/Base/Form"
import { CartProduct, CartProductDetail } from "@/utils/schema"
import { useCart } from "@/utils/cart"
import Lucide from "@/components/Base/Lucide"
import { FormInput } from "@/components/Base/Form"

export const InputQuantity = ({ product, productUuid, size = "md" }: { product: CartProduct, productUuid: string, size?: "sm" | "md" }) => {
  const { updateCartQty, getCart, removeFromCart } = useCart();
  const productDetail = product.details.find((detail) => detail.uuid === productUuid) || product.details[0];

  const handleIncrease = () => {
    if (productDetail) {
      updateCartQty(product, productUuid, productDetail.qty + 1);
    }
  };
  const handleDecrease = () => {
    if (productDetail) {
      if (productDetail.qty > 1) {
        updateCartQty(product, productUuid, productDetail.qty - 1);
      } else {
        removeFromCart(productUuid);
      }
    }
  }
  return (
    <InputGroup className={`${size === "sm" ? "h-8" : "h-12"} flex-row ${size === "sm" ? "min-w-28" : "min-w-40"}`}>
      <InputGroup.Text
        className="flex items-center justify-center cursor-pointer active:bg-opacity-50 hover:bg-slate-200 !p-0 h-full !aspect-square"
        onClick={() => handleDecrease()}
      >
        {productDetail.qty > 1 ? <Lucide icon="Minus" className="w-4 h-4" /> : <Lucide icon="Trash" className="w-4 h-4 text-red-500" />}
      </InputGroup.Text>
      <FormInput type="number"
        value={productDetail.qty}
        onChange={(e) => updateCartQty(product, productUuid, Number(e.target.value))}
        className="md:text-lg font-semibold md:w-16 w-12 text-center text-gray-600 text-xs p-0 flex"
      />
      <InputGroup.Text
        className="!text-emerald-800 flex items-center justify-center cursor-pointer active:bg-opacity-50 hover:bg-slate-200 !aspect-square !p-0 h-full"
        onClick={() => handleIncrease()}
      >
        <Lucide icon="Plus" className="w-4 h-4" />
      </InputGroup.Text>
    </InputGroup>
  )
}
