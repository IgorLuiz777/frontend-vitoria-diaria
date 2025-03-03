'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Clock } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PaymentPending() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supportId = searchParams.get('support_id');
  const [supportDetails, setSupportDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupportDetails = async () => {
      if (!supportId) {
        router.push('/dashboard');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('supports')
          .select(`
            *,
            recipient:users!recipient_id(name, username)
          `)
          .eq('id', supportId)
          .single();

        if (error) throw error;

        setSupportDetails(data);
      } catch (error) {
        console.error('Error fetching support details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportDetails();
  }, [supportId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <Heart className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-secondary/50 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/80 backdrop-blur border-primary/20">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <Link
              href="/"
              className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
            >
              <Heart className="h-8 w-8" />
              <span className="text-2xl font-bold">Vitória Diária</span>
            </Link>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Clock className="h-16 w-16 text-amber-500" />
            </div>
            <CardTitle className="text-2xl">Pagamento Pendente</CardTitle>
            <CardDescription>
              Seu pagamento está sendo processado
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {supportDetails && (
            <div className="space-y-4 p-4 bg-amber-50 rounded-lg">
              <p className="text-center font-medium">
                Seu apoio para {supportDetails.recipient?.name} de
              </p>
              <p className="text-center text-2xl font-bold text-amber-600">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(supportDetails.amount)}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                está sendo processado. Você receberá uma confirmação em breve.
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Ir para o Dashboard
            </Button>
            {supportDetails?.recipient?.username && (
              <Button
                variant="outline"
                onClick={() => router.push(`/profile/${supportDetails.recipient.username}`)}
              >
                Ver perfil de {supportDetails.recipient.name}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}