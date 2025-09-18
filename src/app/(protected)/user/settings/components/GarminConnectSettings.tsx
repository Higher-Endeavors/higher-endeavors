'use client'

import React, { useState } from 'react';
import { useToast } from 'lib/toast';
import { clientLogger } from 'lib/logging/logger.client';
import type { GarminConnectSettings } from 'lib/types/userSettings.zod';

interface GarminConnectSettingsProps {
  garminConnect?: GarminConnectSettings;
  onUpdate: () => void;
}

const GarminConnectSettings = ({ garminConnect, onUpdate }: GarminConnectSettingsProps) => {
  const { success, error } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch('/api/garmin-connect/auth');
      if (!response.ok) {
        throw new Error('Failed to initiate Garmin authorization');
      }
      
      const { authUrl } = await response.json();
      
      // Redirect to Garmin authorization
      window.location.href = authUrl;
      
    } catch (err: any) {
      clientLogger.error('Error connecting to Garmin', err);
      error('Failed to connect to Garmin Connect');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch('/api/garmin-connect/disconnect', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect from Garmin');
      }
      
      success('Successfully disconnected from Garmin Connect');
      onUpdate();
      
    } catch (err: any) {
      clientLogger.error('Error disconnecting from Garmin', err);
      error('Failed to disconnect from Garmin Connect');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const formatPermissions = (permissions?: string[]) => {
    if (!permissions || permissions.length === 0) return 'None';
    return permissions.join(', ');
  };

  return (
    <div className="pt-4 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Garmin Connect Integration</h3>
      
      {garminConnect?.isConnected ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-green-800">Connected to Garmin Connect</p>
                <p className="text-sm text-green-600">
                  User ID: {garminConnect.userId}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                isDisconnecting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Permissions:</p>
              <p className="text-gray-600">{formatPermissions(garminConnect.permissions)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Last Sync:</p>
              <p className="text-gray-600">{formatDate(garminConnect.lastSyncAt)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Token Expires:</p>
              <p className="text-gray-600">{formatDate(garminConnect.tokenExpiresAt)}</p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Refresh Token Expires:</p>
              <p className="text-gray-600">{formatDate(garminConnect.refreshTokenExpiresAt)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Connect to Garmin Connect</p>
              <p className="text-sm text-gray-600 mt-1">
                Sync your fitness data, activities, and health metrics from Garmin Connect.
              </p>
            </div>
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className={`px-6 py-2 text-sm font-medium rounded-md ${
                isConnecting
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GarminConnectSettings;
