
import React, { useState } from "react";
import { Link } from "react-router-dom";
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
  Badge,
} from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BookOpen, Target, Clock, User, Plus, Search } from "lucide-react";

const PedagogicalPlanList: React.FC = () => {
  const { students, pedagogicalPlans, goals, getGoalsForPlan } = useStudents();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Filter plans based on search and status
  const filteredPlans = pedagogicalPlans.filter(plan => {
    const student = students.find(s => s.id === plan.alunoId);
    const matchesSearch = 
      plan.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && plan.ativo) ||
      (statusFilter === "inactive" && !plan.ativo);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate plan statistics
  const getPlanStats = (planId: string) => {
    const planGoals = getGoalsForPlan(planId);
    const completed = planGoals.filter(goal => goal.status === "concluido").length;
    const inProgress = planGoals.filter(goal => goal.status === "em_andamento").length;
    const notStarted = planGoals.filter(goal => goal.status === "nao_iniciado").length;
    
    return { total: planGoals.length, completed, inProgress, notStarted };
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  // Get status badge color
  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BookOpen className="mr-3 h-8 w-8" />
            Acompanhamento Pedagógico
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie planos, metas e evolução dos alunos
          </p>
        </div>

        {(user?.role === "coordinator" || user?.role === "admin") && (
          <Link to="/pedagogical/new">
            <Button>
              <Plus className="h-5 w-5 mr-2" />
              Novo Plano
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por plano, aluno ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total de Planos</p>
                <p className="text-2xl font-bold">{pedagogicalPlans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Planos Ativos</p>
                <p className="text-2xl font-bold">
                  {pedagogicalPlans.filter(plan => plan.ativo).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Alunos em Acompanhamento</p>
                <p className="text-2xl font-bold">
                  {new Set(pedagogicalPlans.filter(plan => plan.ativo).map(plan => plan.alunoId)).size}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Metas Totais</p>
                <p className="text-2xl font-bold">{goals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plans List */}
      {filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all" 
                ? "Nenhum plano encontrado com os filtros aplicados."
                : "Nenhum plano pedagógico cadastrado ainda."
              }
            </p>
            {(user?.role === "coordinator" || user?.role === "admin") && (
              <Link to="/pedagogical/new">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Plano
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlans.map((plan) => {
            const student = students.find(s => s.id === plan.alunoId);
            const stats = getPlanStats(plan.id);
            
            return (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{plan.titulo}</CardTitle>
                      <CardDescription className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {student?.nome} - {student?.turma}
                      </CardDescription>
                    </div>
                    {getStatusBadge(plan.ativo)}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {plan.descricao}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Início:</span>
                      <span>{formatDate(plan.dataInicio)}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Responsável:</span>
                      <span>{plan.criador}</span>
                    </div>
                    
                    {stats.total > 0 && (
                      <div className="pt-3 border-t">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium">Progresso das Metas</span>
                          <span className="text-sm text-muted-foreground">
                            {stats.completed}/{stats.total}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>✅ {stats.completed} concluídas</span>
                          <span>🔄 {stats.inProgress} em andamento</span>
                          <span>⏳ {stats.notStarted} não iniciadas</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Link to={`/pedagogical/${plan.id}`}>
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PedagogicalPlanList;
