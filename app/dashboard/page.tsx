'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Plus, Cigarette, Beer, Coffee, Trophy, Calendar, Flame, DollarSign, Loader2, ShoppingBag, Smartphone, Gamepad, Candy, Ban } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useAddictions, AddictionFormData } from '@/hooks/use-addictions';
import { useUsers } from '@/hooks/use-users';
import { useSupabaseAuth } from '@/hooks/use-supabase';
import { useRouter } from 'next/navigation';

const newAddictionSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  icon: z.string().optional(),
  dailyCost: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Custo diário deve ser um número positivo',
  }),
  goalDays: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Meta de dias deve ser um número positivo',
  }),
});

type NewAddictionForm = z.infer<typeof newAddictionSchema>;

export default function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addictions, loading, createAddiction, performCheckIn } = useAddictions();
  const { profile, loading: profileLoading } = useUsers();
  const { user } = useSupabaseAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewAddictionForm>({
    resolver: zodResolver(newAddictionSchema),
    defaultValues: {
      name: '',
      icon: 'other',
      dailyCost: '',
      goalDays: '30',
    },
  });

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const onSubmit = async (data: NewAddictionForm) => {
    setIsSubmitting(true);
    try {
      const result = await createAddiction(data as AddictionFormData);
      if (result) {
        form.reset();
        setIsDialogOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckIn = async (addictionId: string) => {
    await performCheckIn(addictionId);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Cigarette': return <Cigarette className="h-5 w-5" />;
      case 'Beer': return <Beer className="h-5 w-5" />;
      case 'Coffee': return <Coffee className="h-5 w-5" />;
      case 'ShoppingBag': return <ShoppingBag className="h-5 w-5" />;
      case 'Smartphone': return <Smartphone className="h-5 w-5" />;
      case 'Gamepad': return <Gamepad className="h-5 w-5" />;
      case 'Candy': return <Candy className="h-5 w-5" />;
      default: return <Ban className="h-5 w-5" />;
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/50 to-primary/10">
      <header className="bg-white/80 backdrop-blur-md border-b border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link
              href={user ? '/dashboard' : "/"}
              className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
            >
              <Heart className="h-6 w-6" />
              <span className="text-xl font-bold">Vitória Diária</span>
            </Link>
            <div className="flex items-center gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Controle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Novo Controle</DialogTitle>
                    <DialogDescription>
                      Cadastre um novo vício que você quer controlar. Defina metas e acompanhe seu progresso.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do vício</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Cigarro, Álcool, etc" {...field} />
                            </FormControl>
                            <FormDescription>
                              Identifique o vício que você quer controlar
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="icon"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ícone</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um ícone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cigarette">
                                  <div className="flex items-center gap-2">
                                    <Cigarette className="h-4 w-4" />
                                    <span>Cigarro</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="alcohol">
                                  <div className="flex items-center gap-2">
                                    <Beer className="h-4 w-4" />
                                    <span>Álcool</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="caffeine">
                                  <div className="flex items-center gap-2">
                                    <Coffee className="h-4 w-4" />
                                    <span>Cafeína</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="shopping">
                                  <div className="flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4" />
                                    <span>Compras</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="social-media">
                                  <div className="flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" />
                                    <span>Redes Sociais</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="gaming">
                                  <div className="flex items-center gap-2">
                                    <Gamepad className="h-4 w-4" />
                                    <span>Jogos</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="sugar">
                                  <div className="flex items-center gap-2">
                                    <Candy className="h-4 w-4" />
                                    <span>Açúcar</span>
                                  </div>
                                </SelectItem>
                                <SelectItem value="other">
                                  <div className="flex items-center gap-2">
                                    <Ban className="h-4 w-4" />
                                    <span>Outro</span>
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Escolha um ícone para representar seu vício
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dailyCost"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Custo diário estimado (R$)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input type="number" step="0.01" min="0" placeholder="20.00" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Quanto você gasta por dia com este vício?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="goalDays"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meta inicial (dias)</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input type="number" min="1" placeholder="30" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormDescription>
                              Por quantos dias você quer ficar sem este vício?
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          'Começar Controle'
                        )}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>

              {profile && (
                <Link href={`/profile/${profile.username}`}>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20">
                      {profile.image_url ? (
                        <img
                          src={profile.image_url}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary">
                          {profile.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className="hidden md:inline">{profile.name}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {addictions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Ban className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhum controle cadastrado</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Você ainda não cadastrou nenhum vício para controlar. Comece agora e acompanhe seu progresso!
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Cadastrar Primeiro Controle
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Check-ins Totais</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{addictions.reduce((acc, curr) => acc + curr.check_ins, 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {addictions.length} controles ativos
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maior Sequência</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {addictions.length > 0 ? Math.max(...addictions.map(a => a.streak)) : 0} dias
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {addictions.length > 0
                      ? addictions.reduce((max, curr) => curr.streak > max.streak ? curr : max, addictions[0]).name
                      : 'Nenhum controle'}
                    - sequência atual
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(addictions.reduce((acc, curr) => acc + curr.saved, 0))}</div>
                  <p className="text-xs text-muted-foreground">
                    Valor economizado até agora
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue={addictions[0]?.id} className="space-y-6">
              <TabsList className="bg-card/80 backdrop-blur border-primary/20">
                {addictions.map((addiction) => (
                  <TabsTrigger
                    key={addiction.id}
                    value={addiction.id}
                    className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {getIconComponent(addiction.icon)}
                    {addiction.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {addictions.map((addiction) => (
                <TabsContent key={addiction.id} value={addiction.id} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-card/80 backdrop-blur border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-primary" />
                          Progresso Atual
                        </CardTitle>
                        <CardDescription>
                          Meta: {addiction.goal_days} dias sem {addiction.name.toLowerCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Progress value={addiction.progress} className="h-2 bg-primary/20" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{addiction.streak} dias</span>
                          <span className="text-muted-foreground">{addiction.goal_days} dias</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                          <div>
                            <p className="text-sm font-medium">Recompensa</p>
                            <p className="text-2xl font-bold text-primary">
                              {formatCurrency(addiction.daily_cost * addiction.goal_days)}
                            </p>
                          </div>
                          <Button
                            className="bg-primary hover:bg-primary/90"
                            onClick={() => handleCheckIn(addiction.id)}
                          >
                            Check-in Diário
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card/80 backdrop-blur border-primary/20">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Flame className="h-5 w-5 text-primary" />
                          Estatísticas
                        </CardTitle>
                        <CardDescription>
                          Seu progresso com {addiction.name.toLowerCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Check-ins</p>
                            <p className="text-2xl font-bold">{addiction.check_ins}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Sequência</p>
                            <p className="text-2xl font-bold">{addiction.streak} dias</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Economia</p>
                            <p className="text-2xl font-bold text-primary">{formatCurrency(addiction.saved)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Custo Diário</p>
                            <p className="text-2xl font-bold">{formatCurrency(addiction.daily_cost)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
}
