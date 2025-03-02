'use client';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Beer, Calendar, Cigarette, Coffee, DollarSign, Flame, Heart, Loader2, Trophy, Ban, ShoppingBag, Smartphone, Gamepad, Candy, BookOpen, Dumbbell, Brain, Droplets, Moon, Code, PenLine, Target } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePublicProfile } from '@/hooks/use-users';
import { usePublicAddictions } from '@/hooks/use-addictions';
import { usePublicGoals } from '@/hooks/use-goals';
import { usePublicSupports, useSupports, SupportFormData } from '@/hooks/use-supports';
import { useSupabaseAuth } from '@/hooks/use-supabase';

const supportSchema = z.object({
  message: z.string()
    .min(1, 'Mensagem de apoio é obrigatória')
    .max(280, 'Mensagem deve ter no máximo 280 caracteres'),
  duration: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 365, {
      message: 'Duração deve ser entre 1 e 365 dias',
    }),
  amount: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 1, {
      message: 'Valor mínimo de R$ 1,00',
    }),
  addictionId: z.string().optional(),
  goalId: z.string().optional(),
  supporterName: z.string().optional(),
  hideAmount: z.boolean().default(false),
});

type SupportForm = z.infer<typeof supportSchema>;

interface ProfileContentProps {
  params: {
    username: string;
  }
}

export default function ProfileContent({ params }: ProfileContentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'addictions' | 'goals'>('addictions');
  const router = useRouter();
  const { user } = useSupabaseAuth();

  const { profile, loading: profileLoading } = usePublicProfile(params.username);
  const { addictions, loading: addictionsLoading } = usePublicAddictions(profile?.id || '');
  const { goals, loading: goalsLoading } = usePublicGoals(profile?.id || '');
  const { supports, loading: supportsLoading, fetchPublicSupports } = usePublicSupports(profile?.id || '');
  const { createSupport } = useSupports();
  const [showAllSupports, setShowAllSupports] = useState(false);

  const form = useForm<SupportForm>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      message: '',
      duration: '30',
      amount: '',
      addictionId: undefined,
      goalId: undefined,
      supporterName: '',
      hideAmount: false,
    },
  });

  useEffect(() => {
    if (profile?.id) {
      fetchPublicSupports();
    }
  }, [profile?.id]);

  const handleShowAllSupports = () => {
    setShowAllSupports(true);
  };

  const onSubmit = async (data: SupportForm) => {
    if (!profile) return;

    setIsSubmitting(true);
    try {
      await createSupport(profile.id, data as SupportFormData);
      form.reset();
      setIsDialogOpen(false);
      await fetchPublicSupports();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAddictionIconComponent = (iconName: string) => {
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

  const getGoalIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="h-5 w-5" />;
      case 'Dumbbell': return <Dumbbell className="h-5 w-5" />;
      case 'Brain': return <Brain className="h-5 w-5" />;
      case 'Droplets': return <Droplets className="h-5 w-5" />;
      case 'Moon': return <Moon className="h-5 w-5" />;
      case 'Code': return <Code className="h-5 w-5" />;
      case 'PenLine': return <PenLine className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const formatCurrency = (value: number | null) => {
    if (value === null) return '?????';
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Ban className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-2">Perfil não encontrado</h2>
        <p className="text-muted-foreground mb-6">
          O usuário @{params.username} não existe ou foi removido.
        </p>
        <Button
          onClick={() => router.push('/')}
          className="bg-primary hover:bg-primary/90"
        >
          Voltar para a página inicial
        </Button>
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
            {user && user.id === profile.id && (
              <Link href="/profile/edit">
                <Button variant="outline">Editar Perfil</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Profile Info */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-card/80 backdrop-blur border-primary/20">
              <CardHeader>
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-32 w-32">
                    {profile.image_url ? (
                      <img src={profile.image_url} alt={profile.name} className="object-cover" />
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-primary">
                          {profile.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">{profile.name}</h2>
                    <p className="text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">{profile.bio || 'Sem biografia'}</p>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Membro desde {formatDate(profile.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    <span>{profile.city} • {profile.age} anos</span>
                  </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Apoiar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] overflow-auto max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Apoiar</DialogTitle>
                      <DialogDescription>
                        Ajude {profile.name} a alcançar seus objetivos com uma mensagem de apoio e uma contribuição.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mensagem de apoio</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Escreva uma mensagem de incentivo..."
                                  className="resize-none"
                                  {...field}
                                />
                              </FormControl >
                              <FormDescription>
                                {field.value.length}/280 caracteres
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Tabs defaultValue="addictions" onValueChange={(value) => {
                          if (value === 'addictions' || value === 'goals') {
                            form.setValue('addictionId', undefined);
                            form.setValue('goalId', undefined);
                          }
                        }}>
                          <TabsList className="w-full grid grid-cols-2">
                            <TabsTrigger value="addictions">Controle de Vícios</TabsTrigger>
                            <TabsTrigger value="goals">Metas Positivas</TabsTrigger>
                          </TabsList>

                          <TabsContent value="addictions">
                            {addictions.length > 0 && (
                              <FormField
                                control={form.control}
                                name="addictionId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Apoiar controle específico (opcional)</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione um controle" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {addictions.map(addiction => (
                                          <SelectItem key={addiction.id} value={addiction.id}>
                                            <div className="flex items-center gap-2">
                                              {getAddictionIconComponent(addiction.icon)}
                                              <span>{addiction.name}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      Deixe em branco para apoiar todos os controles
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </TabsContent>

                          <TabsContent value="goals">
                            {goals.length > 0 && (
                              <FormField
                                control={form.control}
                                name="goalId"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Apoiar meta específica (opcional)</FormLabel>
                                    <Select
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Selecione uma meta" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {goals.map(goal => (
                                          <SelectItem key={goal.id} value={goal.id}>
                                            <div className="flex items-center gap-2">
                                              {getGoalIconComponent(goal.icon)}
                                              <span>{goal.name}</span>
                                            </div>
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>
                                      Deixe em branco para apoiar todas as metas
                                    </FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )}
                          </TabsContent>
                        </Tabs>

                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Duração da meta (dias)</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min="1"
                                    max="365"
                                    placeholder="30"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Valor do apoio</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    placeholder="50.00"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="supporterName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Seu nome (opcional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Como você quer ser identificado?" {...field} />
                              </FormControl>
                              <FormDescription>
                                Deixe em branco para apoiar anonimamente
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hideAmount"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Ocultar valor até meta ser atingida
                                </FormLabel>
                                <FormDescription>
                                  O valor só será revelado quando a meta for alcançada
                                </FormDescription>
                              </div>
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
                              Processando...
                            </>
                          ) : (
                            'Enviar Apoio'
                          )}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Supports */}
            <Card className="bg-card/80 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Apoios Recebidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supports.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Nenhum apoio recebido ainda</p>
                  </div>
                ) : (
                  (showAllSupports ? supports : supports.slice(0, 3)).map((support, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        {support.supporter_name ? support.supporter_name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {support.supporter_name || 'Apoiador anônimo'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {support.message}
                        </p>
                        <div className="flex justify-between mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(support.created_at)}
                          </p>
                          <p className="text-xs font-medium text-primary">
                            {formatCurrency(support.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {supports.length > 3 && !showAllSupports && (
                  <Button
                    onClick={handleShowAllSupports}
                    variant="outline" className="w-full">
                    Ver todos os {supports.length} apoios
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress Cards */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Maior Sequência</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.max(
                      addictions.length > 0 ? Math.max(...addictions.map(a => a.streak)) : 0,
                      goals.length > 0 ? Math.max(...goals.map(g => g.streak)) : 0
                    )} dias
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {addictions.length > 0 || goals.length > 0
                      ? [...addictions, ...goals].reduce((max, curr) => curr.streak > max.streak ? curr : max,
                        addictions.length > 0 ? addictions[0] : goals[0]).name
                      : 'Nenhum registro'}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(addictions.reduce((acc, curr) => acc + curr.saved, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">Em todos os controles</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registros Ativos</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{addictions.length + goals.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {addictions.length} controles e {goals.length} metas
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="addictions" onValueChange={(value) => {
              if (value === 'addictions' || value === 'goals') {
                setActiveTab(value as 'addictions' | 'goals');
              }
            }} className="space-y-6">
              <TabsList>
                <TabsTrigger value="addictions" className="gap-2">
                  <Ban className="h-4 w-4" />
                  Controle de Vícios
                </TabsTrigger>
                <TabsTrigger value="goals" className="gap-2">
                  <Target className="h-4 w-4" />
                  Metas Positivas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="addictions">
                {addictions.length === 0 ? (
                  <Card className="bg-card/80 backdrop-blur border-primary/20">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Ban className="h-16 w-16 text-primary/50 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Nenhum controle visível</h3>
                      <p className="text-muted-foreground max-w-md">
                        {profile.name} ainda não cadastrou nenhum controle ou optou por mantê-los privados.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  addictions.map((addiction) => (
                    <Card key={addiction.id} className="bg-card/80 backdrop-blur border-primary/20 mb-4">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {getAddictionIconComponent(addiction.icon)}
                            <span>{addiction.name}</span>
                          </CardTitle>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {addiction.streak} dias limpo
                          </Badge>
                        </div>
                        <CardDescription>
                          Meta: {addiction.goal_days} dias sem {addiction.name.toLowerCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Progress value={addiction.progress} className="h-2 bg-primary/20" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso: {addiction.progress}%</span>
                          <span className="text-muted-foreground">
                            Economia: {formatCurrency(addiction.saved)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="goals">
                {goals.length === 0 ? (
                  <Card className="bg-card/80 backdrop-blur border-primary/20">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                      <Target className="h-16 w-16 text-primary/50 mb-4" />
                      <h3 className="text-xl font-bold mb-2">Nenhuma meta visível</h3>
                      <p className="text-muted-foreground max-w-md">
                        {profile.name} ainda não cadastrou nenhuma meta ou optou por mantê-las privadas.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  goals.map((goal) => (
                    <Card key={goal.id} className="bg-card/80 backdrop-blur border-primary/20 mb-4">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {getGoalIconComponent(goal.icon)}
                            <span>{goal.name}</span>
                          </CardTitle>
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {goal.streak} dias consecutivos
                          </Badge>
                        </div>
                        <CardDescription>
                          Meta: {goal.goal_days} dias de {goal.name.toLowerCase()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {goal.description && (
                          <div className="p-3 bg-secondary/50 rounded-lg mb-2">
                            <p className="text-sm text-muted-foreground">{goal.description}</p>
                          </div>
                        )}
                        <Progress value={goal.progress} className="h-2 bg-primary/20" />
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progresso: {goal.progress}%</span>
                          <span className="text-muted-foreground">
                            Meta diária: {goal.daily_target}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
