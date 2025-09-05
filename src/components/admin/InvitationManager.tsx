'use client';

import React, { useState } from 'react';
import { useAuth } from '@/src/hooks/useAuth';
import { getInvitationService } from '@/src/services/invitationService';
import { ProvinceSelector } from '@/src/components/ui/ProvinceSelector';
import { INDONESIAN_PROVINCES } from '@/src/config/provinces';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';

export function InvitationManager() {
  const { user } = useAuth();
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [generatedInvitation, setGeneratedInvitation] = useState<{
    token: string;
    link: string;
    whatsappUrl: string;
    provinceName: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invitationService = getInvitationService();

  const handleCreateInvitation = async () => {
    if (!selectedProvince || !user) return;

    setIsCreating(true);
    setError(null);

    try {
      const result = await invitationService.createInvitation({
        province: selectedProvince,
        createdBy: user.id,
        createdByName: user.displayName || user.email || 'Owner',
        expirationDays: 7
      });

      if (result.success && result.invitation) {
        const baseUrl = window.location.origin;
        const link = `${baseUrl}/invite/${result.invitation.token}`;
        
        setGeneratedInvitation({
          token: result.invitation.token,
          link,
          whatsappUrl: result.whatsappUrl || '',
          provinceName: result.invitation.provinceName
        });
      } else {
        setError(result.error || 'Failed to create invitation');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedInvitation) {
      navigator.clipboard.writeText(generatedInvitation.link);
      alert('Invitation link copied to clipboard!');
    }
  };

  const handleOpenWhatsApp = () => {
    if (generatedInvitation?.whatsappUrl) {
      window.open(generatedInvitation.whatsappUrl, '_blank');
    }
  };

  if (!user || user.role !== 'owner') {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center text-gray-500">
          Only owners can create invitations.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Create Invitation</h2>
            <p className="text-sm text-gray-600 mt-1">
              Generate invitation links to add volunteers to specific provinces
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        {/* Invitation Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Province
            </label>
            <ProvinceSelector
              value={selectedProvince}
              onChange={(province) => setSelectedProvince(province)}
              placeholder="Choose a province for the volunteer..."
              className="max-w-md"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={handleCreateInvitation}
              disabled={!selectedProvince || isCreating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isCreating && <LoadingSpinner size="sm" className="mr-2" />}
              {isCreating ? 'Creating...' : 'Generate Invitation'}
            </button>

            {selectedProvince && (
              <div className="text-sm text-gray-600">
                For: {INDONESIAN_PROVINCES.find(p => p.code === selectedProvince)?.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Generated Invitation */}
      {generatedInvitation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Invitation Created Successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Province: <strong>{generatedInvitation.provinceName}</strong></p>
                <p>Token: <code className="bg-white px-2 py-1 rounded text-xs">{generatedInvitation.token}</code></p>
              </div>

              {/* Invitation Link */}
              <div className="mt-4 p-3 bg-white border border-green-200 rounded">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Invitation Link:
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={generatedInvitation.link}
                    readOnly
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-50"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex space-x-3">
                {generatedInvitation.whatsappUrl && (
                  <button
                    onClick={handleOpenWhatsApp}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Share via WhatsApp
                  </button>
                )}
                
                <button
                  onClick={() => setGeneratedInvitation(null)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                >
                  Create Another
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-4 text-xs text-green-700 bg-white p-3 rounded border border-green-200">
                <strong>Instructions:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-1">
                  <li>Share this link with the volunteer</li>
                  <li>They will click the link and see province information</li>
                  <li>They can sign up or log in through the invitation page</li>
                  <li>They will be automatically assigned as a volunteer for {generatedInvitation.provinceName}</li>
                  <li>The invitation expires in 7 days and can only be used once</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">How Invitations Work</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Each invitation is tied to a specific province</li>
                <li>Volunteers can only manage crisis information in their assigned province</li>
                <li>Invitations expire after 7 days and can only be used once</li>
                <li>You can revoke unused invitations anytime</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}