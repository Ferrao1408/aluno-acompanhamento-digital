
import React, { useState, useMemo } from "react";
import { useStudents } from "@/contexts/StudentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const StudentReportPage: React.FC = () => {
  const { students, observations } = useStudents();
  const { user } = useAuth();
  const [classFilter, setClassFilter] = useState<string>("all");

  // Get unique class names for filtering
  const classes = useMemo(() => {
    const uniqueClasses = new Set<string>();
    students.forEach(student => {
      if (student.turma) {
        uniqueClasses.add(student.turma);
      }
    });
    return Array.from(uniqueClasses);
  }, [students]);

  // Filter students based on selected class
  const filteredStudents = useMemo(() => {
    if (classFilter === "all") {
      return students;
    }
    return students.filter(student => student.turma === classFilter);
  }, [students, classFilter]);

  // Data for observation types pie chart
  const observationTypeData = useMemo(() => {
    const typeCount: Record<string, number> = {
      geral: 0,
      comportamento: 0,
      academico: 0,
      atendimento: 0,
      saude: 0
    };

    // Count observations per type, filtering by class if needed
    observations.forEach(obs => {
      const student = students.find(s => s.id === obs.alunoId);
      if (student && (classFilter === "all" || student.turma === classFilter)) {
        typeCount[obs.tipo] = (typeCount[obs.tipo] || 0) + 1;
      }
    });

    return Object.keys(typeCount).map(type => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: typeCount[type]
    }));
  }, [observations, students, classFilter]);

  // Data for top students with most observations
  const studentObservationsData = useMemo(() => {
    const countByStudent: Record<string, { id: string, nome: string, count: number }> = {};
    
    // Count observations per student
    observations.forEach(obs => {
      const student = students.find(s => s.id === obs.alunoId);
      if (student && (classFilter === "all" || student.turma === classFilter)) {
        if (!countByStudent[student.id]) {
          countByStudent[student.id] = { id: student.id, nome: student.nome, count: 0 };
        }
        countByStudent[student.id].count++;
      }
    });
    
    // Sort by count and get top 10
    return Object.values(countByStudent)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(item => ({
        nome: item.nome.split(' ')[0],
        observacoes: item.count
      }));
  }, [observations, students, classFilter]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalObservations = observations.filter(obs => {
      const student = students.find(s => s.id === obs.alunoId);
      return student && (classFilter === "all" || student.turma === classFilter);
    }).length;

    const studentsWithObservations = new Set(
      observations
        .filter(obs => {
          const student = students.find(s => s.id === obs.alunoId);
          return student && (classFilter === "all" || student.turma === classFilter);
        })
        .map(obs => obs.alunoId)
    ).size;

    // Count behavior issues
    const behaviorIssues = observations.filter(obs => {
      const student = students.find(s => s.id === obs.alunoId);
      return student && 
             (classFilter === "all" || student.turma === classFilter) && 
             obs.tipo === "comportamento";
    }).length;

    return {
      totalStudents: filteredStudents.length,
      totalObservations,
      studentsWithObservations,
      behaviorIssues,
      observationsPerStudent: filteredStudents.length ? 
        (totalObservations / filteredStudents.length).toFixed(1) : "0"
    };
  }, [observations, students, filteredStudents, classFilter]);

  // Calculate risk alerts
  const riskAlerts = useMemo(() => {
    const studentRisks: {id: string, nome: string, turma: string, comportamento: number}[] = [];

    // Group observations by student
    const observationsByStudent: Record<string, {comportamento: number}> = {};
    
    observations.forEach(obs => {
      if (!observationsByStudent[obs.alunoId]) {
        observationsByStudent[obs.alunoId] = {comportamento: 0};
      }
      
      if (obs.tipo === "comportamento") {
        observationsByStudent[obs.alunoId].comportamento += 1;
      }
    });
    
    // Identify students at risk (3+ behavior issues)
    Object.entries(observationsByStudent).forEach(([studentId, counts]) => {
      if (counts.comportamento >= 3) {
        const student = students.find(s => s.id === studentId);
        if (student && (classFilter === "all" || student.turma === classFilter)) {
          studentRisks.push({
            id: student.id,
            nome: student.nome,
            turma: student.turma,
            comportamento: counts.comportamento
          });
        }
      }
    });
    
    return studentRisks.sort((a, b) => b.comportamento - a.comportamento);
  }, [observations, students, classFilter]);

  if (!user || (user.role !== "coordinator" && user.role !== "admin")) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
      </Card>
    );
  }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Relatórios e Análises</h1>
        <p className="text-muted-foreground mt-1">
          Visualize estatísticas e tendências dos alunos
        </p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Filtrar por Turma</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={classFilter}
              onValueChange={setClassFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas as turmas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as turmas</SelectItem>
                {classes.map((className) => (
                  <SelectItem key={className} value={className}>{className}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats.totalStudents}</p>
            <p className="text-muted-foreground text-sm">Total de alunos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats.totalObservations}</p>
            <p className="text-muted-foreground text-sm">Total registrado</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Média</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats.observationsPerStudent}</p>
            <p className="text-muted-foreground text-sm">Observações por aluno</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Comportamento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{summaryStats.behaviorIssues}</p>
            <p className="text-muted-foreground text-sm">Questões registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Observações</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={observationTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {observationTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} observações`, '']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Observações por Aluno</CardTitle>
            <CardDescription>Top 10 alunos com mais observações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={studentObservationsData}
                  layout="vertical"
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="observacoes" name="Observações" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Alertas de Risco
          </CardTitle>
          <CardDescription>
            Alunos com 3 ou mais observações de comportamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          {riskAlerts.length > 0 ? (
            <div className="space-y-4">
              {riskAlerts.map(student => (
                <Card key={student.id} className="border-red-200 bg-red-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{student.nome}</p>
                        <p className="text-sm text-muted-foreground">Turma: {student.turma}</p>
                      </div>
                      <div className="flex items-center bg-red-100 px-3 py-1 rounded-full">
                        <span className="text-red-600 font-medium">{student.comportamento} observações</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Nenhum aluno com alerta de risco identificado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentReportPage;
