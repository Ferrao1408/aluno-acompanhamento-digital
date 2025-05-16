
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

// In a real app, these would be fetched from an API
const mockUsers = [
  {
    id: "1",
    name: "Coordenador Escolar",
    email: "coordenador@escola.edu.br",
    role: "coordinator",
  },
  {
    id: "2",
    name: "Professor Silva",
    email: "professor@escola.edu.br",
    role: "teacher",
  },
  {
    id: "3",
    name: "Equipe Busca Ativa",
    email: "buscaativa@escola.edu.br",
    role: "busca_ativa",
  },
  {
    id: "4",
    name: "Administrador Sistema",
    email: "admin@escola.edu.br",
    role: "admin",
  }
];

const UserList: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "teacher" as "coordinator" | "teacher" | "admin" | "busca_ativa"
  });

  // Redirect if not admin
  if (user?.role !== "admin") {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Acesso negado. Esta página é restrita para administradores.
        </h1>
      </div>
    );
  }

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would be an API call
    const createdUser = {
      ...newUser,
      id: (users.length + 1).toString(),
    };

    setUsers([...users, createdUser]);
    setNewUser({
      name: "",
      email: "",
      role: "teacher",
    });
    setIsDialogOpen(false);

    toast({
      title: "Sucesso",
      description: "Usuário criado com sucesso!",
    });
  };

  const handleEditUser = (userId: string) => {
    // In a real app, this would navigate to an edit page or open an edit dialog
    toast({
      description: `Edição do usuário ${userId} será implementada em breve.`,
    });
  };

  const handleDeleteUser = (userId: string) => {
    // In a real app, this would show a confirmation dialog first
    setUsers(users.filter(u => u.id !== userId));
    toast({
      description: "Usuário removido com sucesso!",
    });
  };

  const roleLabels: Record<string, string> = {
    coordinator: "Coordenador",
    teacher: "Professor",
    busca_ativa: "Busca Ativa",
    admin: "Administrador"
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Novo Usuário</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
              <DialogDescription>
                Preencha os dados para cadastrar um novo usuário no sistema.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Perfil
                </Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: "coordinator" | "teacher" | "admin" | "busca_ativa") => 
                    setNewUser({ ...newUser, role: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione um perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="coordinator">Coordenador</SelectItem>
                    <SelectItem value="teacher">Professor</SelectItem>
                    <SelectItem value="busca_ativa">Busca Ativa</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser}>Criar Usuário</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <Card key={u.id} className="transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{u.name}</CardTitle>
              <div className="text-sm text-muted-foreground">{u.email}</div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="px-2.5 py-0.5 bg-app-blue-100 text-app-blue-700 rounded-full text-xs">
                  {roleLabels[u.role]}
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleEditUser(u.id)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span className="sr-only">Editar</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteUser(u.id)}
                    className="text-destructive hover:bg-destructive/10"
                    disabled={u.email === user?.email} // Can't delete yourself
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span className="sr-only">Deletar</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default UserList;
