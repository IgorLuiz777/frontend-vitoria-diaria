'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Heart, User, AtSign, MapPin, Calendar, ArrowRight, ArrowLeft, KeyRound, ImagePlus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useSupabaseAuth } from '@/hooks/use-supabase';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const registerSchema = z.object({
  step1: z.object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    username: z.string()
      .min(3, 'Username deve ter pelo menos 3 caracteres')
      .max(30, 'Username deve ter no máximo 30 caracteres')
      .regex(/^[a-z0-9._]+$/, 'Username deve conter apenas letras minúsculas, números, ponto e underscore'),
    age: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 18, {
      message: 'Você deve ter pelo menos 18 anos',
    }),
    city: z.string().min(2, 'Cidade é obrigatória'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  }),
  step2: z.object({
    bio: z.string().max(500, 'Bio deve ter no máximo 500 caracteres').optional(),
    image: z.string().optional(),
  }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useSupabaseAuth();
  const router = useRouter();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      step1: {
        name: '',
        username: '',
        age: '',
        city: '',
        email: '',
        password: '',
      },
      step2: {
        bio: '',
        image: '',
      },
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    if (step === 1) {
      setStep(2);
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await signUp(
        data.step1.email, 
        data.step1.password, 
        {
          name: data.step1.name,
          username: data.step1.username,
          age: data.step1.age,
          city: data.step1.city,
          bio: data.step2.bio || '',
          image_url: data.step2.image || ''
        }
      );
      
      if (error) {
        toast.error('Erro ao criar conta', {
          description: error.message
        });
        return;
      }
      
      toast.success('Conta criada com sucesso!', {
        description: 'Você já pode fazer login com suas credenciais.'
      });
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Erro ao criar conta');
    } finally {
      setIsLoading(false);
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
              <span className="text-2xl font-bold">Vida Nova</span>
            </Link>
          </div>
          <div className="text-center">
            <CardTitle className="text-2xl">Criar Conta</CardTitle>
            <CardDescription>
              {step === 1 
                ? 'Preencha seus dados principais para começar'
                : 'Personalize seu perfil (opcional)'
              }
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {step === 1 ? (
                <>
                  <FormField
                    control={form.control}
                    name="step1.name"
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
                    name="step1.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="seu@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="step1.username"
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
                      name="step1.age"
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
                      name="step1.city"
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
                    name="step1.password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <KeyRound className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input type="password" placeholder="••••••" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    Próximo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="step2.bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Conte um pouco sobre você..."
                            className="resize-none"
                            disabled={isLoading}
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
                    name="step2.image"
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
                              disabled={isLoading}
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

                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setStep(1)}
                      disabled={isLoading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Voltar
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-1 bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Finalizar Cadastro'
                      )}
                    </Button>
                  </div>
                </>
              )}

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Já tem uma conta?{' '}
                  <Link href="/login" className="text-primary hover:underline">
                    Entrar
                  </Link>
                </p>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </main>
  );
}