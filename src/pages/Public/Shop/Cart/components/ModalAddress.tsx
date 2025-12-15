import { PlayerAddress, PlayerAddressPayload, playerAddressSchema } from "@/pages/Admin/Players/api/schema";
import { HTMLProps } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { playerAddressPayloadSchema } from "@/pages/Admin/Players/api/schema";
import { PlayerProfileApiHooks } from "@/pages/Players/Profile/api";
import { useAtomValue, useSetAtom } from "jotai";
import { tempAddressAtom, userAtom } from "@/utils/store";
import { queryClient } from "@/utils/react-query";
import { FormProvider } from "react-hook-form";
import { FormHelp, FormInput, FormLabel, FormSelect, FormTextarea } from "@/components/Base/Form";
import Button from "@/components/Base/Button";
import { PublicShopApiHooks } from "@/pages/Public/Shop/api";
import clsx from "clsx";
import CustomMap from "@/components/CustomMap";
import { mapCenter } from "@/utils/faker";
import { Divider } from "antd";

interface ModalAddressProps extends HTMLProps<HTMLDivElement> {
  address?: PlayerAddress;
  onClose: () => void;
}
export const ModalAddress = ({ address, onClose }: ModalAddressProps) => {
  const userInfo = useAtomValue(userAtom);
  const tempAddress = useAtomValue(tempAddressAtom);
  const setTempAddress = useSetAtom(tempAddressAtom);

  const { mutate: updateAddress } = PlayerProfileApiHooks.useUpdatePlayerAddress({}, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PlayerProfileApiHooks.getKeyByAlias("getPlayerAddress"),
      });
      onClose();
    }
  });
  
  const methods = useForm({
    mode: "onChange",
    defaultValues: userInfo && address?.address ? {...address} :
    tempAddress ? {...tempAddress} :
    {
      receiver_name: "",
      phone: "",
      address: "",
      city_id: undefined,
      city: "",
      district_id: undefined,
      district: "",
      province_id: undefined,
      province: "",
      note: "",
      lat: "",
      long: ""
    },
    resolver: zodResolver(playerAddressPayloadSchema),
  });
  const { control, formState, handleSubmit, setValue, watch, getValues } = methods;
  const submitHandler: SubmitHandler<any> = (data: PlayerAddressPayload) => {
    if (userInfo) {
      updateAddress(data);
    } else {
      setTempAddress(data);
      onClose();
    }
  }
  const { data: provinceList } = PublicShopApiHooks.useGetProvinceList();
  const { data: cityList } = PublicShopApiHooks.useGetCityList({
    queries: {
      province_id: watch("province_id") || undefined
    }
  }, {
    enabled: !!watch("province_id")
  });
  const { data: districtList } = PublicShopApiHooks.useGetDistrictList({
    queries: {
      city_id: watch("city_id") || undefined
    }
  }, {
    enabled: !!watch("city_id")
  });
  return (
    <div className="w-full">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="w-full grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-6">
              <FormLabel htmlFor="receiver_name" className="mb-1">Receiver Name</FormLabel>
              <Controller
                name="receiver_name"
                control={control}
                render={({ field, fieldState }) => 
                  <FormInput
                    onChange={(e) => {
                      field.onChange(e);
                      setValue("receiver_name", e.target.value);
                    }}
                    id="receiver_name"
                    value={field.value}
                    placeholder="Receiver Name"
                  />
                }
              />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <FormLabel htmlFor="phone" className="mb-1">Phone</FormLabel>
              <Controller
                name="phone"
                control={control}
                render={({ field, fieldState }) => 
                  <FormInput
                    onChange={field.onChange}
                    id="phone"
                    value={field.value}
                    placeholder="Phone Number"
                  />
                }
              />
            </div>
            <div className="col-span-12">
              <FormLabel htmlFor="address" className="mb-1">Address</FormLabel>
              <Controller
                name="address"
                control={control}
                render={({ field, fieldState }) => 
                  <FormInput
                    onChange={field.onChange}
                    id="address"
                    value={field.value}
                    multiple={true}
                    placeholder="Address"
                  />
                }
              />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <FormLabel htmlFor="province_id" className="mb-1">Province</FormLabel>
              <Controller
                name="province_id"
                control={control}
                render={({ field, fieldState }) =>
                  <>
                    <FormSelect
                      id="province_id"
                      name={`province_id`}
                      value={field.value || undefined}
                      className={clsx({
                        "border-danger": !!fieldState.error,
                      })}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        setValue("province", provinceList?.data.find((province) => province.id === Number(e.target.value))?.name);
                        setValue("city_id", undefined);
                        setValue("district_id", undefined);
                        setValue("city", "");
                        setValue("district", "");
                      }}
                    >
                      <option value={undefined}>
                        Select Province
                      </option>
                      {provinceList?.data.map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.name}
                        </option>
                      ))}
                    </FormSelect>
                    {!!fieldState.error && (
                      <FormHelp className={"text-danger"}>
                        {fieldState.error.message || "Form is not valid"}
                      </FormHelp>
                    )}
                  </>
                }
              />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <FormLabel htmlFor="city_id" className="mb-1">City</FormLabel>
              <Controller
                name="city_id"
                control={control}
                render={({ field, fieldState }) =>
                  <>
                    <FormSelect
                      id="city_id"
                      name={`city_id`}
                      value={field.value || undefined}
                      disabled={!watch("province_id")}
                      className={clsx({
                        "border-danger": !!fieldState.error,
                      })}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        setValue("city", cityList?.data.find((city) => city.id === Number(e.target.value))?.name);
                        setValue("district_id", undefined);
                        setValue("district", "");
                      }}
                    >
                      <option value={undefined}>
                        Select City
                      </option>
                      {cityList?.data.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </FormSelect>
                    {!!fieldState.error && (
                      <FormHelp className={"text-danger"}>
                        {fieldState.error.message || "Form is not valid"}
                      </FormHelp>
                    )}
                  </>
                }
              />
            </div>
            <div className="col-span-12 lg:col-span-4">
              <FormLabel htmlFor="district_id" className="mb-1">District</FormLabel>
              <Controller
                name="district_id"
                control={control}
                render={({ field, fieldState }) =>
                  <>
                    <FormSelect
                      id="district_id"
                      disabled={!watch("city_id")}
                      name={`district_id`}
                      value={field.value || undefined}
                      className={clsx({
                        "border-danger": !!fieldState.error,
                      })}
                      onChange={(e) => {
                        field.onChange(Number(e.target.value));
                        setValue("district", districtList?.data.find((district) => district.id === Number(e.target.value))?.name);
                      }}
                    >
                      <option value={undefined}>
                        Select District
                      </option>
                      {districtList?.data.map((district) => (
                        <option key={district.id} value={district.id}>
                          {district.name}
                        </option>
                      ))}
                    </FormSelect>
                    {!!fieldState.error && (
                      <FormHelp className={"text-danger"}>
                        {fieldState.error.message || "Form is not valid"}
                      </FormHelp>
                    )}
                  </>
                }
              />
            </div>

            <div className="col-span-12 lg:col-span-6">
              <FormLabel htmlFor="address" className="mb-1">Map Location</FormLabel>
              <div className="h-72">
                <CustomMap
                  onUseLocationText="Replace Address"
                  onUseLocation={(e, address) => {
                    setValue("address", address);
                  }}
                  popupText="Click to set location"
                  key={location.pathname + "_map"} // Reset on route change
                  mapProps={address ? {
                    center: [Number(address?.lat || mapCenter.lat), Number(address?.long || mapCenter.lng)],
                  } : {
                    center: [mapCenter.lat, mapCenter.lng],
                  }}
                  onChange={(e, address) => {
                    setValue("lat", e.lat.toString());
                    setValue("long", e.lng.toString());
                  }}
                />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-6">
              <FormLabel htmlFor="receiver_name" className="mb-1">Note:</FormLabel>
              <Controller
                name="note"
                control={control}
                render={({ field, fieldState }) =>
                  <>
                    <FormTextarea
                      rows={2}
                      id="validation-form-6"
                      value={field.value || undefined}
                      name="note"
                      className={clsx({
                        "border-danger": !!fieldState.error,
                      })}
                      onChange={field.onChange}
                      placeholder="Note"
                    ></FormTextarea>
                    {!!fieldState.error && (
                      <FormHelp className={"text-danger"}>
                        {fieldState.error.message || "Form is not valid"}
                      </FormHelp>
                    )}
                  </>
                }
              />
            </div>
          </div>
          <Divider />
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline-primary" onClick={() => {
              console.log(
                playerAddressPayloadSchema.parse(getValues())
              );
            }} className="border-emerald-800 text-emerald-800">tester</Button>
            <Button type="button" variant="outline-primary" onClick={() => onClose()} className="border-emerald-800 text-emerald-800">Cancel</Button>
            <Button type="submit"
              variant="primary"
              className="bg-emerald-800 !min-w-24"
              disabled={formState.isSubmitting || formState.isValid === false}
            >Save</Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};