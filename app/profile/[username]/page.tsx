"use client";

import { Loader } from 'lucide-react';
import ProfileContent from './profile-content';
import { useEffect, useState } from 'react';
interface ProfileProps {
  params: Promise<{ username: string }>;
}

export default function Profile({ params }: ProfileProps) {
  const [resolvedParams, setResolvedParams] = useState<{ username: string } | null>(null);

  useEffect(() => {
    params.then(data => setResolvedParams(data));
  }, [params]);

  if (!resolvedParams) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="animate-spin text-primary" />
      </div>
    );
  }

  return <ProfileContent params={resolvedParams} />;
}
