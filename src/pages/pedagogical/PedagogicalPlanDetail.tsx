
import React, { useState } from "react";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Badge,
} from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  BookOpen, 
  Target, 
  Calendar, 
  User, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy
} from "lucide-react";

const PedagogicalPlanDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    students,
    pedagogicalPlans,
    goals,
    milestones,
    getGoalsForPlan,
    getMilestonesForPlan,
    addGoal,
    updateGoal,
    deleteGoal,
    addMilestone,
    deletePedagogicalPlan
  } = useStudents();

  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Goal form state
  const [goalForm, setGoalForm] = useState({
    titulo: "",
    descricao: "",
    dataPrevisao: "",
    prioridade: "media" as "baixa" | "media" | "alta",
    observacoes: ""
  });

  // Milestone form state
  const [milestoneForm, setMilestoneForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "atividade" as "avaliacao" | "atividade" | "comportamento" | "academico"
  });

  const plan = pedagogicalPlans.find(p => p.id === id);
  const student = plan ? students.find(s => s.id === plan.alunoId) : null;
  const planGoals = plan ? getGoalsForPlan(plan.id) : [];
  const planMilestones = plan ? getMilestonesForPlan(plan.id) : [];

  if (!plan || !student || !id) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-2xl font-semibold mb-4">Plano não encontrado</h2>
        <Button onClick={() => navigate("/pedagogical")}>Voltar para lista</Button>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  // Get status badge
  const getGoalStatusBadge = (status: string) => {
    const statusConfig = {
      "nao_iniciado": { label: "Não Iniciado", color: "bg-gray-100 text-gray-800" },
      "em_andamento": { label: "Em Andamento", color: "bg-blue-100 text-blue-800" },
      "concluido": { label: "Concluído", color: "bg-green-100 text-green-800" },
      "suspenso": { label: "Suspenso", color: "bg-red-100 text-red-800" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "alta": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "media": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "baixa": return <Target className="h-4 w-4 text-green-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle goal creation
  const handleCreateGoal = async () => {
    if (!goalForm.titulo.trim() || !goalForm.descricao.trim() || !goalForm.dataPrevisao) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addGoal({
        planoId: plan.id,
        titulo: goalForm.titulo.trim(),
        descricao: goalForm.descricao.trim(),
        dataInicio: new Date().toISOString(),
        dataPrevisao: new Date(goalForm.dataPrevisao).toISOString(),
        status: "nao_iniciado",
        prioridade: goalForm.prioridade,
        responsavel: user?.name || "Sistema",
        observacoes: goalForm.observacoes.trim() || undefined
      });
      
      setGoalForm({
        titulo: "",
        descricao: "",
        dataPrevisao: "",
        prioridade: "media",
        observacoes: ""
      });
      setGoalDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Meta adicionada com sucesso",
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a meta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle milestone creation
  const handleCreateMilestone = async () => {
    if (!milestoneForm.titulo.trim() || !milestoneForm.descricao.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addMilestone({
        planoId: plan.id,
        titulo: milestoneForm.titulo.trim(),
        descricao: milestoneForm.descricao.trim(),
        data: new Date().toISOString(),
        tipo: milestoneForm.tipo,
        autor: user?.name || "Sistema"
      });
      
      setMilestoneForm({
        titulo: "",
        descricao: "",
        tipo: "atividade"
      });
      setMilestoneDialogOpen(false);
      
      toast({
        title: "Sucesso",
        description: "Marco adicionado com sucesso",
      });
    } catch (error) {
      console.error("Error creating milestone:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar o marco",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle goal status update
  const handleUpdateGoalStatus = async (goalId: string, newStatus: string) => {
    setIsSubmitting(true);
    
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "concluido") {
        updateData.dataConclusao = new Date().toISOString();
      }
      
      await updateGoal(goalId, updateData);
      
      toast({
        title: "Sucesso",
        description: "Status da meta atualizado",
      });
    } catch (error) {
      console.error("Error updating goal status:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar o status",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate plan statistics
  const stats = {
    total: planGoals.length,
    completed: planGoals.filter(goal => goal.status === "concluido").length,
    inProgress: planGoals.filter(goal => goal.status === "em_andamento").length,
    notStarted: planGoals.filter(goal => goal.status === "nao_iniciado").length,
    suspended: planGoals.filter(goal => goal.status === "suspenso").length
  };

  // Create timeline combining goals and milestones
  const timelineItems = [
    ...planGoals.map(goal => ({
      id: goal.id,
      type: "goal" as const,
      date: goal.dataConclusao || goal.dataPrevisao,
      title: goal.titulo,
      description: goal.descricao,
      status: goal.status,
      priority: goal.prioridade,
      author: goal.responsavel
    })),
    ...planMilestones.map(milestone => ({
      id: milestone.id,
      type: "milestone" as const,
      date: milestone.data,
      title: milestone.titulo,
      description: milestone.descricao,
      milestoneType: milestone.tipo,
      author: milestone.autor
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2"
              onClick={() => navigate("/pedagogical")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold">{plan.titulo}</h1>
          </div>
          <p className="text-muted-foreground">
            <User className="inline h-4 w-4 mr-1" />
            {student.nome} - {student.turma} | Criado por {plan.criador}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex space-x-2">
          {(user?.role === "coordinator" || user?.role === "admin") && (
            <>
              <Link to={`/pedagogical/edit/${id}`}>
                <Button variant="outline">
                  <Edit className="h-5 w-5 mr-2" />
                  Editar
                </Button>
              </Link>

              <Button 
                variant="outline" 
                className="border-red-500 text-red-500 hover:bg-red-50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-5 w-5 mr-2" />
                Excluir
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="goals">Metas ({planGoals.length})</TabsTrigger>
          <TabsTrigger value="timeline">Timeline ({timelineItems.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="animate-fade-in">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Plan Information */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Plano</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Descrição</p>
                    <p className="font-medium">{plan.descricao}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Objetivo Geral</p>
                    <p className="font-medium">{plan.objetivoGeral}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Data de Início</p>
                      <p className="font-medium">{formatDate(plan.dataInicio)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={plan.ativo ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                        {plan.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  
                  {plan.observacoes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Observações</p>
                      <p className="font-medium whitespace-pre-wrap">{plan.observacoes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Statistics */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Trophy className="h-5 w-5 mr-2" />
                    Progresso das Metas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.total === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Nenhuma meta cadastrada
                    </p>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600">
                          {Math.round((stats.completed / stats.total) * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground">Concluído</p>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-green-600 h-3 rounded-full transition-all duration-300" 
                          style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                        ></div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-600">✅ Concluídas</span>
                          <span className="font-medium">{stats.completed}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">🔄 Em andamento</span>
                          <span className="font-medium">{stats.inProgress}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">⏳ Não iniciadas</span>
                          <span className="font-medium">{stats.notStarted}</span>
                        </div>
                        {stats.suspended > 0 && (
                          <div className="flex justify-between">
                            <span className="text-red-600">⏸️ Suspensas</span>
                            <span className="font-medium">{stats.suspended}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Metas</h2>
            
            <Dialog open={goalDialogOpen} onOpenChange={setGoalDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  Nova Meta
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Meta</DialogTitle>
                  <DialogDescription>
                    Crie uma nova meta para {student.nome}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="font-medium">Título da Meta</label>
                    <Input
                      value={goalForm.titulo}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Melhorar interpretação de texto"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-medium">Descrição</label>
                    <Textarea
                      value={goalForm.descricao}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva detalhadamente o que deve ser alcançado..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="font-medium">Data Prevista</label>
                      <Input
                        type="date"
                        value={goalForm.dataPrevisao}
                        onChange={(e) => setGoalForm(prev => ({ ...prev, dataPrevisao: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-medium">Prioridade</label>
                      <Select
                        value={goalForm.prioridade}
                        onValueChange={(value) => setGoalForm(prev => ({ ...prev, prioridade: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-medium">Observações (opcional)</label>
                    <Textarea
                      value={goalForm.observacoes}
                      onChange={(e) => setGoalForm(prev => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Informações adicionais sobre a meta..."
                      rows={2}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGoalDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateGoal} disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar Meta"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {planGoals.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma meta cadastrada para este plano.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {planGoals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center">
                          {getPriorityIcon(goal.prioridade)}
                          <span className="ml-2">{goal.titulo}</span>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Responsável: {goal.responsavel} | Previsão: {formatDate(goal.dataPrevisao)}
                        </CardDescription>
                      </div>
                      {getGoalStatusBadge(goal.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{goal.descricao}</p>
                    
                    {goal.observacoes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Observações:</p>
                        <p className="text-sm whitespace-pre-wrap">{goal.observacoes}</p>
                      </div>
                    )}
                    
                    {goal.dataConclusao && (
                      <div className="mb-4 text-sm text-green-600">
                        ✅ Concluída em {formatDate(goal.dataConclusao)}
                      </div>
                    )}
                    
                    <div className="flex justify-end gap-2">
                      <Select
                        value={goal.status}
                        onValueChange={(value) => handleUpdateGoalStatus(goal.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nao_iniciado">Não Iniciado</SelectItem>
                          <SelectItem value="em_andamento">Em Andamento</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="suspenso">Suspenso</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="timeline" className="animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Timeline de Evolução</h2>
            
            <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-5 w-5 mr-2" />
                  Novo Marco
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Marco</DialogTitle>
                  <DialogDescription>
                    Registre um novo marco na evolução de {student.nome}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="font-medium">Título</label>
                    <Input
                      value={milestoneForm.titulo}
                      onChange={(e) => setMilestoneForm(prev => ({ ...prev, titulo: e.target.value }))}
                      placeholder="Ex: Primeira avaliação de matemática"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-medium">Descrição</label>
                    <Textarea
                      value={milestoneForm.descricao}
                      onChange={(e) => setMilestoneForm(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descreva o que aconteceu..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="font-medium">Tipo</label>
                    <Select
                      value={milestoneForm.tipo}
                      onValueChange={(value) => setMilestoneForm(prev => ({ ...prev, tipo: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="avaliacao">Avaliação</SelectItem>
                        <SelectItem value="atividade">Atividade</SelectItem>
                        <SelectItem value="comportamento">Comportamento</SelectItem>
                        <SelectItem value="academico">Acadêmico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setMilestoneDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateMilestone} disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar Marco"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {timelineItems.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Nenhum evento registrado na timeline.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {timelineItems.map((item, index) => (
                <div key={item.id} className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center
                      ${item.type === "goal" 
                        ? "bg-blue-100 text-blue-600" 
                        : "bg-green-100 text-green-600"
                      }
                    `}>
                      {item.type === "goal" ? <Target className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                    </div>
                    {index < timelineItems.length - 1 && (
                      <div className="w-px h-16 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  <Card className="flex-1">
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{item.title}</h3>
                        <div className="text-sm text-muted-foreground">
                          {formatDateTime(item.date)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {item.description}
                      </p>
                      
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline">
                          {item.type === "goal" ? "Meta" : "Marco"}
                        </Badge>
                        
                        {item.type === "goal" && (
                          <>
                            {getGoalStatusBadge(item.status)}
                            <span className="text-muted-foreground">
                              Prioridade: {item.priority}
                            </span>
                          </>
                        )}
                        
                        {item.type === "milestone" && (
                          <Badge variant="outline" className="capitalize">
                            {item.milestoneType}
                          </Badge>
                        )}
                        
                        <span className="text-muted-foreground">
                          Por: {item.author}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este plano pedagógico? Esta ação não pode ser desfeita e todas as metas e marcos relacionados também serão excluídos.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  await deletePedagogicalPlan(plan.id);
                  toast({
                    title: "Sucesso",
                    description: "Plano pedagógico excluído com sucesso",
                  });
                  navigate("/pedagogical");
                } catch (error) {
                  toast({
                    title: "Erro",
                    description: "Ocorreu um erro ao excluir o plano",
                    variant: "destructive",
                  });
                } finally {
                  setIsSubmitting(false);
                }
              }}
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

export default PedagogicalPlanDetail;
