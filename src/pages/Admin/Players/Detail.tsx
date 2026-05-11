import React from "react";
import { useRouteParams } from "typesafe-routes/react-router";
import { paths } from "@/router/paths";
import { useAtomValue } from "jotai";
import { userAtom } from "@/utils/store";
import Button from "@/components/Base/Button";
import Lucide from "@/components/Base/Lucide";
import { Divider, Progress } from "antd";
import { PlayerHomeApiHooks } from "@/pages/Players/Home/api";
import Image from "@/components/Image";
import moment from "moment";
import LayoutWrapper from "@/components/LayoutWrapper";
import { useNavigate } from "react-router-dom";

interface PlayerDetailProps { }

export const PlayerDetail: React.FC<PlayerDetailProps> = () => {
  const userData = useAtomValue(userAtom);
  const queryParams = useRouteParams(paths.administrator.players.detail);
  const navigate = useNavigate();
  const { player: playerUuid } = queryParams;

  // Fetch player details
  const { data: playerData, isLoading: playerLoading } = PlayerHomeApiHooks.useGetPlayersDetail({
    params: { uuid: playerUuid || "" }
  }, {
    enabled: !!playerUuid,
    retry: false
  });

  const player = playerData?.data;

  if (playerLoading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-800 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading player details...</p>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  if (!player) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Lucide icon="UserX" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Player not found</p>
            <Button
              variant="outline-primary"
              className="mt-4"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </div>
        </div>
      </LayoutWrapper>
    );
  }

  return (
    <LayoutWrapper>
      <div className="grid grid-cols-12 gap-6 p-6">
        {/* Header Section */}
        <div className="col-span-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <Lucide icon="ArrowLeft" className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-800">Player Details</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline-primary"
                onClick={() => window.open(`/players/${player.uuid}`, '_blank')}
              >
                <Lucide icon="Eye" className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate(paths.administrator.players.edit({ player: playerUuid || "" }).$)}
              >
                <Lucide icon="Pencil" className="w-4 h-4 mr-2" />
                Edit Player
              </Button>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="col-span-12 lg:col-span-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <Image
                src={player.media_url || '/default-avatar.png'}
                alt={player.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-emerald-800 mr-6"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{player.name}</h2>
                {player.nickname && (
                  <p className="text-gray-600 mb-4">"@{player.nickname}"</p>
                )}
                <div className="flex gap-2">
                  {player.level && (
                    <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                      {player.level}
                    </span>
                  )}
                  {player.isVerified && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Divider />

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <Lucide icon="Mail" className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{player.email}</span>
                  </div>
                </div>
                {player.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <div className="flex items-center gap-2">
                      <Lucide icon="Phone" className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-900">{player.phone}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Location Information */}
              {player.city && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <div className="flex items-center gap-2">
                    <Lucide icon="MapPin" className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{player.city}</span>
                  </div>
                </div>
              )}

              {/* Personal Details */}
              {player.dateOfBirth && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <div className="flex items-center gap-2">
                    <Lucide icon="Calendar" className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">
                      {moment(player.dateOfBirth).format('DD MMM YYYY')} ({moment().diff(moment(player.dateOfBirth), 'years')} years old)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Skills & Social Media */}
        <div className="col-span-12 lg:col-span-6 space-y-6">
          {/* Skills */}
          {player.skills && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Skills Rating</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{player.skills.forehand}</div>
                  <div className="text-sm text-gray-600 mb-2">Forehand</div>
                  <Progress
                    percent={player.skills.forehand}
                    showInfo={false}
                    strokeColor="#10b981"
                    size="small"
                  />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{player.skills.backhand}</div>
                  <div className="text-sm text-gray-600 mb-2">Backhand</div>
                  <Progress
                    percent={player.skills.backhand}
                    showInfo={false}
                    strokeColor="#10b981"
                    size="small"
                  />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{player.skills.serve}</div>
                  <div className="text-sm text-gray-600 mb-2">Serve</div>
                  <Progress
                    percent={player.skills.serve}
                    showInfo={false}
                    strokeColor="#10b981"
                    size="small"
                  />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{player.skills.volley}</div>
                  <div className="text-sm text-gray-600 mb-2">Volley</div>
                  <Progress
                    percent={player.skills.volley}
                    showInfo={false}
                    strokeColor="#10b981"
                    size="small"
                  />
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-2">{player.skills.overhead}</div>
                  <div className="text-sm text-gray-600 mb-2">Overhead</div>
                  <Progress
                    percent={player.skills.overhead}
                    showInfo={false}
                    strokeColor="#10b981"
                    size="small"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Media */}
          {(player.socialMediaIg || player.socialMediaX) && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Social Media</h3>
              <div className="space-y-3">
                {player.socialMediaIg && (
                  <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="flex items-center gap-3">
                      <Lucide icon="Instagram" className="w-5 h-5 text-pink-600" />
                      <div>
                        <div className="font-medium text-gray-900">@{player.socialMediaIg}</div>
                        <div className="text-sm text-gray-600">Instagram</div>
                      </div>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => window.open(`https://instagram.com/${player.socialMediaIg}`, '_blank')}
                    >
                      <Lucide icon="ExternalLink" className="w-4 h-4 mr-2" />
                      Visit
                    </Button>
                  </div>
                )}
                {player.socialMediaX && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Lucide icon="Twitter" className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-gray-900">@{player.socialMediaX}</div>
                        <div className="text-sm text-gray-600">Twitter</div>
                      </div>
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => window.open(`https://twitter.com/${player.socialMediaX}`, '_blank')}
                    >
                      <Lucide icon="ExternalLink" className="w-4 h-4 mr-2" />
                      Visit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Registration Timeline */}
        <div className="col-span-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Lucide icon="CalendarPlus" className="w-8 h-8 text-emerald-600 mx-auto mb-3" />
                <div className="text-sm text-gray-600">Member Since</div>
                <div className="text-lg font-medium text-gray-900">{moment(player.createdAt).format('DD MMM YYYY')}</div>
              </div>
              <div className="text-center">
                <Lucide icon="Clock" className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-sm text-gray-600">Last Updated</div>
                <div className="text-lg font-medium text-gray-900">{moment(player.updatedAt).format('DD MMM YYYY')}</div>
              </div>
              <div className="text-center">
                <Lucide icon="Shield" className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <div className="text-sm text-gray-600">Account Status</div>
                <div className="text-lg font-medium">
                  <span className={`px-3 py-1 rounded-full text-sm ${player.isVerified
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {player.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-span-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline-primary"
                className="w-full"
                onClick={() => window.open(`/players/${player.uuid}`, '_blank')}
              >
                <Lucide icon="Eye" className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => navigate(paths.administrator.players.edit({ player: playerUuid || "" }).$)}
              >
                <Lucide icon="Pencil" className="w-4 h-4 mr-2" />
                Edit Player
              </Button>
              <Button
                variant="outline-secondary"
                className="w-full"
                onClick={() => navigate(paths.administrator.players.index)}
              >
                <Lucide icon="Users" className="w-4 h-4 mr-2" />
                Back to Players List
              </Button>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
};
