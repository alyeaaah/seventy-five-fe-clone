import React, { useState } from "react";
import { Form, Input, Select, Modal, AutoComplete } from "antd";
import { TournamentsApiHooks } from "../api";
import { queryClient } from "@/utils/react-query";
import { PlayerHomeApiHooks } from "@/pages/Players/Home/api";
import Image from "@/components/Image";
import Lucide from "@/components/Base/Lucide";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/components/Toast/ToastContext";
import Button from "@/components/Base/Button";

interface ModalAddPlayerProps {
  tournamentUuid: string;
  open: boolean;
  onClose: () => void;
}

const playerFormSchema = z.object({
  player_uuids: z.array(z.string().min(1, "Player UUID is required")).min(1, "Exactly 1 players are required").max(1, "Exactly 1 players are required"),
  status: z.enum(['REQUESTED', 'APPROVED', 'CONFIRMED', 'REJECTED']).default('REQUESTED')
})

type PlayerFormData = z.infer<typeof playerFormSchema>;

export const ModalAddPlayer: React.FC<ModalAddPlayerProps> = ({
  tournamentUuid,

  open,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [player1Keyword, setPlayer1Keyword] = useState("");
  const { showNotification } = useToast();

  const { control, handleSubmit, formState: { errors, isValid }, setValue, reset, watch } = useForm<PlayerFormData>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      player_uuids: [''],
      status: undefined
    }
  });
  const { data: registeredPlayersData } = TournamentsApiHooks.useGetTournamentTeamParticipants({
    params: {
      tournamentUuid: tournamentUuid || ""
    },
    queries: {
      status: "approved,confirmed,requested",
    }
  }, {
    enabled: !!tournamentUuid
  });
  const playerIsRegistered = (playerUuid: string) => {
    return registeredPlayersData?.data?.teams?.some((team) =>
      team.players.some((player) => player.player_uuid === playerUuid)
    );
  };
  // Get players data for autocomplete
  const { data: playerData1 } = PlayerHomeApiHooks.useGetPlayersDropdown({
    queries: {
      keyword: player1Keyword,
      tournamentUuid: tournamentUuid
    }
  });


  // Create team mutation using new add team endpoint
  const { mutate: actionAddTournamentPlayer } = TournamentsApiHooks.useAddTournamentTeam({
    params: {
      uuid: tournamentUuid || ""
    }
  }, {
    onSuccess: (data: any, variables: any, context: any) => {
      queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentTeamParticipants") });
      queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentParticipants") });
      queryClient.invalidateQueries({ queryKey: TournamentsApiHooks.getKeyByAlias("getTournamentTeams") });
      handleClose();
      showNotification({
        text: "Player created successfully",
        duration: 5000,
        icon: "CheckCircle"
      });
    },
    onError: (error: any) => {
      console.error("Error creating team:", error?.message);
      showNotification({
        text: `Failed to create team ${error?.message || ""}`,
        duration: 5000,
        icon: "MessageCircleWarning"
      });
    }
  });

  const handleClose = () => {
    setPlayer1Keyword("");
    reset();
    onClose();
  };

  const onSubmit = async (values: PlayerFormData) => {
    setLoading(true);
    try {
      await actionAddTournamentPlayer({
        player_uuids: values.player_uuids,
        status: values.status as any
      });
    } catch (error) {
      console.error("Error creating team:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayer1Select = (value: string, option: any) => {
    setValue('player_uuids.0', value, { shouldValidate: true });
    setPlayer1Keyword(option.name);
  };

  return (
    <Modal
      title="Add Player Manually"
      open={open}
      onCancel={handleClose}
      footer={null}
      width={600}
      className="add-team-modal"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          {/* Player 1 */}
          <div className="space-y-2">
            <Controller
              name="player_uuids.0"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Player"
                  validateStatus={errors.player_uuids ? 'error' : ''}
                  help={errors.player_uuids?.message}
                  required
                >
                  <AutoComplete
                    className="shadow-sm w-full h-[38px]"
                    suffixIcon={<Lucide icon="Search" />}
                    value={player1Keyword}
                    options={playerData1?.data?.map((player: any) => {
                      const currentPlayerUuids = watch('player_uuids');
                      const isPlayer1Selected = currentPlayerUuids[0] === player.uuid;
                      const isDisabled = isPlayer1Selected || playerIsRegistered(player.uuid);

                      return {
                        value: player.uuid,
                        label: (
                          <div className={`flex flex-row justify-between ${isDisabled ? 'opacity-50' : ''}`}>
                            <div className="flex items-center flex-row">
                              <Image src={player.media_url || ""} alt={player.name} className="w-6 h-6 rounded-full mr-2" />
                              <span className="flex flex-col">
                                <span className="mb-0">
                                  {player.name}
                                  <span className="text-gray-400 text-[12px] font-medium italic"> {player.nickname}</span>
                                </span>
                                <span className="text-gray-400 text-[11px] mt-0">{player.username}</span>
                              </span>
                            </div>
                            <div className="flex items-center flex-row">
                              {isDisabled ? (
                                <div className="text-[10px] text-gray-500">Already Selected</div>
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
                    onSelect={handlePlayer1Select}
                    onSearch={(text) => {
                      setPlayer1Keyword(text);
                    }}
                    placeholder="Search for player to add"
                  />
                </Form.Item>
              )}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Status"
                  validateStatus={errors.status ? 'error' : ''}
                  help={errors.status?.message}
                  required
                >
                  <Select
                    {...field}
                    placeholder="Select status"
                  >
                    <Select.Option value="CONFIRMED">Confirmed</Select.Option>
                    <Select.Option value="APPROVED">Approved</Select.Option>
                    <Select.Option value="REQUESTED">Requested</Select.Option>
                  </Select>
                </Form.Item>
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
          <Button
            variant="outline-primary"
            onClick={handleClose}
            disabled={loading}
            type="button"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={!isValid || loading}
          >
            Add Player
          </Button>
        </div>
      </form>
    </Modal>
  );
};
