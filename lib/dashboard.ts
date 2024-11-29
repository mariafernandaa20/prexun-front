import { Building, PieChart, Users } from "lucide-react";

export const dashboard_navigation = [
  {
    name: "Dashboard",
    url: "/dashboard",
    icon: PieChart,
  },
  {
    name: "Planteles",
    url: "/dashboard/planteles",
    icon: Building,
  },
  {
    name: "Usuarios",
    url: "/dashboard/usuarios",
    icon: Users,
  },
];
