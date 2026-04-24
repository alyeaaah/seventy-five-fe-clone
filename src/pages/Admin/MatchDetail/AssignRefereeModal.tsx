import { useState } from "react";
import { Modal, AutoComplete, Table } from "antd";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { PlayerHomeApiHooks } from "@/pages/Players/Home/api";
import { PlayerMatchApiHooks } from "@/pages/Players/Matches/api";
import Image from "@/components/Image";

interface AssignRefereeModalProps {
  open: boolean;
  onClose: () => void;
  onAssign: (refereeUuid: string) => void;
  matchUuid: string;
}

export const AssignRefereeModal = ({ open, onClose, onAssign, matchUuid }: AssignRefereeModalProps) => {
  const [selectedReferee, setSelectedReferee] = useState("");
  const [searchText, setSearchText] = useState("");

  const { data: playersData } = PlayerHomeApiHooks.useGetPlayersDropdown({
    queries: {
      keyword: searchText
    }
  });

  const { data: assignedRefereesData } = PlayerMatchApiHooks.useGetPlayerRefereeMatches({
    queries: {
      player_uuid: "", // This endpoint expects player_uuid, but we want all referees for this match
      match_uuid: matchUuid
    }
  });

  const handleAssign = () => {
    if (selectedReferee) {
      onAssign(selectedReferee);
      setSelectedReferee("");
      setSearchText("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedReferee("");
    setSearchText("");
    onClose();
  };

  const referees = playersData?.data || [];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      width={600}
      footer={null}
      maskClosable={false}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Lucide icon="Users" className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Assign Referee</h2>
        </div>

        <p className="text-gray-600">
          Select a player to assign as referee for this match
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Referee
          </label>
          <AutoComplete
            className="shadow-sm w-full h-[38px]"
            suffixIcon={<Lucide icon="Search" />}
            value={searchText}
            options={referees?.map((player: any) => {
              const isDisabled = selectedReferee === player.uuid;

              return {
                value: player.uuid,
                label: (
                  <div className={`flex flex-row justify-between ${isDisabled ? 'opacity-50' : ''}`}>
                    <div className="flex items-center flex-row">
                      <Image src={player.media_url || ""} alt={player.name} className="w-6 h-6 rounded-full mr-2" />
                      <span className="flex flex-col">
                        <span className="mb-0">
                          {player.name}
                          {player.nickname && (
                            <span className="text-gray-400 text-[12px] font-medium italic"> {player.nickname}</span>
                          )}
                        </span>
                        {player.username && (
                          <span className="text-gray-400 text-[11px] mt-0">{player.username}</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center flex-row">
                      {isDisabled ? (
                        <div className="text-[10px] text-gray-500">Selected</div>
                      ) : (
                        <Lucide icon="Plus" className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                ),
                name: player.name,
                nickname: player.nickname,
                username: player.username,
                media_url: player.media_url,
                disabled: isDisabled
              };
            })}
            onSelect={(value) => {
              setSelectedReferee(value as string);
              const selectedPlayer = referees?.find(p => p.uuid === value);
              if (selectedPlayer) {
                setSearchText(selectedPlayer.name);
              }
            }}
            onSearch={(text) => {
              setSearchText(text);
            }}
            placeholder="Search for referee to assign"
            filterOption={false}
          />
        </div>

        {assignedRefereesData?.data && assignedRefereesData.data.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Currently Assigned Referees</h3>
            <Table
              dataSource={assignedRefereesData.data}
              rowKey="uuid"
              pagination={false}
              size="small"
              columns={[
                {
                  title: "Referee",
                  dataIndex: "player",
                  render: (player: any) => (
                    <div className="flex items-center">
                      <Image src={player.media_url || ""} alt={player.name} className="w-6 h-6 rounded-full mr-2" />
                      <span>{player.name}</span>
                    </div>
                  ),
                },
                {
                  title: "Status",
                  dataIndex: "status",
                  render: (status: string) => (
                    <span className={`px-2 py-1 rounded text-xs ${status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                      {status}
                    </span>
                  ),
                },
                {
                  title: "Assigned Date",
                  dataIndex: "createdAt",
                  render: (date: string) => new Date(date).toLocaleDateString(),
                },
              ]}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleAssign}
            disabled={!selectedReferee}
          >
            Assign Referee
          </Button>
        </div>
      </div>
    </Modal>
  );
};
