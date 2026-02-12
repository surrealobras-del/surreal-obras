"use client";

import { AppLayout } from "@/components/app-layout";
import { WorkDetails } from "./components/work-details";
import { useParams } from "next/navigation";

export default function WorkDetailPage() {
  const params = useParams();
  const workId = params.id as string;

  return (
    <AppLayout>
      <div className="flex flex-col">
        <WorkDetails workId={workId} />
      </div>
    </AppLayout>
  );
}
