"use client";

import { AppLayout } from "@/components/app-layout";
import { EditWorkForm } from "./components/edit-work-form";
import { useParams } from "next/navigation";

export default function EditWorkPage() {
  const params = useParams();
  const workId = params.id as string;

  return (
    <AppLayout>
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-primary mb-6">
          Editar Obra
        </h1>
        <EditWorkForm workId={workId} />
      </div>
    </AppLayout>
  );
}
