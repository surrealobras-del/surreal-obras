"use client";

import { AppLayout } from "@/components/app-layout";
import { CreateWorkForm } from "./components/create-work-form";

export default function CriarObraPage() {
  return (
    <AppLayout>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Criar Nova Obra
        </h1>
        <CreateWorkForm />
      </div>
    </AppLayout>
  );
}
