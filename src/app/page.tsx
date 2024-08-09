import { getStudents } from "./actions";
import { Form } from "./components/form";

export const dynamic = "force-dynamic";

export default async function Home() {
  const students = await getStudents();

	return <Form students={students} />;
}
