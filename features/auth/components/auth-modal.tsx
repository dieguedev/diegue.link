'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimateSize } from '@/components/ui/animate-size';
import { Modal } from '@/components/ui/modal';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';

const TAB_CONTENT_CLASS = 'mt-0 flex py-6 min-w-[316px] max-w-[396px] flex-col gap-6';

interface AuthModalProps {
  trigger: React.ReactNode;
}

export function AuthModal({ trigger }: AuthModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  return (
    <Modal
      title="Modal de inicio de sesión"
      trigger={trigger}
      open={open}
      onOpenChange={setOpen}
    >
      <Tabs defaultValue="login">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
          <TabsTrigger value="register">Crear cuenta</TabsTrigger>
        </TabsList>
        <Card className="mt-2 py-0">
          <AnimateSize>
            <TabsContent value="login" className={TAB_CONTENT_CLASS}>
              <CardHeader>
                <CardTitle>Iniciar sesión</CardTitle>
                <CardDescription>
                  Introduce tus datos para acceder a tu cuenta.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm onSuccess={handleSuccess} />
              </CardContent>
            </TabsContent>
            <TabsContent value="register" className={TAB_CONTENT_CLASS}>
              <CardHeader>
                <CardTitle>¡Regístrate!</CardTitle>
                <CardDescription>
                  Crea tu cuenta para comenzar a acortar enlaces.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RegisterForm onSuccess={handleSuccess} />
              </CardContent>
            </TabsContent>
          </AnimateSize>
        </Card>
      </Tabs>
    </Modal>
  );
}
