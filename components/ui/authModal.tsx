'use client';

import { GenericModal } from './genericModal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { authClient } from '@/lib/auth-client';

export function AuthModal() {
  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const { data, error } = await authClient.signUp.email({
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      callbackURL: 'http://localhost:3000',
    });

    console.log('Data', data);
    console.log('Error', error);
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const { data, error } = await authClient.signIn.email({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      callbackURL: 'http://localhost:3000',
    });

    console.log('Data', data);
    console.log('Error', error);
  };

  return (
    <>
      <GenericModal
        title="Modal de inicio de sesión"
        trigger={
          <Button>
            Log in <LogIn />
          </Button>
        }
      >
        <Tabs defaultValue="login" className="max-w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
            <TabsTrigger value="register">Crear cuenta</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="w-full min-w-xs">
              <CardHeader>
                <CardTitle>Iniciar sesión</CardTitle>
                <CardDescription>
                  Introduce tus datos para acceder a tu cuenta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLoginSubmit}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor="password">Contraseña</Label>
                        <a
                          href="#"
                          className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </a>
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Iniciar sesión
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="register">
            <Card className="w-full min-w-xs">
              <CardHeader>
                <CardTitle>¡Regístrate!</CardTitle>
                <CardDescription>
                  Crea tu cuenta para comenzar a acortar enlaces.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegisterSubmit}>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">Nombre de usuario</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                      Crear cuenta
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </GenericModal>
    </>
  );
}
