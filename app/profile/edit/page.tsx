'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Heart, User, AtSign, MapPin, Calendar, ImagePlus, Eye, EyeOff, Cigarette, Beer, Coffee, ShoppingBag, Smartphone, Gamepad, Candy, Ban, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUsers } from '@/hooks/use-users';
import { useAddictions } from '@/hooks/use-addictions';
import { useGoals } from '@/hooks/use-goals';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useSupabaseAuth } from '@/hooks/use-supabase';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  username: z.string()
    .min(3, 'Username deve ter pelo menos 3 caracteres')
    .max(30, 'Username deve ter no máximo 30 caracteres')
    .regex(/^[a-z0-9._]+$/, 'Username deve conter apenas letras minúsculas, números, ponto e underscore'),
  age: z.number(),
  city: z.string().min(2, 'Cidade é obrigatória'),
  bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
  image: z.string().optional(),
  addictionVisibility: z.record(z.boolean()),
  goalVisibility: z.record(z.boolean()),
});

type ProfileForm = z.infer<typeof profileSchema>;

interface Addiction {
  id: string;
  name: string;
  icon: React.ReactNode;
  visible: boolean;
}

export default function EditProfile() {
  const { user } = useSupabaseAuth()
  const { profile, loading, fetchProfile, updateProfile } = useUsers();
  const { addictions } = useAddictions();
  const { goals, toggleGoalVisibility } = useGoals();

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

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur'
  });

  const onSubmit = async (data: ProfileForm) => {
    try {
      if (profile) {
        await updateProfile({
          id: profile.id,
          name: data.name,
          username: data.username,
          age: data.age,
          city: data.city,
          bio: data.bio,
          image_url: data.image,
        }, data.addictionVisibility);
      }
      toast.success('Perfil atualizado!');
    } catch {
      toast.error('Falha para atualizar o perfil!');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || '',
        username: profile.username || '',
        age: profile.age || 0,
        city: profile.city || '',
        bio: profile.bio || '',
        image: profile.image_url || '',
        addictionVisibility: addictions.reduce((acc, addiction) => ({
          ...acc,
          [addiction.id]: addiction.visible,
        }), {}),
        goalVisibility: goals.reduce((acc, goal) => ({
          ...acc,
          [goal.id]: goal.visible,
        }), {}),
      });
    }
  }, [profile, addictions, goals, form]);

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
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
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/80 backdrop-blur border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Editar Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações e gerencie a visibilidade dos seus controles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome completo</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input placeholder="João Silva" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <AtSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input placeholder="joao.silva" className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Este será seu identificador único na plataforma
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Idade</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input type="number" min="18" placeholder="25" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="São Paulo" className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Conte um pouco sobre você..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Uma breve descrição sobre você (máximo 500 caracteres)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Foto de perfil</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <ImagePlus className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                              <Input
                                type="url"
                                placeholder="URL da sua foto"
                                className="pl-10"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Cole a URL de uma imagem para seu perfil
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Visibilidade dos Controles</h3>
                    <p className="text-sm text-muted-foreground">
                      Escolha quais controles ficarão visíveis em seu perfil público
                    </p>

                    <div className="space-y-4">
                      {addictions.map((addiction) => (
                        <FormField
                          key={addiction.id}
                          control={form.control}
                          name={`addictionVisibility.${addiction.id}`}
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="flex items-center space-x-3">
                                {getIconComponent(addiction.icon)}
                                <div className="space-y-0.5">
                                  <FormLabel className="text-base">
                                    {addiction.name}
                                  </FormLabel>
                                  <FormDescription>
                                    {field.value ? (
                                      <span className="flex items-center text-muted-foreground">
                                        <Eye className="mr-1 h-3 w-3" />
                                        Visível no perfil
                                      </span>
                                    ) : (
                                      <span className="flex items-center text-muted-foreground">
                                        <EyeOff className="mr-1 h-3 w-3" />
                                        Oculto no perfil
                                      </span>
                                    )}
                                  </FormDescription>
                                </div>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Visibilidade das Metas</h3>
                    <p className="text-sm text-muted-foreground">
                      Escolha quais metas ficarão visíveis em seu perfil público
                    </p>

                    <div className="space-y-4">
                      {goals.map((goal) => (
                        <FormField
                          key={goal.id}
                          control={form.control}
                          name={`goalVisibility.${goal.id}`}
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">
                                  {goal.name}
                                </FormLabel>
                                <FormDescription>
                                  {goal.visible ? (
                                    <span className="flex items-center text-muted-foreground">
                                      <Eye className="mr-1 h-3 w-3" />
                                      Visível no perfil
                                    </span>
                                  ) : (
                                    <span className="flex items-center text-muted-foreground">
                                      <EyeOff className="mr-1 h-3 w-3" />
                                      Oculto no perfil
                                    </span>
                                  )}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  checked={goal.visible}
                                  onCheckedChange={(checked) => toggleGoalVisibility(goal.id, checked)}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.history.back()}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
