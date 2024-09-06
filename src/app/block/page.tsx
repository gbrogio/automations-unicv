"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function block() {
  return (
    <div className="w-full h-dvh flex items-center justify-center flex-col px-4 space-y-8">
      <p className="text-xl font-bold text-center">
        Opa.. O serviço não está disponível no momento por conta do horário ou
        do dispositivo utilizado!<br/><br/>Certifique-se de que esteja em um dispositivo
        móvel e que o horário seja entre 21:25 e 22:40!
      </p>
      <Button asChild>
        <Link href="/">Tentar Novamente</Link>
      </Button>
    </div>
  );
}
