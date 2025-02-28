"use client";

import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar, ChevronDown, LogOut, Search, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { signOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/client";
import { getData } from "./utils";

export function Admin({
  diasAula: diasAulaInicial,
  mediaSaidasPorDia: mediaSaidasPorDiaInicial,
}: {
  diasAula: any[];
  mediaSaidasPorDia: number;
}) {
  const [diasAula, setDiasAula] = useState(diasAulaInicial);
  const [mediaSaidasPorDia, setMediaSaidasPorDia] = useState(
    mediaSaidasPorDiaInicial
  );
  const supabase = createClient();

  useEffect(() => {
    const channels = supabase
      .channel("custom-insert-channel")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "saidas" },
        (payload) => {
          const newData = getData([...diasAula, payload.new]);
          setDiasAula(newData.diasAula);
          setMediaSaidasPorDia(newData.mediaSaidasPorDia);
        }
      )
      .subscribe();

    return () => {
      channels.unsubscribe();
    };
  }, [supabase, diasAula]);

  return (
    <main className="min-h-screen p-4 sm:p-8 bg-gradient-to-br from-background via-background to-accent">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
              Dashboard Admin ✨
            </h1>
            <p className="text-sm text-muted-foreground">
              Controle de saídas antecipadas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <form action={signOut}>
              <Button variant="destructive" type="submit" className="group">
                <LogOut className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                Sair
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{diasAula.length}</h2>
                <p className="text-sm text-muted-foreground">Dias de Aula</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{mediaSaidasPorDia}</h2>
                <p className="text-sm text-muted-foreground">Media de Saídas</p>
              </div>
            </div>
          </Card>
        </div>

        <Suspense fallback={<div>Carregando...</div>}>
          <ListaSaidas diasAula={diasAula} />
        </Suspense>
      </div>
    </main>
  );
}

function ListaSaidas({ diasAula }: { diasAula: any[] }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Registros por Dia</h2>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou RA..." className="pl-9" />
        </div>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="space-y-4">
          {diasAula.map((dia, index) => (
            <Dialog key={index}>
              <DialogTrigger className="p-4 w-full rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Registro de saídas -{" "}
                      {new Date(dia.data).toLocaleDateString("pt-BR")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {dia.totalAlunos} alunos
                    </p>
                  </div>
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                </div>
              </DialogTrigger>
              <DialogContent
                id={`dialog-${index}`}
                className="max-w-6xl w-full"
              >
                <DialogHeader>
                  <DialogTitle>
                    Registro de saídas -{" "}
                    {new Date(dia.data).toLocaleDateString("pt-BR")}
                  </DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[60vh]">
                  <div className="mt-4 space-y-2 pr-4">
                    {dia.alunos
                      .sort((a: any, b: any) => a.nome.localeCompare(b.nome))
                      .map((aluno: any, alunoIndex: number) => (
                        <div
                          key={alunoIndex}
                          className="px-4 py-2 rounded-lg bg-accent/50"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h3 className="font-medium text-lg">
                                {aluno.nome}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                RA: {aluno.ra}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                {aluno.horarioSaida}
                              </p>
                              {aluno.motivo && (
                                <p className="text-sm text-muted-foreground">
                                  Motivo: {aluno.motivo}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
