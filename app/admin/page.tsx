import { checkAdminAccess } from "@/lib/actions/auth";
import { getSaidas } from "@/lib/actions/saidas";
import { Admin } from "./page-data";
import { getData } from "./utils";

export default async function AdminPage() {
  await checkAdminAccess();
  const saidas = await getSaidas();
  const { diasAula, mediaSaidasPorDia } = getData(saidas);

  return <Admin diasAula={diasAula} mediaSaidasPorDia={mediaSaidasPorDia} />;
}
