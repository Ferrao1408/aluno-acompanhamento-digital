
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useStudents } from "@/contexts/StudentContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

const ObservationList: React.FC = () => {
  const { students, observations } = useStudents();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  
  // Filter observations based on user role and visibility
  const filteredObservations = observations.filter((obs) => {
    // Apply visibility filter based on user role
    if (user?.role !== "coordinator" && user?.role !== "admin") {
      if (
        obs.visibilidade === "coordenacao" ||
        (obs.visibilidade === "professores" && user?.role !== "teacher")
      ) {
        return false;
      }
    }
    
    // Apply search term filter
    if (searchTerm !== "") {
      const student = students.find((s) => s.id === obs.alunoId);
      const matchesSearchTerm =
        obs.texto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student && student.nome.toLowerCase().includes(searchTerm.toLowerCase()));
        
      if (!matchesSearchTerm) {
        return false;
      }
    }
    
    // Apply type filter
    if (typeFilter !== "" && obs.tipo !== typeFilter) {
      return false;
    }
    
    return true;
  });
  
  // Sort observations by date (newest first)
  const sortedObservations = [...filteredObservations].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Observações</h1>
          <p className="text-muted-foreground mt-1">
            {filteredObservations.length} observações disponíveis
          </p>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por aluno ou conteúdo"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os tipos</SelectItem>
                  <SelectItem value="geral">Geral</SelectItem>
                  <SelectItem value="comportamento">Comportamento</SelectItem>
                  <SelectItem value="academico">Acadêmico</SelectItem>
                  <SelectItem value="atendimento">Atendimento</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {sortedObservations.length > 0 ? (
        <div className="space-y-6">
          {sortedObservations.map((obs) => {
            const student = students.find((s) => s.id === obs.alunoId);
            return (
              <Card key={obs.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {student ? (
                          <Link to={`/students/${student.id}`} className="hover:underline text-app-blue-500">
                            {student.nome}
                          </Link>
                        ) : (
                          "Aluno não encontrado"
                        )}
                      </CardTitle>
                      <CardDescription>
                        Turma: {student?.turma || "N/A"} | {new Date(obs.data).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs rounded-full px-2 py-1 bg-gray-100 capitalize">
                        {obs.tipo}
                      </div>
                      <div className="text-xs rounded-full px-2 py-1 bg-gray-100">
                        {obs.visibilidade === "coordenacao"
                          ? "Coordenação"
                          : obs.visibilidade === "professores"
                            ? "Professores"
                            : "Todos"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{obs.texto}</p>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Adicionado por: {obs.autor}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">
            Nenhuma observação encontrada com os filtros atuais.
          </p>
        </Card>
      )}
    </div>
  );
};

export default ObservationList;
