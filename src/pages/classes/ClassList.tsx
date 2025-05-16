
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useClasses } from "@/contexts/ClassContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Users } from "lucide-react";

const ClassList: React.FC = () => {
  const { classes, loading, deleteClass } = useClasses();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const canManageClasses = user?.role === 'admin' || user?.role === 'coordinator';

  const handleDelete = async (id: string, className: string) => {
    if (!canManageClasses) return;
    
    if (window.confirm(`Tem certeza que deseja excluir a turma "${className}"?`)) {
      try {
        setIsDeleting(true);
        await deleteClass(id);
        toast({
          title: "Turma excluída",
          description: `A turma ${className} foi excluída com sucesso.`,
        });
      } catch (error) {
        console.error("Erro ao excluir turma:", error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir",
          description: "Não foi possível excluir a turma. Tente novamente.",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gerenciamento de Turmas</h1>
          <p className="text-gray-600">Gerencie as turmas da escola</p>
        </div>
        {canManageClasses && (
          <Button onClick={() => navigate("/classes/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Turma
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-app-blue-500"></div>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-800">Nenhuma turma cadastrada</h3>
          <p className="mt-2 text-gray-600">Crie uma nova turma para começar.</p>
          {canManageClasses && (
            <Button className="mt-4" onClick={() => navigate("/classes/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Série</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Ano Letivo</TableHead>
                <TableHead className="w-24 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.nome}</TableCell>
                  <TableCell>{cls.serie}</TableCell>
                  <TableCell>{cls.periodo}</TableCell>
                  <TableCell>{cls.turno}</TableCell>
                  <TableCell>{cls.anoLetivo}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/classes/${cls.id}`)}
                        title="Ver detalhes"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      {canManageClasses && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate(`/classes/edit/${cls.id}`)}
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(cls.id, cls.nome)}
                            disabled={isDeleting}
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default ClassList;
