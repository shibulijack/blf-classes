import dynamic from "next/dynamic";

const ClassForm = dynamic(() => import("@/components/classes/ClassForm").then((m) => m.ClassForm));

export default function NewClassPage() {
  return <ClassForm mode="create" />;
}
