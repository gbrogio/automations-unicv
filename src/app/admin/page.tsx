'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-toastify';
import { loginAction } from './actions';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    const response = await loginAction({ email, password });
    response?.length && toast.error(response);
  };

  return (
    <div className="text-center max-w-md mx-auto my-auto space-y-2">
      <h1 className="text-xl font-bold">Login</h1>
      <p className="text-muted-foreground text-sm">
        Entre com seu email e senha para acessar sua conta.
      </p>
      <Separator className="!my-4 w-1/2 mx-auto" />
      <form onSubmit={handleSubmit} className="text-left space-y-2">
        <div className="space-y-1">
          <Label htmlFor="email">Email*:</Label>
          <Input
            id="email"
            type="email"
            placeholder="seuemail@exemplo.com"
            value={email}
            required
            onChange={handleEmailChange}
            disabled={loading}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Senha*:</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            required
            onChange={handlePasswordChange}
            disabled={loading}
          />
        </div>
        <Button type="submit" className="!mt-4 w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
};
