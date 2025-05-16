
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const ObservationList: React.FC = () => {
  const { students, observations, addObservation } = useStudents();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New observation form state
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [newObservationText, setNewObservationText] = useState("");
  const [observationType, setObservationType] = useState<"geral" | "comportamento" | "academico" | "atendimento" | "saude">("geral");
  const [visibility, setVisibility] = useState<"coordenacao" | "professores" | "todos">("todos");
  
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
    if (typeFilter !== "" && typeFilter !== "all" && obs.tipo !== typeFilter) {
      return false;
    }
    
    return true;
  });
  
  // Sort observations by date (newest first)
  const sortedObservations = [...filteredObservations].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  // Handle form submission
  const handleAddObservation = async () => {
    if (!selectedStudentId) {
      toast({
        title: "Erro",
        description: "Selecione um aluno",
        variant: "destructive",
      });
      return;
    }

    if (!newObservationText.trim()) {
      toast({
        title: "Erro",
        description: "O texto da observação não pode estar vazio",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addObservation({
        alunoId: selectedStudentId,
        data: new Date().toISOString(),
        texto: newObservationText.trim(),
        tipo: observationType,
        visibilidade: visibility,
        autor: user?.name || "Usuário do sistema",
      });
      
      // Reset form
      setNewObservationText("");
      setObservationType("geral");
      setVisibility("todos");
      setSelectedStudentId("");
      setDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Observação adicionada com sucesso",
      });
    } catch (error) {
      console.error("Error adding observation:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao adicionar a observação",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Observações</h1>
          <p className="text-muted-foreground mt-1">
            {filteredObservations.length} observações disponíveis
          </p>
        </div>
        
        {/* Add new observation button for teachers and coordinators */}
        {user && (user.role === "teacher" || user.role === "coordinator" || user.role === "admin") && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nova Observação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Observação</DialogTitle>
                <DialogDescription>
                  Registre uma nova observação sobre um aluno
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="student" className="font-medium">
                    Aluno
                  </label>
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                    <SelectTrigger id="student">
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.nome} - {student.turma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="observation" className="font-medium">
                    Texto da Observação
                  </label>
                  <Textarea
                    id="observation"
                    value={newObservationText}
                    onChange={(e) => setNewObservationText(e.target.value)}
                    placeholder="Digite sua observação aqui..."
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="type" className="font-medium">
                      Tipo
                    </label>
                    <Select
                      value={observationType}
                      onValueChange={(value) => setObservationType(value as any)}
                    >
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="geral">Geral</SelectItem>
                        <SelectItem value="comportamento">Comportamento</SelectItem>
                        <SelectItem value="academico">Acadêmico</SelectItem>
                        <SelectItem value="atendimento">Atendimento</SelectItem>
                        <SelectItem value="saude">Saúde</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="visibility" className="font-medium">
                      Visibilidade
                    </label>
                    <Select
                      value={visibility}
                      onValueChange={(value) => setVisibility(value as any)}
                    >
                      <SelectTrigger id="visibility">
                        <SelectValue placeholder="Selecione a visibilidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coordenacao">Somente Coordenação</SelectItem>
                        <SelectItem value="professores">Professores e Coordenação</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="button" 
                  onClick={handleAddObservation} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
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
                  <SelectItem value="all">Todos os tipos</SelectItem>
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
                  
                  {/* Ações de observação apenas para coordenação e admin */}
                  {(user?.role === "coordinator" || user?.role === "admin") && (
                    <div className="mt-4 flex gap-2 justify-end">
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-50">
                        Excluir
                      </Button>
                    </div>
                  )}
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
