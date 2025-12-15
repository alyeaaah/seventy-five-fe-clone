import Upload, { UploadProps } from "antd/es/upload/Upload";
import Lucide from "@/components/Base/Lucide";
import LoadingIcon from "../Base/LoadingIcon";
import { useState } from "react";
import { Image, UploadFile } from "antd";
import styles from "./uploadDropzone.module.scss";
import Button from "../Base/Button";
import { UploadChangeParam } from "antd/es/upload";

interface UploadBaseProps
  extends Omit<
    UploadProps,
    | "action"
    | "beforeUpload"
    | "customRequest"
    | "data"
    | "directory"
    | "headers"
    | "method"
    | "withCredentials"
    | "onDownload"
    | "onPreview"
    | "onRemove"
    | "previewFile"
    | "fileList"
    | "onRemove"
    | "index"
    | "onChange"
  > {
  loading?: boolean;
  uploadType?: "image" | "document";
  uploadIcon?: React.ReactNode;
  uploadedIcon?: React.ReactNode;
  onRemove?: () => void;
  onChange?: (file: UploadChangeParam, index: number) => void;
  fileList: string[];
  index: number;
  "data-testid"?: string;
}

const UploadDropzone = (props: UploadBaseProps) => {
  const { loading, fileList, uploadIcon, uploadType } = props;
  const [uploadedFile, setUploadedFile] = useState<UploadFile | undefined>();
  const renderIcon = () => {
    if (loading) {
      return <LoadingIcon icon="grid" className="w-8 h-8 mb-2" />
    } else if (!fileList?.length) {
      if (uploadIcon) {
        return uploadIcon
      }
      if (uploadType == "document") {
        return <Lucide icon="FilePlus" className="w-10 h-10 mb-2" />
      }
      return <Lucide icon="ImagePlus" className="w-10 h-10 mb-2" />
    }
  }
  const renderUploadButton = () => {
    return (
      <div className="w-full h-full bg-emerald-50 rounded-lg flex flex-col justify-center items-center text-emerald-800 hover:cursor-pointer focus:bg-emerald-100">
        {renderIcon()}
        {!loading && <div className="text-center pl-4 pr-4 text-xs">Drop {uploadType == "image" ? "image" : "file"} here or click to upload.</div>}
        {!!loading && <div className="text-center pl-4 pr-4 text-xs">Uploading...</div>}
      </div>
    );
  }

  return (
    <>
      <div className={`w-full h-36 border-dashed overflow-hidden border-emerald-100 border-2 rounded-lg flex justify-stretch items-stretch ${!!fileList?.length ?'hover:border-rose-300' : 'hover:border-emerald-300'}`}>
        {(!fileList || fileList.length === 0) && (
          <Upload
            {...props}
            multiple={props?.multiple || false}
            style={{
              width: "100%",
              height:"100%"
            }}
            showUploadList={props?.showUploadList || false}
            listType="picture-card"
            beforeUpload={() => false}
            disabled={loading}
            fileList={fileList?.map((url) => ({
              uid: url,
              name: url.split("/").pop() ?? "",
              status: "done",
              url,
            }))}
            onChange={(file) => props.onChange?.(file, props?.index || 0)}
            className={`${styles.uploadDropzone} w-full h-full`}
          >
            <div className="h-full w-full">
              {renderUploadButton()}
              </div>
          </Upload>
        )}

        {!!fileList?.length && fileList.length > 0 && (
          <div className="w-full h-full relative">
            {props.onRemove && <Button variant="danger" type="button" className="absolute z-10 right-2 top-2" onClick={props.onRemove}>
              <Lucide icon="Trash" className="w-4 h-4" />
            </Button>}
            <Image src={fileList[0]} width={"100%"} height={"100%"} className="object-cover" />
          </div>
        )}
      </div>
    </>
  );
};

export default UploadDropzone;