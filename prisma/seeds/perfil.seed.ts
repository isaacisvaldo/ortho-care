// Define a interface para o objeto de perfil.
export interface Profile {
  id: string;
  name: string;
  label: string;
  description: string;
  permissions: string[]; 
}


export const profilesData: Profile[] = [
  {
    id: "profile_admin",
    name: "GENERAL_ADMIN",
    label: "Administrador Geral",
    description: "Acesso total ao sistema com a meta-permissão de 'Acesso Total'.",
    permissions: [
      "full.access", 
    ],
  },
];
