import DashboardLayout from "../layouts/DashboardLayout";
import Alumnos from "./Alumnos";
import ListaArchivos from "./ListaArchivos";

function Director() {
  return (
    <DashboardLayout>
      <ListaArchivos />
    </DashboardLayout>
  );
}

export default Director;
