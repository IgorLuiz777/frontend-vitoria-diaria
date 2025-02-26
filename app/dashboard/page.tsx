'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Heart, Plus, Cigarette, Beer, Coffee, Trophy, Calendar, Flame, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const newAddictionSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  dailyCost: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Custo diário deve ser um número positivo',
  }),
  goalDays: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'Meta de dias deve ser um número positivo',
  }),
});

type NewAddictionForm = z.infer<typeof newAddictionSchema>;

interface Addiction {
  id: string;
  name: string;
  icon: React.ReactNode;
  checkIns: number;
  streak: number;
  nextGoal: {
    days: number;
    reward: number;
  };
  progress: number;
  saved: number;
}

export default function Dashboard() {
  const form = useForm<NewAddictionForm>({
    resolver: zodResolver(newAddictionSchema),
    defaultValues: {
      name: '',
      dailyCost: '',
      goalDays: '',
    },
  });

  const onSubmit = (data: NewAddictionForm) => {
    console.log(data);
    // Implementar lógica de cadastro do novo vício aqui
  };

  const addictions: Addiction[] = [
    {
      id: 'smoking',
      name: 'Cigarro',
      icon: <Cigarette className="h-5 w-5" />,
      checkIns: 15,
      streak: 7,
      nextGoal: {
        days: 30,
        reward: 500,
      },
      progress: 65,
      saved: 150,
    },
    {
      id: 'alcohol',
      name: 'Álcool',
      icon: <Beer className="h-5 w-5" />,
      checkIns: 22,
      streak: 15,
      nextGoal: {
        days: 60,
        reward: 1000,
      },
      progress: 75,
      saved: 450,
    },
    {
      id: 'caffeine',
      name: 'Cafeína',
      icon: <Coffee className="h-5 w-5" />,
      checkIns: 10,
      streak: 3,
      nextGoal: {
        days: 15,
        reward: 200,
      },
      progress: 35,
      saved: 75,
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
            <Dialog>
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
                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                      Começar Controle
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="bg-card/80 backdrop-blur border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Check-ins Totais</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{addictions.reduce((acc, curr) => acc + curr.checkIns, 0)}</div>
              <p className="text-xs text-muted-foreground">
                +12 na última semana
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card/80 backdrop-blur border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maior Sequência</CardTitle>
              <Flame className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.max(...addictions.map(a => a.streak))} dias</div>
              <p className="text-xs text-muted-foreground">
                Álcool - 15 dias sem consumo
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
                +{formatCurrency(250)} este mês
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={addictions[0].id} className="space-y-6">
          <TabsList className="bg-card/80 backdrop-blur border-primary/20">
            {addictions.map((addiction) => (
              <TabsTrigger
                key={addiction.id}
                value={addiction.id}
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {addiction.icon}
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
                      Meta: {addiction.nextGoal.days} dias sem {addiction.name.toLowerCase()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={addiction.progress} className="h-2 bg-primary/20" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{addiction.streak} dias</span>
                      <span className="text-muted-foreground">{addiction.nextGoal.days} dias</span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                      <div>
                        <p className="text-sm font-medium">Recompensa</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency(addiction.nextGoal.reward)}
                        </p>
                      </div>
                      <Button className="bg-primary hover:bg-primary/90">
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
                        <p className="text-2xl font-bold">{addiction.checkIns}</p>
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
                        <p className="text-sm text-muted-foreground">Recaídas</p>
                        <p className="text-2xl font-bold">2</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}