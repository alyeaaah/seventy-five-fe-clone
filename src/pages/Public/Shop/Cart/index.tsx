import { useCart } from "@/utils/cart";
import LayoutWrapper from "@/components/LayoutWrapper";
import { FadeAnimation } from "@/components/Animations";
import { IconLogoAlt } from "@/assets/images/icons";
import { paths } from "@/router/paths";
import { Breadcrumb, Divider, Modal, Radio } from "antd";
import Lucide from "@/components/Base/Lucide";
import { FormInput, FormTextarea } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import { useState } from "react";
import { PaymentMethodEnum, paymentMethodValue } from "@/utils/faker";
import { InputQuantity } from "./components/InputQuantity";
import { PlayerProfileApiHooks } from "@/pages/Players/Profile/api";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { ModalAddress } from "./components/ModalAddress";
import { Link } from "react-router-dom";
import { tempAddressAtom } from "@/utils/store";
import { PublicShopApiHooks } from "../api";
import { checkoutPayloadSchema } from "../api/schema";
import { isValidEmail } from "@/utils/helper";
import { useNavigate } from "react-router-dom";

export const PublicShopCart = () => {
  const { getCartQty, getCart, updateCartQty, removeFromCart, getCartSubtotal } = useCart();
  const navigate = useNavigate();
  const userInfo = useAtomValue(userAtom);
  const tempAddress = useAtomValue(tempAddressAtom);
  const [email, setEmail] = useState("");
  const [modalAddress, setModalAddress] = useState(false);
  const [modalProcess, setModalProcess] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [askToLoginModal, setAskToLoginModal] = useState({
    address: false,
    cart: false,
    paymentMethod: false,
    cod: false
  });

  const [pointToUse, setPointToUse] = useState({
    point: 0,
    applied: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState({
    selected: PaymentMethodEnum.QRIS,
    open: false
  });
  const { data: playerAddress } = PlayerProfileApiHooks.useGetPlayerAddress({}, { enabled: !!userInfo });
  const { mutate: checkoutMerch } = PublicShopApiHooks.useCheckoutMerchandise();
  const breadcrumbItems = [
    {
      title: "Home",
      href: "/"
    },
    {
      title: "Shop",
      href: paths.shop.index
    },
    {
      title: "Cart",
      href: "#"
    }
  ];
  const submitOrder = () => {
    const payload = {
      player_uuid: userInfo?.uuid,
      email: email,
      address: playerAddress?.data?.address ? playerAddress?.data : tempAddress,
      point_used: pointToUse.applied || 0,
      carts: getCart().flatMap((item) => item.details.map((detail) => ({
        uuid: detail.uuid,
        product_uuid: item.uuid,
        product_name: item.name,
        product_image: item.image_cover,
        product_size: detail.size,
        product_unit: item.unit,
        qty: detail.qty,
        price: detail.price,
      }))),
      payment_method: paymentMethod.selected || PaymentMethodEnum.QRIS,
      total: getCartSubtotal() - pointToUse.applied,
      subtotal: getCartSubtotal(),
      note: noteText,
    };
    const parsedPayload = checkoutPayloadSchema.parse(payload);
    checkoutMerch(parsedPayload);
  };
  const { data: shippingFee } = PublicShopApiHooks.useGetShippingFee({
    queries: {
      destination: playerAddress?.data?.district_id || tempAddress?.district_id || 0,
      weight: getCartQty() * 100,
    }
  }, {
    retry: false,
    enabled: !!playerAddress?.data?.district_id || !!tempAddress?.district_id
  });
  return (
    <LayoutWrapper className="grid grid-cols-12 gap-2 sm:gap-2 mt-4 sm:mt-8 min-h-[calc(100vh-300px)]">
      <Breadcrumb items={breadcrumbItems} className="col-span-12" />
      <div className="col-span-12 grid grid-cols-12 gap-4 sm:gap-8 min-h-[calc(100vh-300px)]">
        <FadeAnimation className="col-span-12 md:col-span-8 flex flex-col items-start gap-2">
          <div className="flex flex-col w-full">
            <div className="flex flex-col md:flex-row justify-between items-center w-full border-b border-emerald-800 inset-0">
              <div className="flex flex-row justify-center items-center uppercase text-emerald-800 text-xl font-semibold py-2">
                <IconLogoAlt className="w-16 h-14 mr-2" />Shopping<span className="font-bold">&nbsp;Cart</span>
              </div>
              <div className="hidden md:flex flex-row justify-center items-center">
                <div className="flex flex-col">
                  <span className="text-emerald-800 text-lg font-semibold">{getCartQty()} Item(s)</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col">
              {getCart().map((item, index) => (
                <div key={index} className="flex md:flex-row flex-col justify-between items-center w-full border-emerald-800 border-b border-opacity-20 py-4 h-fit">
                  <div className="flex flex-row w-full">
                    <div className="rounded-xl border md:w-32 md:h-32 w-24 h-24 aspect-square p-1 mr-2 md:mx-2" onClick={() => navigate(paths.shop.detail({ uuid: item.uuid }).$)}>
                      <img src={item.image_cover || ""} alt={item.name || ""} className="aspect-square rounded-md object-cover" />
                    </div>
                    <div className="text-start w-full flex flex-col justify-between md:justify-center">
                      <h3 className="md:text-lg text-sm font-semibold text-emerald-800 line-clamp-2 text-ellipsis pb-1">{item.name}</h3>
                      <div className="flex flex-col space-y-2 w-full">
                        {item.details.map((detail, idx) => (
                          <div key={idx} className="flex md:flex-row flex-col items-center w-full border rounded-lg px-2 py-1">
                            <div className="flex flex-row items-center justify-between w-full">
                              <div className="flex flex-col w-full justify-around h-full">
                                <p className="md:text-sm text-xs text-gray-500">Variant: {detail.size}</p>
                                <p className="md:text-sm text-xs text-gray-500 font-semibold">IDR {Intl.NumberFormat('id-ID').format(detail.price)}<span className="text-emerald-800 font-normal capitalize">/{item.unit}</span></p>
                              </div>
                              <div className="min-w-8 text-danger md:hidden flex flex-col text-center items-end justify-start cursor-pointer" onClick={() => removeFromCart(detail.uuid)}>
                                <Lucide icon="Trash" className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="md:hidden flex flex-row items-center justify-between w-full">
                              <InputQuantity product={item} productUuid={detail.uuid} size="sm" />
                              <div className="text-end font-semibold text-emerald-800 max-w-28 flex border-emerald-800">
                                <span className="text-[clamp(12px,_5vw,_14px)] whitespace-nowrap">IDR {Intl.NumberFormat('id-ID').format(detail.price * detail.qty)}</span>
                              </div>
                            </div>
                            <div className="!w-fit text-gray-800 capitalize hidden md:flex flex-col items-center justify-center text-xs">
                              <InputQuantity product={item} productUuid={detail.uuid} size="md" />
                            </div>
                            <div className="min-w-36 text-end font-semibold hidden md:block text-lg mr-2 text-emerald-800">
                              IDR {Intl.NumberFormat('id-ID').format(detail.price * detail.qty)}
                            </div>
                            <div className="min-w-8 text-danger md:flex hidden text-center items-center justify-center cursor-pointer" onClick={() => removeFromCart(detail.uuid)}>
                              <Lucide icon="Trash" className="w-4 h-4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeAnimation>
        <FadeAnimation className="col-span-12 md:col-span-4 flex flex-col items-start gap-4">
          {userInfo && <div className="flex flex-col bg-emerald-800 shadow-lg w-full rounded-2xl p-4">
            <div className="flex flex-row justify-between items-center w-full border-b border-gray-50 inset-0">
              <div className="flex flex-row justify-center items-center uppercase text-white text-xl font-semibold py-2">
                Point <span className="font-bold">&nbsp;Exchange</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-white text-sm py-2 mt-2">
              <div className="flex flex-row">
                <div className="flex flex-col text-[#EBCE56] justify-center items-center w-full py-1">
                  <span className="uppercase border border-[#EBCE56] px-2 py-0.5 rounded-lg mb-1">Current Point</span>
                  <span className="font-semibold">{Intl.NumberFormat('id-ID').format(getCartSubtotal())}</span>
                  <span className="font-semibold text-xs text-emerald-800">{Intl.NumberFormat('id-ID').format(getCartSubtotal())}</span>
                </div>
                <div className="flex flex-col justify-center items-center w-full py-1">
                  <span className="uppercase border border-white px-2 py-0.5 rounded-lg mb-1">Remaining Point</span>
                  <span className="font-semibold">{Intl.NumberFormat('id-ID').format(getCartSubtotal())}</span>
                  <span className={`font-semibold text-xs ${pointToUse.applied > 0 ? 'text-danger' : 'text-emerald-800'}`}>{Intl.NumberFormat('id-ID').format(getCartSubtotal() - pointToUse.applied)}</span>
                </div>
              </div>
              <span className="text-white">Point to use:</span>
              <div className="flex flex-row items-center w-full">
                <FormInput
                  type="text"
                  className="w-full text-emerald-800 disabled:bg-[#EBCE56]"
                  value={pointToUse.point}
                  disabled={pointToUse.applied > 0}
                  onChange={(e) => setPointToUse({ ...pointToUse, point: Number(e.target.value.replace(/[^0-9.]/g, '').replace(/^0+/, '') || '0') })}
                />
                {pointToUse.applied > 0 &&
                  <Button
                    variant="outline-success"
                    className="border-[#EBCE56] text-[#EBCE56] ml-2 disabled:opacity-50 !min-w-24"
                    type="button"
                    disabled={pointToUse.point > getCartSubtotal() || pointToUse.point < 1}
                    onClick={() => setPointToUse({ ...pointToUse, applied: 0 })}
                  >
                    Change
                  </Button>
                }
                {pointToUse.applied <= 0 &&
                  <Button
                    variant="outline-success"
                    className="border-white text-white ml-2 disabled:opacity-50 !min-w-24"
                    type="button"
                    disabled={pointToUse.point > getCartSubtotal() || pointToUse.point < 1}
                    onClick={() => setPointToUse({ ...pointToUse, applied: pointToUse.point })}
                  >
                    Apply
                  </Button>
                }
              </div>
            </div>
          </div>}
          <div className="flex flex-col bg-slate-200 shadow-lg w-full rounded-2xl p-4">
            <div className="flex flex-row justify-between items-center w-full border-b border-emerald-800 inset-0">
              <div className="flex flex-row justify-center items-center uppercase text-emerald-800 text-xl font-semibold py-2">
                Shipping <span className="font-bold">&nbsp;Address</span>
              </div>
            </div>
            <div className="flex flex-row justify-between  text-gray-500 text-sm py-2 mt-2">
              {(playerAddress?.data?.address || tempAddress?.address) ?
                <>
                  <div className="flex flex-col">
                    <span className="font-semibold">{playerAddress?.data?.receiver_name || tempAddress?.receiver_name} ({playerAddress?.data?.phone || tempAddress?.phone})</span>
                    <span>{playerAddress?.data?.address || tempAddress?.address}</span>
                    <span className="font-medium">{playerAddress?.data?.city || tempAddress?.city}, {playerAddress?.data?.province || tempAddress?.province}</span>
                  </div>
                  <div className="flex flex-col">
                    <Button
                      variant="outline-success"
                      className="border-emerald-800 text-emerald-800"
                      size="sm"
                      type="button"
                      onClick={() => !!userInfo ? setModalAddress(true) : setAskToLoginModal({ ...askToLoginModal, address: true })}
                    >
                      Change
                    </Button>
                  </div>
                </> :
                <div className="flex flex-col items-center justify-center w-full">
                  <Button
                    variant="primary"
                    className="bg-emerald-800 text-white"
                    size="sm"
                    type="button"
                    onClick={() => !!userInfo ? setModalAddress(true) : setAskToLoginModal({ ...askToLoginModal, address: true })}
                  >
                    Add New Address
                  </Button>
                </div>
              }
            </div>
          </div>
          <div className="flex flex-col bg-slate-200 shadow-lg w-full rounded-2xl p-4">
            <div className="flex flex-row justify-between items-center w-full border-b border-emerald-800 inset-0">
              <div className="flex flex-row justify-center items-center uppercase text-emerald-800 text-xl font-semibold py-2">
                Order <span className="font-bold">&nbsp;Summary</span>
              </div>
            </div>
            <div className="flex flex-col gap-2 text-gray-500 text-sm py-2 mt-2">
              <div className="flex flex-row justify-between items-center w-full">
                <span>Subtotal</span>
                <span className="font-semibold">IDR {Intl.NumberFormat('id-ID').format(getCartSubtotal())}</span>
              </div>
              <div className="flex flex-row justify-between items-center w-full">
                <span>Shipping</span>
                <span className="font-semibold">IDR {Intl.NumberFormat('id-ID').format(shippingFee?.data?.cost || 0)}</span>
              </div>
              <div className="flex flex-row justify-between items-center w-full">
                <span>Tax (11%)</span>
                <span className="font-semibold">IDR {Intl.NumberFormat('id-ID').format((getCartSubtotal() * 0.11))}</span>
              </div>
              {pointToUse.applied > 0 && <div className="flex flex-row justify-between items-center w-full">
                <span>Discount</span>
                <span className="font-semibold">IDR {Intl.NumberFormat('id-ID').format((pointToUse.applied * 100))}</span>
              </div>}
              <div className="flex flex-row justify-between border-t border-slate-300 items-center w-full pt-2 uppercase font-bold text-gray-700">
                <span>Total</span>
                <span>IDR {Intl.NumberFormat('id-ID').format((getCartSubtotal() * 1.11) + (shippingFee?.data?.cost || 0) - (pointToUse.applied * 100))}</span>
              </div>
              <div className="flex flex-row justify-between border-t border-slate-300 items-center w-full py-2 text-gray-700">
                <span>Payment Method</span>
                <div className="font-semibold items-center flex-row flex">
                  <Button
                    variant="outline-success"
                    className="border-emerald-800 text-emerald-800 mr-2"
                    size="sm"
                    type="button"
                    onClick={() => {
                      if (!userInfo) {
                        setAskToLoginModal({ ...askToLoginModal, paymentMethod: true })
                        return;
                      }
                      setPaymentMethod({ ...paymentMethod, open: true })
                    }}
                  >
                    Change
                  </Button>
                  {paymentMethodValue.find((item) => item.value === paymentMethod.selected)?.label}
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="primary"
            size="lg"
            type="button"
            className="w-full bg-emerald-800 rounded-xl shadow-lg"
            onClick={() => setModalProcess(true)}
          >
            Place Order
          </Button>
        </FadeAnimation>
        <Modal
          open={paymentMethod.open}
          onCancel={() => setPaymentMethod({ ...paymentMethod, open: false })}
          title="Payment Method"
          footer={null}
        >
          <div className="flex flex-col gap-2 mt-4">
            {paymentMethodValue.map((item) => (
              <div
                key={item.value}
                className="flex flex-row justify-between items-center w-full hover:bg-slate-200 cursor-pointer rounded-lg py-2 px-4"
                onClick={() => setPaymentMethod({ ...paymentMethod, selected: item.value, open: false })}
              >
                <div className="flex flex-row items-center">
                  <item.icon className="w-12 h-12 mr-2" />
                  <div className="font-semibold items-center flex-row flex">
                    {item.label}
                  </div>
                </div>
                <div className="font-semibold items-center flex-row flex">
                  <Radio key={JSON.stringify(paymentMethod.selected)} onClick={() => {
                    if (item.value === PaymentMethodEnum.COD) {
                      setAskToLoginModal({ ...askToLoginModal, cod: true })
                    } else {
                      setPaymentMethod({ ...paymentMethod, selected: item.value, open: false })
                    }
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Modal>

        <Modal
          open={modalAddress}
          onCancel={() => setModalAddress(false)}
          title="Delivery Address"
          className="!w-[100%] sm:!w-[90%] md:!w-[80%] lg:!w-[70%]"
          footer={null}
        >
          <ModalAddress address={!!playerAddress?.data ? playerAddress.data : undefined} onClose={() => setModalAddress(false)} />
        </Modal>

        <Modal
          open={askToLoginModal.address}
          onCancel={() => setAskToLoginModal({ ...askToLoginModal, address: false })}
          title="Change Shipping Address"
          footer={null}
        >
          <div className="flex flex-col gap-2 mt-4 items-center">
            <p>Please log in to set your primary address</p>
            <Link to={paths.login} className="w-1/2">
              <Button
                variant="primary"
                size="lg"
                type="button"
                className="w-full bg-emerald-800 rounded-xl shadow-lg text-sm font-bold h-10"
              >
                Login
              </Button>
            </Link>

            <Divider
              children={<span className="text-gray-500 text-xs relative">OR</span>}
              className="!my-0 !py-0"
            />
            <Button
              variant="secondary"
              size="lg"
              type="button"
              className="w-full rounded-xl shadow-lg text-sm font-bold max-w-1/2"
              onClick={() => {
                setAskToLoginModal({ ...askToLoginModal, address: false });
                setModalAddress(true);
              }}
            >
              Continue as Guest
            </Button>
          </div>
        </Modal>


        <Modal
          open={modalProcess}
          onCancel={() => setModalProcess(false)}
          title=""
          footer={null}
        >
          <div className="flex flex-col gap-2 mt-4 items-center">
            <IconLogoAlt className="w-20 h-20 text-emerald-800" />
            <p className="text-lg font-bold">Are you sure you want to submit this order?</p>
            {!userInfo && <p>After submit this order, you will receive an email to verify your order</p>}
            {!userInfo && <>
              <FormInput
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>}
            <div className="flex flex-row gap-2">
              <Button
                variant="secondary"
                size="lg"
                type="button"
                className="w-full rounded-xl shadow-lg text-sm font-bold"
                onClick={() => {
                  setModalProcess(false)
                }}
              >
                Cancel
              </Button>

              <Button
                variant="primary"
                size="lg"
                type="button"
                disabled={!userInfo && !isValidEmail(email)}
                className="w-full bg-emerald-800 rounded-xl whitespace-nowrap shadow-lg text-sm font-bold h-10"
                onClick={() => {
                  submitOrder();
                }}
              >
                Submit Order
              </Button>
            </div>
          </div>
        </Modal>
        <Modal
          open={askToLoginModal.paymentMethod}
          onCancel={() => setAskToLoginModal({ ...askToLoginModal, paymentMethod: false })}
          title=""
          footer={null}
        >
          <div className="flex flex-col gap-2 mt-4 items-center">
            <IconLogoAlt className="w-20 h-20 text-emerald-800" />
            <p className="text-lg font-bold">Sorry, You can't change payment method</p>
            {!userInfo && <p className="text-center">For non-members can only use QRIS payment method. Please login to continue, you will be redirected to login page</p>}
            <div className="flex flex-row gap-2 mt-2">
              <Button
                variant="primary"
                size="lg"
                type="button"
                className="w-full bg-emerald-800 rounded-xl whitespace-nowrap shadow-lg text-sm font-bold h-10"
                onClick={() => {
                  setAskToLoginModal({ ...askToLoginModal, paymentMethod: false });
                  navigate(paths.login);
                }}
              >
                Login
              </Button>
              <Button
                variant="secondary"
                size="lg"
                type="button"
                className="w-full rounded-xl shadow-lg text-sm font-bold"
                onClick={() => {
                  setAskToLoginModal({ ...askToLoginModal, paymentMethod: false });
                }}
              >
                Okay
              </Button>
            </div>
          </div>
        </Modal>
        <Modal
          open={askToLoginModal.cod}
          onCancel={() => setAskToLoginModal({ ...askToLoginModal, cod: false })}
          title=""
          footer={null}
        >
          <div className="flex flex-col gap-2 mt-4 items-center">
            <IconLogoAlt className="w-20 h-20 text-emerald-800" />
            <p className="text-lg font-bold">You need to add notes for COD payment method</p>
            {/* cod usually locatated on PDAM Ngagel */}
            {userInfo && <p className="text-center">Cash on delivery (COD) usually located around PDAM Ngagel or you can contact our support for more information</p>}
            <Button
              variant="outline-pending"
              size="lg"
              type="button"
              className="w-fit rounded-xl shadow-lg text-sm font-bold group my-2"
              onClick={() => {
                window.open("https://wa.me/6285158519277", "_blank");
              }}
            >
              <Lucide icon="MessagesSquare" className="w-4 h-4 mr-2 " />
              <span className="group-hover:hidden visible">Contact Our Support</span>
              <span className="group-hover:flex hidden">+62 851-5851-9277</span>
            </Button>
            <div className="w-full">
              <FormTextarea
                key={`${paymentMethod.selected}-${askToLoginModal.cod}-modal`}
                rows={2}
                placeholder="Add notes"
                value={noteText}
                onChange={(e) => {
                  setNoteText(e.target.value);
                }}
              />
            </div>
            <div className="flex flex-row gap-2 mt-2">
              <Button
                variant="secondary"
                size="lg"
                type="button"
                className="w-full rounded-xl shadow-lg text-sm font-bold"
                onClick={() => {
                  setAskToLoginModal({ ...askToLoginModal, cod: false });
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={!noteText}
                size="lg"
                type="button"
                className="w-full bg-emerald-800 rounded-xl whitespace-nowrap shadow-lg text-sm font-bold h-10"
                onClick={() => {
                  setAskToLoginModal({ ...askToLoginModal, cod: false });
                  setPaymentMethod({ ...paymentMethod, selected: PaymentMethodEnum.COD });
                }}
              >
                I Understand
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </LayoutWrapper>
  );
};