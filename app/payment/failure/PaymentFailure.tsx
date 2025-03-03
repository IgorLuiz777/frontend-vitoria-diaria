'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function PaymentFailureComponent() {
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

        // Update the support payment status to failed
        await supabase
          .from('supports')
          .update({ payment_status: 'failed' })
          .eq('id', supportId);

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

  const handleTryAgain = () => {
    if (supportDetails?.recipient?.username) {
      router.push(`/profile/${supportDetails.recipient.username}`);
    } else {
      router.push('/dashboard');
    }
  };

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
              <XCircle className="h-16 w-16 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Pagamento não concluído</CardTitle>
            <CardDescription>
              Houve um problema ao processar seu pagamento
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {supportDetails && (
            <div className="space-y-4 p-4 bg-destructive/10 rounded-lg">
              <p className="text-center text-sm text-muted-foreground">
                Seu apoio para {supportDetails.recipient?.name} de
              </p>
              <p className="text-center text-2xl font-bold text-destructive">
                {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(supportDetails.amount)}
              </p>
              <p className="text-center text-sm text-muted-foreground">
                não foi processado
              </p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              onClick={handleTryAgain}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Tentar novamente
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              Voltar para o Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
