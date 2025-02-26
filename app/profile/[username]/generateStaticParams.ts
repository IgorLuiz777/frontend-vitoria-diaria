export async function generateStaticParams() {
  // In a real app, this would come from your database
  // For now, we'll pre-render a few example usernames
  return [
    { username: 'joao.silva' },
    { username: 'maria.santos' },
    { username: 'pedro.oliveira' }
  ];
}