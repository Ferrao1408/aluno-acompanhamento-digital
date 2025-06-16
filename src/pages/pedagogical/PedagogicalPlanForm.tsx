
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, BookOpen, Save } from "lucide-react";

const PedagogicalPlanForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    students,
    pedagogicalPlans,
    addPedagogicalPlan,
    updatePedagogicalPlan
  } = useStudents();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    alunoId: "",
    titulo: "",
    descricao: "",
    dataInicio: "",
    dataFim: "",
    ativo: true,
    objetivoGeral: "",
    observacoes: ""
  });

  const isEdit = !!id;
  const plan = isEdit ? pedagogicalPlans.find(p => p.id === id) : null;

  // Load plan data for editing
  useEffect(() => {
    if (isEdit && plan) {
      setFormData({
        alunoId: plan.alunoId,
        titulo: plan.titulo,
        descricao: plan.descricao,
        dataInicio: plan.dataInicio.split('T')[0], // Convert to date format
        dataFim: plan.dataFim ? plan.dataFim.split('T')[0] : "",
        ativo: plan.ativo,
        objetivoGeral: plan.objetivoGeral,
        observacoes: plan.observacoes || ""
      });
    }
  }, [isEdit, plan]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.alunoId || !formData.titulo.trim() || !formData.descricao.trim() || 
        !formData.dataInicio || !formData.objetivoGeral.trim()) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const planData = {
        alunoId: formData.alunoId,
        titulo: formData.titulo.trim(),
        descricao: formData.descricao.trim(),
        dataInicio: new Date(formData.dataInicio).toISOString(),
        dataFim: formData.dataFim ? new Date(formData.dataFim).toISOString() : undefined,
        ativo: formData.ativo,
        criador: user?.name || "Sistema",
        objetivoGeral: formData.objetivoGeral.trim(),
        observacoes: formData.observacoes.trim() || undefined
      };

      if (isEdit && plan) {
        await updatePedagogicalPlan(plan.id, planData);
        toast({
          title: "Sucesso",
          description: "Plano pedagógico atualizado com sucesso",
        });
      } else {
        await addPedagogicalPlan(planData);
        toast({
          title: "Sucesso",
          description: "Plano pedagógico criado com sucesso",
        });
      }
      
      navigate("/pedagogical");
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o plano",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get available students (exclude those with active plans, unless editing current plan)
  const availableStudents = students.filter(student => {
    if (isEdit && plan && student.id === plan.alunoId) {
      return true; // Allow current student in edit mode
    }
    
    const hasActivePlan = pedagogicalPlans.some(p => 
      p.alunoId === student.id && p.ativo && (!isEdit || p.id !== id)
    );
    return !hasActivePlan;
  });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate("/pedagogical")}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BookOpen className="mr-3 h-8 w-8" />
            {isEdit ? "Editar Plano Pedagógico" : "Novo Plano Pedagógico"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEdit ? "Atualize as informações do plano" : "Crie um plano de acompanhamento individualizado"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Plano</CardTitle>
              <CardDescription>
                Preencha as informações básicas do plano pedagógico
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student Selection */}
                <div className="space-y-2">
                  <label htmlFor="student" className="text-sm font-medium">
                    Aluno *
                  </label>
                  <Select
                    value={formData.alunoId}
                    onValueChange={(value) => handleInputChange("alunoId", value)}
                    disabled={isEdit} // Don't allow changing student in edit mode
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStudents.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.nome} - {student.turma}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!isEdit && availableStudents.length === 0 && (
                    <p className="text-sm text-amber-600">
                      Todos os alunos já possuem planos ativos. Desative um plano existente para criar um novo.
                    </p>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Título do Plano *
                  </label>
                  <Input
                    id="title"
                    value={formData.titulo}
                    onChange={(e) => handleInputChange("titulo", e.target.value)}
                    placeholder="Ex: Plano de Reforço em Matemática"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Descrição *
                  </label>
                  <Textarea
                    id="description"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    placeholder="Descreva brevemente o plano pedagógico..."
                    rows={3}
                    required
                  />
                </div>

                {/* General Objective */}
                <div className="space-y-2">
                  <label htmlFor="objective" className="text-sm font-medium">
                    Objetivo Geral *
                  </label>
                  <Textarea
                    id="objective"
                    value={formData.objetivoGeral}
                    onChange={(e) => handleInputChange("objetivoGeral", e.target.value)}
                    placeholder="Descreva o objetivo principal que se espera alcançar com este plano..."
                    rows={4}
                    required
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="startDate" className="text-sm font-medium">
                      Data de Início *
                    </label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.dataInicio}
                      onChange={(e) => handleInputChange("dataInicio", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="endDate" className="text-sm font-medium">
                      Data Prevista de Fim (opcional)
                    </label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.dataFim}
                      onChange={(e) => handleInputChange("dataFim", e.target.value)}
                      min={formData.dataInicio}
                    />
                  </div>
                </div>

                {/* Observations */}
                <div className="space-y-2">
                  <label htmlFor="observations" className="text-sm font-medium">
                    Observações Adicionais
                  </label>
                  <Textarea
                    id="observations"
                    value={formData.observacoes}
                    onChange={(e) => handleInputChange("observacoes", e.target.value)}
                    placeholder="Informações adicionais relevantes sobre o plano..."
                    rows={3}
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="active"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => handleInputChange("ativo", checked)}
                  />
                  <label htmlFor="active" className="text-sm font-medium">
                    Plano ativo
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/pedagogical")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || (availableStudents.length === 0 && !isEdit)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting 
                      ? (isEdit ? "Atualizando..." : "Criando...") 
                      : (isEdit ? "Atualizar Plano" : "Criar Plano")
                    }
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar with Tips */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>💡 Dicas para um Bom Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">📋 Título Claro</h4>
                <p className="text-muted-foreground">
                  Use um título que identifique facilmente o foco do plano, como "Reforço em Matemática" ou "Desenvolvimento de Leitura".
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">🎯 Objetivos Específicos</h4>
                <p className="text-muted-foreground">
                  Defina objetivos claros e mensuráveis que possam ser acompanhados através de metas específicas.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">📅 Prazos Realistas</h4>
                <p className="text-muted-foreground">
                  Estabeleça prazos realistas considerando a complexidade das dificuldades e o ritmo do aluno.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">📝 Documentação</h4>
                <p className="text-muted-foreground">
                  Após criar o plano, adicione metas específicas e registre marcos importantes na timeline.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview Selected Student */}
          {formData.alunoId && (
            <Card>
              <CardHeader>
                <CardTitle>👤 Aluno Selecionado</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const selectedStudent = students.find(s => s.id === formData.alunoId);
                  if (!selectedStudent) return null;
                  
                  return (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Nome:</span> {selectedStudent.nome}
                      </div>
                      <div>
                        <span className="font-medium">Turma:</span> {selectedStudent.turma}
                      </div>
                      <div>
                        <span className="font-medium">Período:</span> {selectedStudent.periodo}
                      </div>
                      <div>
                        <span className="font-medium">Responsável:</span> {selectedStudent.responsavel}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PedagogicalPlanForm;
