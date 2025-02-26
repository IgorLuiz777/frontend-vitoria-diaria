'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Heart, LogIn, Menu, Target, Trophy, UserPlus, Wallet, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [progress] = useState(65);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-primary/20 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">Vida Nova</span>
            </div>

            {/* Desktop Menu */}
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection('inicio')}
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('objetivos')}
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Objetivos
              </button>
              <button
                onClick={() => scrollToSection('conquistas')}
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                Conquistas
              </button>
            </nav>

            {/* Auth Links */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-foreground/80 hover:text-primary" size="sm">
                  <LogIn className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-primary hover:bg-primary/90" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Cadastrar
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground/80 hover:text-primary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-primary/20">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <nav className="flex flex-col gap-4">
                <button
                  onClick={() => scrollToSection('inicio')}
                  className="text-foreground/80 hover:text-primary transition-colors text-left"
                >
                  Início
                </button>
                <button
                  onClick={() => scrollToSection('objetivos')}
                  className="text-foreground/80 hover:text-primary transition-colors text-left"
                >
                  Objetivos
                </button>
                <button
                  onClick={() => scrollToSection('conquistas')}
                  className="text-foreground/80 hover:text-primary transition-colors text-left"
                >
                  Conquistas
                </button>
              </nav>
              <div className="flex flex-col gap-2 pt-4 border-t border-primary/20">
                <Link href="/login">
                  <Button variant="ghost" className="w-full text-foreground/80 hover:text-primary justify-start" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="w-full bg-primary hover:bg-primary/90 justify-start" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Cadastrar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="min-h-screen bg-gradient-to-b from-background via-secondary/50 to-primary/10 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div id="inicio" className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-primary">Vida Nova</h1>
            <p className="text-muted-foreground text-lg">
              Transforme seus vícios em conquistas e seja recompensado por isso
            </p>
          </div>

          <div id="objetivos" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-card/80 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-6 w-6 text-primary" />
                  Sua Saúde em Primeiro Lugar
                </CardTitle>
                <CardDescription>
                  Acompanhe seu progresso diário
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={progress} className="h-2 bg-primary/20" />
                  <p className="text-sm text-muted-foreground">
                    {progress}% do seu objetivo alcançado
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">{formatCurrency(1250)}</span>
                    <span className="text-sm text-muted-foreground">economizados até agora</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-6 w-6 text-primary" />
                  Metas Atuais
                </CardTitle>
                <CardDescription>
                  Seus objetivos em andamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div className="flex-1">
                      <p className="font-medium">7 dias sem cigarro</p>
                      <p className="text-sm text-muted-foreground">Recompensa: {formatCurrency(150)}</p>
                    </div>
                  </li>
                  <li className="flex items-center gap-4">
                    <div className="h-2 w-2 rounded-full bg-primary/60" />
                    <div className="flex-1">
                      <p className="font-medium">30 dias sem bebidas alcoólicas</p>
                      <p className="text-sm text-muted-foreground">Recompensa: {formatCurrency(500)}</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card id="conquistas" className="bg-card/80 backdrop-blur border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  Conquistas
                </CardTitle>
                <CardDescription>
                  Suas vitórias até agora
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Wallet className="h-10 w-10 text-primary" />
                    <div>
                      <p className="font-medium">Economia Total</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(3500)}</p>
                    </div>
                  </div>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    Iniciar Novo Desafio
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4 text-primary">Comece Sua Jornada Hoje</h2>
            <p className="text-muted-foreground mb-6">
              Invista em sua saúde e bem-estar. Cada pequeno passo conta.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Cadastrar Novo Objetivo
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}