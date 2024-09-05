import { cookies } from "next/headers";
import { Form } from "./components/form";

export const dynamic = "force-dynamic";

export default async function Home() {
	const cookiesStore = cookies();
	return <Form formSubmitted={cookiesStore.get("FORM_SUBMITTED")?.value} />;
}
