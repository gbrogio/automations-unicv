"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ClipboardList, HelpCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { registrarSaida } from "@/lib/actions/saidas";
import { calculateDistance } from "@/lib/calculate-distance";

export default function Home() {
  const [nome, setNome] = useState("");
  const [ra, setRa] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [isWithinAllowedTime, setIsWithinAllowedTime] = useState(false);
  const [forceTimeDialog, setForceTimeDialog] = useState(false);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasRegisteredToday, setHasRegisteredToday] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user has already registered today
    const checkPreviousRegistration = () => {
      const lastExit = localStorage.getItem(`last_exit_${ra}`);
      if (lastExit) {
        const lastExitDate = new Date(lastExit);
        const today = new Date();
        if (lastExitDate.toDateString() === today.toDateString()) {
          setHasRegisteredToday(true);
        }
      }
    };

    if (ra) {
      checkPreviousRegistration();
    }

    // Update clock every second
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);

    // Previous localStorage and time check logic
    const savedNome = localStorage.getItem("studentName");
    const savedRa = localStorage.getItem("studentRa");
    if (savedNome) setNome(savedNome);
    if (savedRa) setRa(savedRa);

    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hours * 60 + minutes;
      const startTime = 0 * 60 + 25; // 21:25
      const endTime = 22 * 60 + 40;   // 22:40

      const isAllowed = currentTime >= startTime && currentTime <= endTime;
      setIsWithinAllowedTime(isAllowed);
      setForceTimeDialog(!isAllowed);
    };

    checkTime();
    const timeCheckInterval = setInterval(checkTime, 60000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(timeCheckInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');

    if (value.length <= 6) {
      setRa(value);
    } else if (value.length <= 10) {
      setRa(`${value.slice(0, 6)}-${value.slice(6, 10)}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!navigator.geolocation) {
			toast.error(
				"Geolocalização não é suportada pelo seu navegador. Chame a coordenação!",
			);
			return;
		}
    
    if (!nome || !ra) return;

    if (hasRegisteredToday) {
      toast.error("Você já registrou sua saída hoje!");
      return;
    }

    setShowReasonDialog(true);
  };

  const handleConfirmExit = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
          try {
            setIsSubmitting(true);
            const formData = new FormData();
            formData.append('nome', nome);
            formData.append('ra', ra);
            if (reason) formData.append('motivo', reason);
      
            const referenceLatitude = -23.41771;
            const referenceLongitude = -51.93889;
            const { latitude, longitude } = position.coords;
            const distance = calculateDistance(
              latitude,
              longitude,
              referenceLatitude,
              referenceLongitude,
            );
          if (distance <= 126) {
            await registrarSaida(formData).then((res) => {
              const [message, type] = res.split("?=");
              toast[type as 'error'](message);
            });
          } else {
            setIsSubmitting(false);
            toast.error(
              "Opa.. Você não está no local correto! Certifique-se de estar dentro da faculdade e tente novamente!",
            );
          }
          localStorage.setItem("studentName", nome);
          localStorage.setItem("studentRa", ra);
          localStorage.setItem(`last_exit_${ra}`, new Date().toISOString());
          
          setHasRegisteredToday(true);
          setShowReasonDialog(false);
          setReason("");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao registrar saída");
        } finally {
          setIsSubmitting(false);
        }
      },
			(error) => {
				setIsSubmitting(false);
				console.log(error);
				toast.error("Não foi possível obter a localização.");
			},
		);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-accent flex items-center justify-center h-full">
      {/* Header fixo */}
      <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-b z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <span className="font-semibold">Sistema de Saída</span>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {/* Conteúdo principal com padding-top para compensar o header fixo */}
      <div className="pt-16 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent mb-2">
              Partiu! 🚀
            </h1>
            <p className="text-sm text-muted-foreground">
              Registre sua saída e boa viagem!
            </p>
          </div>

          <Card className="p-6 sm:p-8 backdrop-blur-sm bg-card/50 border-accent">
            <div className="mb-6 text-center">
              <h2 className="text-lg font-medium mb-2">
                Hey! Precisa sair mais cedo? 🤔
              </h2>
              <p className="text-sm text-muted-foreground">
                Preencha seus dados abaixo para registrar sua saída antecipada.
                É rapidinho! ⚡
              </p>
              {hasRegisteredToday && (
                <p className="mt-2 text-sm text-destructive font-medium">
                  Você já registrou sua saída hoje!
                </p>
              )}
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium flex items-center gap-2">
                    Nome Completo <span className="text-xs">📝</span>
                  </label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Como você se chama?"
                    className="transition-all hover:border-primary/50"
                    required
                    disabled={hasRegisteredToday}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ra" className="text-sm font-medium flex items-center gap-2">
                    RA <span className="text-xs">🎓</span>
                  </label>
                  <Input
                    id="ra"
                    value={ra}
                    onChange={handleRaChange}
                    placeholder="000000 ou 000000-0000"
                    maxLength={11}
                    className="transition-all hover:border-primary/50"
                    required
                    disabled={hasRegisteredToday}
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full text-lg h-12 group"
                disabled={!isWithinAllowedTime || hasRegisteredToday || isSubmitting}
              >
                {isSubmitting ? (
                  "Registrando..."
                ) : hasRegisteredToday ? (
                  "Saída já registrada hoje"
                ) : (
                  <>
                    Confirmar Saída
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">
                      🚀
                    </span>
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="lg"
            className="fixed bottom-4 right-4 shadow-lg rounded-full h-14 w-14 p-0"
          >
            <HelpCircle className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="text-2xl flex items-center gap-2">
              Precisa de ajuda? 🤔
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Quando devo usar este sistema? 🕒</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>Use sempre que precisar sair antes do horário regular das aulas, 
                    seja para pegar ônibus, compromissos importantes ou emergências.</p>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4" />
                        Horário de Funcionamento:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        O sistema está disponível apenas entre <strong>21:25</strong> e <strong>22:40</strong>,
                        que é o horário mínimo de permanência estabelecido pelos professores.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Preciso avisar meus professores? 📚</AccordionTrigger>
                <AccordionContent>
                  Sim! Além de registrar sua saída aqui, comunique seus professores 
                  sobre sua necessidade de sair mais cedo.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Como funciona o registro? 📝</AccordionTrigger>
                <AccordionContent>
                  Basta preencher seu nome completo e RA. O sistema registrará 
                  automaticamente o horário da sua saída. Simples assim!
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Posso ver meus registros anteriores? 🔍</AccordionTrigger>
                <AccordionContent>
                  Os registros são mantidos pela administração. Se precisar consultar 
                  suas saídas anteriores, entre em contato com a coordenação.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>E se eu errar meus dados? 😅</AccordionTrigger>
                <AccordionContent>
                  Não se preocupe! Em caso de erro, informe imediatamente à 
                  coordenação para que possam corrigir seu registro.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={forceTimeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Horário não permitido
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              O sistema de registro de saída só está disponível entre <strong>21:25</strong> e <strong>22:40</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Este é o horário mínimo de permanência estabelecido pelos professores.
              Por favor, aguarde o horário adequado para registrar sua saída.
            </p>
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-2xl font-bold mb-1">{currentTime}</p>
              <p className="text-sm text-muted-foreground">Horário atual</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showReasonDialog} onOpenChange={setShowReasonDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Motivo da Saída (Opcional)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="reason" className="text-sm font-medium">
                Por que você precisa sair mais cedo?
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full min-h-[100px] p-3 rounded-md border"
                placeholder="Ex: Preciso pegar o último ônibus..."
                disabled={isSubmitting}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button 
                variant="outline" 
                onClick={() => handleConfirmExit()}
                disabled={isSubmitting}
              >
                Pular
              </Button>
              <Button 
                onClick={() => handleConfirmExit()}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registrando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}