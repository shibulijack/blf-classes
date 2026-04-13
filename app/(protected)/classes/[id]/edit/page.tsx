import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getClassById } from "@/lib/classes/queries";
import { ClassForm } from "@/components/classes/ClassForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditClassPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/");

  const { id } = await params;
  const cls = await getClassById(id, session.residentId);

  if (!cls) notFound();
  if (cls.created_by !== session.residentId) redirect(`/classes/${id}`);

  return <ClassForm mode="edit" classData={cls} />;
}
