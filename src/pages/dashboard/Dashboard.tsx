
import React from "react";
import { useNavigate } from "react-router-dom";
import { useStudents } from "@/contexts/StudentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { students, observations } = useStudents();
  const navigate = useNavigate();

  // Calculate stats
  const studentCount = students.length;
  const observationCount = observations.length;
  
  // Count by type
  const observationsByType = observations.reduce((acc, obs) => {
    acc[obs.tipo] = (acc[obs.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  
  // Function to count students by class
  const countStudentsByClass = () => {
    const classes: Record<string, number> = {};
    students.forEach(student => {
      classes[student.turma] = (classes[student.turma] || 0) + 1;
    });
    return classes;
  };
  
  const classCounts = countStudentsByClass();

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">{formattedDate}</p>
        </div>
        
        {user?.role === "coordinator" && (
          <div className="mt-4 md:mt-0">
            <Button onClick={() => navigate("/students/new")}>
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Cadastrar Aluno
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Students card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total de Alunos</CardTitle>
            <CardDescription>Cadastros ativos no sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-app-blue-500">{studentCount}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/students")}>
              Ver alunos
            </Button>
          </CardFooter>
        </Card>

        {/* Observations card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total de Observações</CardTitle>
            <CardDescription>Registros de acompanhamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-app-blue-500">{observationCount}</div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/observations")}>
              Ver observações
            </Button>
          </CardFooter>
        </Card>

        {/* Recent activity card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Tipos de Observações</CardTitle>
            <CardDescription>Distribuição por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(observationsByType).map(([type, count]) => (
                <li key={type} className="flex justify-between items-center">
                  <span className="capitalize">{type}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/reports")}>
              Ver relatórios
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Classes distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Turmas</CardTitle>
            <CardDescription>
              Número de alunos por turma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(classCounts).map(([className, count]) => (
                <div key={className} className="flex items-center gap-4">
                  <div className="font-medium min-w-[100px]">{className}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-app-blue-500 h-2.5 rounded-full"
                      style={{ width: `${(count / studentCount) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-muted-foreground min-w-[30px] text-right">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent observations */}
        <Card>
          <CardHeader>
            <CardTitle>Observações Recentes</CardTitle>
            <CardDescription>
              Últimos registros adicionados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {observations
                .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                .slice(0, 3)
                .map((obs) => {
                  const student = students.find(s => s.id === obs.alunoId);
                  return (
                    <div key={obs.id} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">
                          {student?.nome || "Aluno não encontrado"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(obs.data).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{obs.texto}</p>
                      <div className="flex items-center mt-2 text-xs">
                        <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full">
                          {obs.tipo}
                        </span>
                        <span className="ml-2 text-muted-foreground">por {obs.autor}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full" onClick={() => navigate("/observations")}>
              Ver todas as observações
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
