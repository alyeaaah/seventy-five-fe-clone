import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { PlayersApiHooks } from "@/pages/Admin/Players/api";
import { imageResizer } from "@/utils/helper";
import { AutoComplete } from "antd";
import Input from "antd/es/input/Input";
import Modal from "antd/es/modal/Modal";
import Image from "next/image";
import React, { useRef, useState } from "react";

export interface ImageTag {
  x: number; // percentage position
  y: number; // percentage position
  value?: string;
  label: string;
  isDeleted?: boolean;
}

interface TaggableImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  tags?: ImageTag[];
  onTagChange?: (tag: ImageTag[]) => void;
  onTagsSubmit?: (tag: ImageTag[]) => void;
  editable?: boolean;
  className?: string;
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement>;
}

export default function TaggableImage(props: TaggableImageProps) {
  const {
    src,
    tags,
    onTagChange,
    onTagsSubmit,
    editable,
    className,
    imgProps = {}, // default to empty object
    ...divProps // props for the wrapper div
  } = props;

  const [showTags, setShowTags] = useState(false);
  const [editableTag, setEditableTag] = useState(false);
  const [currentTags, setCurrentTags] = useState<ImageTag[]>(tags || []);
  const [tagForm, setTagForm] = useState({
    open: false,
    label: '',
    valid: false,
    value: '',
    x: 0,
    y: 0
  });

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!!editableTag && !tagForm.open){
      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setTagForm({ open: true, label: '', valid: false, value: '', x, y });
    }
    if (!editableTag && !tagForm.open) {
      setShowTags(!showTags);
    }
  };

  const submitTags = () => {
    onTagsSubmit?.(currentTags);
  };

  const { imgRef, ...safeImgProps } = imgProps as any; 

    const { data: playerData } = PlayersApiHooks.useGetPlayersList(
      {
        queries: {
          search: tagForm.label,
          limit: 10,
          page: 1
        }
      }, {
    });
  return (
    <div
      {...divProps}
      className={`relative`}
      onClick={handleClick}
      style={{ cursor: editableTag ? "crosshair" : "default" }}
    >
      <img
        src={src}
        alt={safeImgProps.alt ?? "Taggable"}
        className={`max-w-full h-full ${safeImgProps.className ?? ""}`}
      />

      {(showTags || editableTag) &&
        currentTags?.filter(tag => !tag.isDeleted).map((tag, i) => (
          <div
            key={i}
            className="absolute bg-gray-800 text-white text-xs px-1 py-0.5 rounded-md opacity-80 whitespace-nowrap flex flex-row gap-1"
            style={{
              top: `${tag.y}%`,
              left: `${tag.x}%`,
              transform: "translate(-50%, 50%)",
              whiteSpace: "nowrap",
            }}
          >
            <div className="absolute rotate-45 left-[calc(50%-2px)] -top-1 w-2 h-2 bg-gray-800 z-[-1]"></div>
              {tag.label} 
              {editableTag && <Lucide
                icon="X"
                className="w-4 h-4 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentTags(currentTags.map(t => t.value === tag.value ? { ...t, isDeleted: true } : t))
                }} />}
            </div>
          ))}
      
      {editable && <div className="absolute bottom-2 flex flex-row gap-2 right-[50%] translate-x-1/2 z-[1]">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setEditableTag(!editableTag);
            if (editableTag) {
              setCurrentTags(tags || []);
            }
          }}
          variant={editableTag ? "warning" : "primary"}
          size="sm"
        >
          {editableTag ? "Cancel" : "Edit Tag"}
        </Button>
        {editableTag && <Button
          onClick={(e) => {
            e.stopPropagation();
            submitTags();
            setEditableTag(false);
          }}
          variant="primary"
          size="sm"
        >
          Save Tags
        </Button>}
      </div>}
      <Modal
        open={tagForm.open}
        onCancel={() => setTagForm({ open: false, label: '', valid: false, value: '', x: 0, y: 0 })}
        closeIcon={false}
        footer={
          <div className="flex flex-row justify-end">
            <Button
              onClick={() => {
                setTagForm({ open: false, label: '', valid: false, value: '', x: 0, y: 0 });
                setCurrentTags([...currentTags.filter(t => t.value !== tagForm.value), { label: tagForm.label, value: tagForm.value, x: tagForm.x, y: tagForm.y }]);
              }}
              variant="primary"
              disabled={!tagForm.valid}
              size="sm"
            >
              Add Tags
            </Button>
          </div>
        }
      >
        <AutoComplete
          className="shadow-sm w-full h-[38px]"
          suffixIcon={tagForm.valid ? <Lucide icon="Check" className="text-green-500"/> : <Lucide icon="Search" />}
          value={tagForm.label}
          options={playerData?.data?.map(player => {
            return {
              value: player.uuid,
              label: (
                <div className={`flex flex-row justify-between`}>
                  <div className="flex items-center flex-row">
                    <img src={imageResizer(player.media_url || "", 50)} alt={player.name} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2" />
                    <span className="flex flex-col">
                      <span className="mb-0">
                        {player.name}
                        <span className="text-gray-400 text-[12px] font-medium italic"> {player.nickname}</span>
                      </span>
                      <span className="text-gray-400 text-[11px] mt-0 sm:flex hidden">{player.city} | {player.level} </span>
                    </span>
                  </div>
                  <div className=" hidden sm:flex items-center flex-row">
                    <Lucide icon="Plus" className="w-4 h-4" />
                  </div>
                </div>
              ),
              name: player.name,
              media_url: player.media_url,
            };
          })}
          onSelect={(value, option) => {
            setTagForm({...tagForm, label: option.name, value: value, valid: true });
          }}
          onSearch={(text) => {
            setTagForm({ ...tagForm, label: text, valid: false });
          }}
          onChange={(text) => {
            console.log("onChange", text);
            setTagForm({ ...tagForm, label: text, valid: false });
          }}
          placeholder="Search for player to add"
        />
      </Modal>  
    </div>
  );
}
