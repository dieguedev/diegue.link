'use client';

import { GenericModal } from './genericModal';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './card';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

export function AuthModal() {
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
                <form>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
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
                      <Input id="password" type="password" required />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                  Iniciar sesión
                </Button>
              </CardFooter>
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
                <form>
                  <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">Nombre de usuario</Label>
                      <Input id="username" type="text" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input id="password" type="password" required />
                    </div>
                  </div>
                </form>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button type="submit" className="w-full">
                  Crear cuenta
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </GenericModal>
    </>
  );
}
