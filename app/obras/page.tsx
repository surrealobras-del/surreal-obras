"use client";

import { AppLayout } from "@/components/app-layout";
import { WorksList } from "./components/works-list";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function ObrasPage() {
  return (
    <AppLayout>
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              Obras
            </h1>
            <p className="text-muted-foreground">
              Gerencie todas as obras cadastradas no sistema
            </p>
          </div>
          <Link href="/obras/criar">
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Obra
            </Button>
          </Link>
        </div>
        <WorksList />
      </div>
    </AppLayout>
  );
}
