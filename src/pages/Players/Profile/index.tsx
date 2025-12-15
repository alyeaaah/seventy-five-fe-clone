import { PlayerProfileApiHooks } from "./api";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import { Divider, Modal } from "antd";
import Lucide from "@/components/Base/Lucide";
import { IconLogoAlt } from "@/assets/images/icons";
import moment from "moment";
import Button from "@/components/Base/Button";
import { PlayerHomeApiHooks } from "../Home/api";
import { useState } from "react";
import { PublicPlayer } from "@/pages/Public/Player";
import { getZodiac } from "@/utils/helper";
import { ModalBirthDate } from "./components/ModalBirthDate";
import { ModalContact } from "./components/ModalContact";
import { ModalAddressProfile } from "./components/ModalAddressProfile";
import { ProfileForm } from "../Components/ProfileForm";

export const PlayerProfile = () => {
  const userData = useAtomValue(userAtom);
  const { data } = PlayerHomeApiHooks.useGetPlayersDetail({
    params: {
      uuid: userData?.uuid as string
    }
  });
  const [modal, setModal] = useState({
    edit: false,
    birthdate: false,
    contact: false,
    address: false
  });
  const getAge = (birthdate: string) => {
    const birth = moment(birthdate);
    const now = moment();
    const years = now.diff(birth, 'year');
    const months = now.diff(birth.add(years, 'years'), 'months');
    return { years, months };
  }
  const { data: galleryData } = PlayerProfileApiHooks.useGetPlayerGallery({
    queries: {
      page: 1,
      limit: 20
    } 
  });
  return (
    <div className="w-full py-0 grid grid-cols-12 gap-4">
      <div className="col-span-12">
        <PublicPlayer
          isPreview
          subHeaderContent={
            <div className="flex flex-col -mb-6">
              <div className="flex flex-col rounded-2xl p-4 mt-2 bg-slate-200">
                <div className="text-sm font-bold">Personal Information</div>
                <div className="text-xs text-gray-500">Only you can see your private personal information shown here. It won’t be displayed on your public profile..</div>
                <Divider className="my-2" />
                <div className="flex flex-col lg:flex-row items-center gap-4">
                  <div className="flex flex-row items-center lg:w-fit w-full bg-[#BE453D] px-4 py-2 rounded-xl text-white">
                    <Lucide icon="CalendarDays" className="h-6 w-6 " />
                    <div className="flex flex-col ml-2">
                      <div className=" font-medium capitalize text-[#EBCE56]">Birthdate</div>
                      <div className="text-sm capitalize">{data?.data?.placeOfBirth}, {moment(data?.data?.dateOfBirth).format('DD MMMM YYYY')}</div>
                      <div className="text-xs capitalize">{getZodiac(data?.data?.dateOfBirth || '').symbol} {getZodiac(data?.data?.dateOfBirth || '').sign}</div>
                    </div>
                    <Button size="sm" className="ml-2" onClick={() => setModal({ ...modal, birthdate: true })}>
                      <Lucide icon="Pencil" className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-row items-center lg:w-fit w-full bg-[#BE453D] px-4 py-2 rounded-xl text-white">
                    <Lucide icon="PhoneCall" className="h-6 w-6" />
                    <div className="flex flex-col ml-2">
                      <div className=" font-medium capitalize text-[#EBCE56]">Contact</div>
                      <div className="text-xs capitalize">{data?.data?.phone}</div>
                      <div className="text-xs">{data?.data?.email}</div>
                    </div>
                    <Button size="sm" className="ml-2" onClick={() => setModal({ ...modal, contact: true })}>
                      <Lucide icon="Pencil" className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-row items-center lg:w-fit w-full bg-[#BE453D] px-4 py-2 rounded-xl text-white">
                    <div className="flex flex-row items-center">
                      <Lucide icon="MapPin" className="h-6 w-6" />
                      <div className="flex flex-col ml-2">
                        <div className="text-xs font-medium capitalize text-[#EBCE56]">Address</div>
                        <div className="text-xs text-white">{data?.data?.address}</div>
                        <div className="text-xs text-white">{data?.data?.city}</div>
                      </div>
                      <Button size="sm" className="ml-2" onClick={() => setModal({ ...modal, address: true })}>
                        <Lucide icon="Pencil" className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-row justify-between items-center rounded-xl p-3 mt-2 bg-[#EBCE56] text-emerald-800">
                <div className="text-sm font-bold flex flex-row items-center">
                  <IconLogoAlt className="w-12 h-6 mr-2" /> Profile Preview
                </div>
                <Button size="sm" className="ml-2 border-emerald-800 text-emerald-800 m-0" onClick={() => setModal({ ...modal, edit: true })}>
                  <Lucide icon="Pencil" className="h-4 w-4 mr-2" />
                  Edit profile
                </Button>
                
              </div>
            </div>
          }
        />
      </div>
      <Modal
        open={modal.birthdate}
        onCancel={() => setModal({ ...modal, birthdate: false })}
        title="Edit Birthdate"
        footer={null}
      >
        <ModalBirthDate key={JSON.stringify(modal.birthdate)+data?.data?.dateOfBirth+ data?.data?.placeOfBirth} onClose={() => setModal({ ...modal, birthdate: false })} data={data?.data} />
      </Modal>
      <Modal
        open={modal.contact}
        onCancel={() => setModal({ ...modal, contact: false })}
        title="Edit Contact"
        footer={null}
      >
        <ModalContact key={JSON.stringify(modal.contact)+data?.data?.phone+ data?.data?.email} onClose={() => setModal({ ...modal, contact: false })} data={data?.data} />
      </Modal>
      <Modal
        open={modal.address}
        onCancel={() => setModal({ ...modal, address: false })}
        title="Edit Address"
        footer={null}
      >
        <ModalAddressProfile key={JSON.stringify(modal.address)+data?.data?.address+ data?.data?.city} onClose={() => setModal({ ...modal, address: false })} data={data?.data} />
      </Modal>

      <Modal
        classNames={{body: "rounded-xl bg-gray-50 border"}}
        title={
          <div className="flex flex-row items-center w-full !text-gray-800 border-b pb-3">
            {/* <IconLogoAlt className="w-16 h-10 mr-3" /> */}
            <div className="flex flex-col items-start justify-center">
              <div className=" text-lg">Edit Profile</div>
              <p className="text-xs font-normal text-gray-500">Edit your profile information here</p>
            </div>
          </div>
        }
        open={modal.edit}
        closeIcon={false}
        width={"80%"}
        height={"100%"}
        onCancel={() => setModal({ ...modal, edit: false })}
        footer={null}
      >
        <ProfileForm open={modal.edit} onClose={() => setModal({ ...modal, edit: false })} />
      </Modal>
    </div>
  );
}

