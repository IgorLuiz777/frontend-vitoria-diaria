import ProfileContent from './profile-content';

// This is a Server Component that handles static generation
export default function Profile({ params }: { params: { username: string } }) {
  return <ProfileContent params={params} />;
}

export function generateStaticParams() {
  // In a real app, this would come from your database
  // For now, we'll pre-render a few example usernames
  return [
    { username: 'username' },
    { username: 'joao.silva' },
    { username: 'maria.santos' },
    { username: 'pedro.oliveira' }
  ];
}