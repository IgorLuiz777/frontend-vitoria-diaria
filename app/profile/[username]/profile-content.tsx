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
import { Beer, Calendar, Cigarette, Coffee, DollarSign, Flame, Heart, Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  supporterName: z.string().optional(),
  hideAmount: z.boolean().default(false),
});

type SupportForm = z.infer<typeof supportSchema>;

interface Achievement {
  name: string;
  description: string;
  icon: React.ReactNode;
  date: string;
}

interface Addiction {
  id: string;
  name: string;
  icon: React.ReactNode;
  daysClean: number;
  totalDays: number;
  progress: number;
  moneySaved: number;
}

export default function ProfileContent({ params }: { params: { username: string } }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<SupportForm>({
    resolver: zodResolver(supportSchema),
    defaultValues: {
      message: '',
      duration: '30',
      amount: '',
      supporterName: '',
      hideAmount: false,
    },
  });

  const onSubmit = async (data: SupportForm) => {
    setIsSubmitting(true);
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log(data);
      // Aqui você redirecionaria para a página de pagamento
      router.push('/payment');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const user = {
    name: 'João Silva',
    username: params.username,
    bio: 'Em busca de uma vida mais saudável. Cada dia é uma nova conquista! 💪',
    location: 'São Paulo, SP',
    memberSince: 'Março 2024',
    photoUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&q=80',
  };

  const addictions: Addiction[] = [
    {
      id: 'smoking',
      name: 'Cigarro',
      icon: <Cigarette className="h-5 w-5" />,
      daysClean: 45,
      totalDays: 60,
      progress: 75,
      moneySaved: 450,
    },
    {
      id: 'alcohol',
      name: 'Álcool',
      icon: <Beer className="h-5 w-5" />,
      daysClean: 30,
      totalDays: 30,
      progress: 100,
      moneySaved: 800,
    },
    {
      id: 'caffeine',
      name: 'Cafeína',
      icon: <Coffee className="h-5 w-5" />,
      daysClean: 15,
      totalDays: 30,
      progress: 50,
      moneySaved: 200,
    },
  ];

  const achievements: Achievement[] = [
    {
      name: 'Primeiro Mês Completo',
      description: '30 dias sem álcool',
      icon: <Trophy className="h-5 w-5 text-primary" />,
      date: '15/03/2024',
    },
    {
      name: 'Economia Notável',
      description: 'Economizou R$ 1.000 em vícios',
      icon: <Trophy className="h-5 w-5 text-primary" />,
      date: '10/03/2024',
    },
  ];

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/50 to-primary/10">
      <header className="bg-white/80 backdrop-blur-md border-b border-primary/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <Link 
              href="/"
              className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
            >
              <Heart className="h-6 w-6" />
              <span className="text-xl font-bold">Vida Nova</span>
            </Link>
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
                    <img src={user.photoUrl} alt={user.name} className="object-cover" />
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">{user.bio}</p>
                <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Membro desde {user.memberSince}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Apoiar Meta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Apoiar Meta</DialogTitle>
                      <DialogDescription>
                        Ajude {user.name} a alcançar seus objetivos com uma mensagem de apoio e uma contribuição.
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
                              </FormControl>
                              <FormDescription>
                                {field.value.length}/280 caracteres
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

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
                            'Continuar para Pagamento'
                          )}
                        </Button>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="bg-card/80 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-3 rounded-lg bg-secondary/50"
                  >
                    {achievement.icon}
                    <div className="flex-1">
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                ))}
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
                  <div className="text-2xl font-bold">45 dias</div>
                  <p className="text-xs text-muted-foreground">Sem cigarro</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Economia Total</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(addictions.reduce((acc, curr) => acc + curr.moneySaved, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">Em todos os vícios</p>
                </CardContent>
              </Card>
              <Card className="bg-card/80 backdrop-blur border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vícios Controlados</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{addictions.length}</div>
                  <p className="text-xs text-muted-foreground">Em andamento</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {addictions.map((addiction) => (
                <Card key={addiction.id} className="bg-card/80 backdrop-blur border-primary/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {addiction.icon}
                        <span>{addiction.name}</span>
                      </CardTitle>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        {addiction.daysClean} dias limpo
                      </Badge>
                    </div>
                    <CardDescription>
                      Meta: {addiction.totalDays} dias sem {addiction.name.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={addiction.progress} className="h-2 bg-primary/20" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progresso: {addiction.progress}%</span>
                      <span className="text-muted-foreground">
                        Economia: {formatCurrency(addiction.moneySaved)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}