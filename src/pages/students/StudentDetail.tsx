import React, { useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useStudents } from "@/contexts/StudentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Target, Calendar } from "lucide-react";

type ObservationType = "geral" | "comportamento" | "academico" | "atendimento" | "saude";
type VisibilityType = "coordenacao" | "professores" | "todos";

const StudentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getStudent, 
    getObservationsForStudent, 
    deleteStudent, 
    addObservation, 
    deleteObservation,
    getActivePlanForStudent,
    getPedagogicalPlansForStudent,
    getGoalsForPlan
  } = useStudents();
  const { user } = useAuth();
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteObsDialogOpen, setDeleteObsDialogOpen] = useState(false);
  const [selectedObservation, setSelectedObservation] = useState<string | null>(null);
  const [newObservation, setNewObservation] = useState("");
  const [observationType, setObservationType] = useState<ObservationType>("geral");
  const [visibility, setVisibility] = useState<VisibilityType>("coordenacao");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const student = getStudent(id || "");

  if (!student || !id) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-semibold mb-4">Aluno não encontrado</h2>
        <Button onClick={() => navigate("/students")}>Voltar para lista</Button>
      </div>
    );
  }

  const observations = getObservationsForStudent(id);
  const activePlan = getActivePlanForStudent(id);
  const allPlans = getPedagogicalPlansForStudent(id);

  // Calculate student risk level based on observations
  const riskAssessment = useMemo(() => {
    const behaviorCount = observations.filter(obs => obs.tipo === "comportamento").length;
    
    if (behaviorCount >= 5) {
      return { level: "high", label: "Alto", color: "text-red-600 bg-red-50" };
    } else if (behaviorCount >= 3) {
      return { level: "medium", label: "Médio", color: "text-orange-600 bg-orange-50" };
    } else if (behaviorCount >= 1) {
      return { level: "low", label: "Baixo", color: "text-yellow-600 bg-yellow-50" };
    } else {
      return { level: "none", label: "Nenhum", color: "text-green-600 bg-green-50" };
    }
  }, [observations]);

  // Get student age based on birth date
  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Check if user can see specific observation based on visibility setting
  const canViewObservation = (visibilityLevel: VisibilityType) => {
    if (!user) return false;
    if (visibilityLevel === "todos") return true;
    if (user.role === "coordinator" || user.role === "admin") return true;
    if (visibilityLevel === "professores" && user.role === "teacher") return true;
    return false;
  };

  // Check if user can edit/delete specific observation
  const canEditObservation = () => {
    if (!user) return false;
    return user.role === "coordinator" || user.role === "admin";
  };

  // Handle adding new observation
  const handleAddObservation = async () => {
    if (!newObservation.trim()) {
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
        alunoId: id,
        data: new Date().toISOString(),
        texto: newObservation.trim(),
        tipo: observationType,
        visibilidade: visibility,
        autor: user?.name || "Usuário do sistema",
      });
      
      setNewObservation("");
      setObservationType("geral");
      setVisibility("coordenacao");
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

  // Handle student deletion
  const handleDeleteStudent = async () => {
    setIsSubmitting(true);
    
    try {
      await deleteStudent(id);
      toast({
        title: "Sucesso",
        description: "Aluno excluído com sucesso",
      });
      navigate("/students");
    } catch (error) {
      console.error("Error deleting student:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir o aluno",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle observation deletion
  const handleDeleteObservation = async () => {
    if (!selectedObservation) return;
    
    setIsSubmitting(true);
    
    try {
      await deleteObservation(selectedObservation);
      setDeleteObsDialogOpen(false);
      setSelectedObservation(null);
      
      toast({
        title: "Sucesso",
        description: "Observação excluída com sucesso",
      });
    } catch (error) {
      console.error("Error deleting observation:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a observação",
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
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate("/students")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Button>
            <h1 className="text-3xl font-bold">{student.nome}</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Código: {student.codigo} | Turma: {student.turma} | {student.periodo}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-2">
          {(user?.role === "coordinator" || user?.role === "admin") && (
            <>
              <Link to={`/students/edit/${id}`}>
                <Button variant="outline">
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
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                  Editar
                </Button>
              </Link>

              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => setDeleteDialogOpen(true)}
              >
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList className="mb-6">
          <TabsTrigger value="info">Informações</TabsTrigger>
          <TabsTrigger value="observations">Observações ({observations.length})</TabsTrigger>
          <TabsTrigger value="pedagogical">Acompanhamento Pedagógico</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Informações do aluno</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{student.nome}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                    <p className="font-medium">
                      {formatDate(student.dataNascimento)} ({calculateAge(student.dataNascimento)} anos)
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{student.cpf || "Não informado"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Registro da Escola</p>
                    <p className="font-medium">{student.registroEscola || "Não informado"}</p>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <p className="text-sm text-muted-foreground">Endereço</p>
                    <p className="font-medium">{student.endereco}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dados Escolares</CardTitle>
                <CardDescription>Informações acadêmicas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Código</p>
                    <p className="font-medium">{student.codigo}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Turma</p>
                    <p className="font-medium">{student.turma}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Período</p>
                    <p className="font-medium">{student.periodo}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                    <p className="font-medium">{formatDate(student.dataCadastro)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Responsável</CardTitle>
                <CardDescription>Informações do responsável legal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{student.responsavel}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{student.cpfResponsavel || "Não informado"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{student.telefone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Avaliação de risco */}
            <Card className={riskAssessment.color}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Avaliação de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nível de Risco</p>
                    <p className="text-sm">Baseado em observações de comportamento</p>
                  </div>
                  <div className="text-lg font-medium">
                    {riskAssessment.label}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm">
                    {observations.filter(obs => obs.tipo === "comportamento").length} observação(ões) de comportamento
                  </div>
                  
                  <div className="mt-2 text-sm">
                    {riskAssessment.level === "high" && (
                      <p>Requer atenção imediata e acompanhamento contínuo.</p>
                    )}
                    {riskAssessment.level === "medium" && (
                      <p>Recomenda-se acompanhamento regular.</p>
                    )}
                    {riskAssessment.level === "low" && (
                      <p>Situação sob controle, mas manter observação.</p>
                    )}
                    {riskAssessment.level === "none" && (
                      <p>Sem problemas de comportamento registrados.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="observations" className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Observações</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
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
                  <DialogTitle>Adicionar Observação</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova observação para {student.nome}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="observation" className="font-medium">
                      Texto da Observação
                    </label>
                    <Textarea
                      id="observation"
                      value={newObservation}
                      onChange={(e) => setNewObservation(e.target.value)}
                      placeholder="Digite sua observação aqui..."
                      rows={5}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="type" className="font-medium">
                        Tipo
                      </label>
                      <Select
                        value={observationType}
                        onValueChange={(value) => setObservationType(value as ObservationType)}
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
                        onValueChange={(value) => setVisibility(value as VisibilityType)}
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
                  <Button type="button" onClick={handleAddObservation} disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {observations.length === 0 ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">
                Nenhuma observação registrada para este aluno.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {observations
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .map((obs) => {
                  // Check if current user can view this observation
                  if (!canViewObservation(obs.visibilidade)) {
                    return null;
                  }
                  
                  return (
                    <Card key={obs.id} className={obs.tipo === "comportamento" ? "border-yellow-200" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg capitalize">
                              {obs.tipo}
                            </CardTitle>
                            <CardDescription>
                              {formatDate(obs.data)} | Por: {obs.autor}
                            </CardDescription>
                          </div>
                          <div className="text-xs rounded-full px-2 py-1 bg-gray-100">
                            {obs.visibilidade === "coordenacao"
                              ? "Coordenação"
                              : obs.visibilidade === "professores"
                                ? "Professores"
                                : "Todos"}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="whitespace-pre-wrap mb-3">{obs.texto}</div>
                        
                        {/* Ações de observação para usuários com permissão */}
                        {canEditObservation() && (
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 border-red-500 hover:bg-red-50"
                              onClick={() => {
                                setSelectedObservation(obs.id);
                                setDeleteObsDialogOpen(true);
                              }}
                            >
                              Excluir
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pedagogical" className="animate-fade-in">
          <div className="space-y-6">
            {/* Active Plan Section */}
            {activePlan ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center text-green-700">
                        <BookOpen className="h-5 w-5 mr-2" />
                        Plano Ativo
                      </CardTitle>
                      <CardDescription>Acompanhamento pedagógico em andamento</CardDescription>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">{activePlan.titulo}</h3>
                      <p className="text-muted-foreground">{activePlan.descricao}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Objetivo:</span>
                        <p className="text-muted-foreground">{activePlan.objetivoGeral}</p>
                      </div>
                      <div>
                        <span className="font-medium">Início:</span>
                        <p className="text-muted-foreground">{formatDate(activePlan.dataInicio)}</p>
                      </div>
                      <div>
                        <span className="font-medium">Criado por:</span>
                        <p className="text-muted-foreground">{activePlan.criador}</p>
                      </div>
                      <div>
                        <span className="font-medium">Metas:</span>
                        <p className="text-muted-foreground">
                          {(() => {
                            const goals = getGoalsForPlan(activePlan.id);
                            const completed = goals.filter(g => g.status === "concluido").length;
                            return `${completed}/${goals.length} concluídas`;
                          })()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Link to={`/pedagogical/${activePlan.id}`}>
                        <Button variant="outline">
                          <Target className="h-4 w-4 mr-2" />
                          Ver Detalhes do Plano
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Nenhum Plano Ativo</h3>
                  <p className="text-muted-foreground mb-4">
                    Este aluno não possui um plano pedagógico ativo no momento.
                  </p>
                  {(user?.role === "coordinator" || user?.role === "admin") && (
                    <Link to={`/pedagogical/new?student=${id}`}>
                      <Button>
                        <BookOpen className="h-4 w-4 mr-2" />
                        Criar Plano Pedagógico
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Historical Plans */}
            {allPlans.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Histórico de Planos
                  </CardTitle>
                  <CardDescription>Planos pedagógicos anteriores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {allPlans
                      .filter(plan => !plan.ativo)
                      .sort((a, b) => new Date(b.dataInicio).getTime() - new Date(a.dataInicio).getTime())
                      .map((plan) => (
                        <div key={plan.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{plan.titulo}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(plan.dataInicio)} - {plan.dataFim ? formatDate(plan.dataFim) : "Indefinido"}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Inativo</Badge>
                            <Link to={`/pedagogical/${plan.id}`}>
                              <Button variant="outline" size="sm">
                                Ver Detalhes
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para confirmar exclusão de aluno */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita e todas as observações 
              relacionadas a este aluno também serão excluídas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteStudent}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão de observação */}
      <Dialog open={deleteObsDialogOpen} onOpenChange={setDeleteObsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta observação? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteObsDialogOpen(false);
                setSelectedObservation(null);
              }}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteObservation}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Excluindo..." : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentDetail;
