'use client';

import { useParams } from 'next/navigation';
import { InvitationValidator } from '@/src/components/invite/InvitationValidator';

interface InvitePageProps {
  params: {
    token: string;
  };
}

export default function InvitePage() {
  const params = useParams();
  const token = params.token as string;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🚨 JagaWarga Invitation
          </h1>
          <p className="text-gray-600">
            Join the crisis management team for your province
          </p>
        </div>
        
        <InvitationValidator token={token} />
      </div>
    </div>
  );
}