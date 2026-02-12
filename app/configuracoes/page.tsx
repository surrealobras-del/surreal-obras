"use client";

import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { ChangePasswordDialog } from "./components/change-password-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeyRound } from "lucide-react";

export default function ConfiguracoesPage() {
  const [open, setOpen] = useState(false);

  return (
    <AppLayout>
      <div className="flex flex-col w-full">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Configurações
        </h1>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                <CardTitle>Segurança</CardTitle>
              </div>
              <CardDescription>
                Gerencie suas configurações de segurança e senha
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Senha de acesso</p>
                  <p className="text-sm text-muted-foreground">
                    Altere sua senha de acesso ao sistema
                  </p>
                </div>
                <Button onClick={() => setOpen(true)} variant="outline">
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <ChangePasswordDialog open={open} onOpenChange={setOpen} />
      </div>
    </AppLayout>
  );
}
