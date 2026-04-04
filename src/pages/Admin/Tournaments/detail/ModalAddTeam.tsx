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

interface ModalAddTeamProps {
  tournamentUuid: string;
  open: boolean;
  onClose: () => void;
}

const teamFormSchema = z.object({
  player_uuids: z.array(z.string()).min(2, "Exactly 2 players are required").max(2, "Exactly 2 players are required"),
  status: z.enum(['REQUESTED', 'APPROVED', 'CONFIRMED', 'REJECTED']).default('REQUESTED')
}).refine((data) => data.player_uuids[0] !== data.player_uuids[1], {
  message: "Player 1 and Player 2 cannot be the same",
  path: ["player_uuids"]
});

type TeamFormData = z.infer<typeof teamFormSchema>;

export const ModalAddTeam: React.FC<ModalAddTeamProps> = ({
  tournamentUuid,
  open,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [player1Keyword, setPlayer1Keyword] = useState("");
  const [player2Keyword, setPlayer2Keyword] = useState("");
  const { showNotification } = useToast();

  const { control, handleSubmit, formState: { errors, isValid }, setValue, reset, watch } = useForm<TeamFormData>({
    resolver: zodResolver(teamFormSchema),
    defaultValues: {
      player_uuids: ['', ''],
      status: undefined
    }
  });
  const { data: registeredTeamsData } = TournamentsApiHooks.useGetTournamentTeamParticipants({
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
    return registeredTeamsData?.data?.teams?.some((team) =>
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

  const { data: playerData2 } = PlayerHomeApiHooks.useGetPlayersDropdown({
    queries: {
      keyword: player2Keyword,
      tournamentUuid: tournamentUuid
    }
  });

  // Create team mutation using new add team endpoint
  const { mutate: actionAddTournamentTeam } = TournamentsApiHooks.useAddTournamentTeam({
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
        text: "Team created successfully",
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
    setPlayer2Keyword("");
    reset();
    onClose();
  };

  const onSubmit = async (values: TeamFormData) => {
    setLoading(true);
    try {
      await actionAddTournamentTeam({
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
    const currentPlayerUuids = watch('player_uuids');
    setValue('player_uuids.0', value, { shouldValidate: true });
    setPlayer1Keyword(option.name);
    // Reset player 2 if it's the same as player 1
    if (currentPlayerUuids[1] === value) {
      setValue('player_uuids.1', '', { shouldValidate: true });
      setPlayer2Keyword('');
    }
  };

  const handlePlayer2Select = (value: string, option: any) => {
    const currentPlayerUuids = watch('player_uuids');
    if (currentPlayerUuids[0] === value) {
      // Can't select the same player
      return;
    }
    setValue('player_uuids.1', value, { shouldValidate: true });
    setPlayer2Keyword(option.name);
  };

  return (
    <Modal
      title="Add Team Manually"
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
                  label="Player 1"
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
                      const isPlayer2Selected = currentPlayerUuids[1] === player.uuid;
                      const isDisabled = isPlayer1Selected || isPlayer2Selected || playerIsRegistered(player.uuid);

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

          {/* Player 2 */}
          <div className="space-y-2">
            <Controller
              name="player_uuids.1"
              control={control}
              render={({ field }) => (
                <Form.Item
                  label="Player 2"
                  validateStatus={errors.player_uuids ? 'error' : ''}
                  help={errors.player_uuids?.message}
                  required
                >
                  <AutoComplete
                    className="shadow-sm w-full h-[38px]"
                    suffixIcon={<Lucide icon="Search" />}
                    value={player2Keyword}
                    options={playerData2?.data?.map((player: any) => {
                      const currentPlayerUuids = watch('player_uuids');
                      const isPlayer1Selected = currentPlayerUuids[0] === player.uuid;
                      const isPlayer2Selected = currentPlayerUuids[1] === player.uuid;
                      const isDisabled = isPlayer1Selected || isPlayer2Selected || playerIsRegistered(player.uuid);

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
                    onSelect={handlePlayer2Select}
                    onSearch={(text) => {
                      setPlayer2Keyword(text);
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
            Add Team
          </Button>
        </div>
      </form>
    </Modal>
  );
};
