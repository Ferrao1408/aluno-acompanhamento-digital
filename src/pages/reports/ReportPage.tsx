
import React, { useState } from "react";
import { useStudents } from "@/contexts/StudentContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const ReportPage: React.FC = () => {
  const { students, observations } = useStudents();
  const { toast } = useToast();
  const [reportType, setReportType] = useState("observationsPerStudent");
  
  // Get unique classes
  const classes = Array.from(new Set(students.map(student => student.turma)));

  // Count observations per student
  const observationsPerStudent = students.map(student => {
    const studentObservations = observations.filter(obs => obs.alunoId === student.id);
    return {
      id: student.id,
      name: student.nome,
      turma: student.turma,
      observationCount: studentObservations.length,
    };
  }).sort((a, b) => b.observationCount - a.observationCount);

  // Count observations by type
  const observationsByType = observations.reduce((acc, obs) => {
    acc[obs.tipo] = (acc[obs.tipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Count observations by class
  const observationsByClass = observations.reduce((acc, obs) => {
    const student = students.find(s => s.id === obs.alunoId);
    if (student) {
      acc[student.turma] = (acc[student.turma] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Handle export to CSV
  const exportToCsv = () => {
    try {
      let csvContent = "";
      let filename = "";
      
      if (reportType === "observationsPerStudent") {
        csvContent = "Nome,Turma,Quantidade de Observações\n";
        observationsPerStudent.forEach(item => {
          csvContent += `"${item.name}","${item.turma}",${item.observationCount}\n`;
        });
        filename = "observacoes-por-aluno.csv";
      } else if (reportType === "observationsByType") {
        csvContent = "Tipo,Quantidade\n";
        Object.entries(observationsByType).forEach(([type, count]) => {
          csvContent += `"${type}",${count}\n`;
        });
        filename = "observacoes-por-tipo.csv";
      } else if (reportType === "observationsByClass") {
        csvContent = "Turma,Quantidade\n";
        Object.entries(observationsByClass).forEach(([className, count]) => {
          csvContent += `"${className}",${count}\n`;
        });
        filename = "observacoes-por-turma.csv";
      }
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Relatório exportado",
        description: `O arquivo ${filename} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground mt-1">
          Visualize e exporte dados sobre alunos e observações
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Selecionar Relatório</CardTitle>
          <CardDescription>
            Escolha o tipo de relatório que deseja visualizar
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo de relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="observationsPerStudent">
                  Observações por Aluno
                </SelectItem>
                <SelectItem value="observationsByType">
                  Observações por Tipo
                </SelectItem>
                <SelectItem value="observationsByClass">
                  Observações por Turma
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Button onClick={exportToCsv}>
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportType === "observationsPerStudent" && (
        <Card>
          <CardHeader>
            <CardTitle>Observações por Aluno</CardTitle>
            <CardDescription>
              Quantidade de observações registradas para cada aluno
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="table-container max-h-[600px] overflow-y-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Turma</th>
                    <th className="text-right">Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {observationsPerStudent.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.turma}</td>
                      <td className="text-right">{item.observationCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "observationsByType" && (
        <Card>
          <CardHeader>
            <CardTitle>Observações por Tipo</CardTitle>
            <CardDescription>
              Distribuição de observações por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th className="text-right">Quantidade</th>
                      <th className="text-right">Percentual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(observationsByType).map(([type, count]) => (
                      <tr key={type}>
                        <td className="capitalize">{type}</td>
                        <td className="text-right">{count}</td>
                        <td className="text-right">
                          {((count / observations.length) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="space-y-4">
                {Object.entries(observationsByType).map(([type, count]) => (
                  <div key={type} className="flex items-center gap-4">
                    <div className="font-medium min-w-[120px] capitalize">{type}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-app-blue-500 h-2.5 rounded-full"
                        style={{ width: `${(count / observations.length) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-muted-foreground min-w-[80px] text-right">
                      {count} ({((count / observations.length) * 100).toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {reportType === "observationsByClass" && (
        <Card>
          <CardHeader>
            <CardTitle>Observações por Turma</CardTitle>
            <CardDescription>
              Quantidade de observações em cada turma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Turma</th>
                      <th className="text-right">Quantidade</th>
                      <th className="text-right">Percentual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(observationsByClass).map(([className, count]) => (
                      <tr key={className}>
                        <td>{className}</td>
                        <td className="text-right">{count}</td>
                        <td className="text-right">
                          {((count / observations.length) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="space-y-4">
                {Object.entries(observationsByClass).map(([className, count]) => (
                  <div key={className} className="flex items-center gap-4">
                    <div className="font-medium min-w-[80px]">{className}</div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-app-blue-500 h-2.5 rounded-full"
                        style={{ width: `${(count / observations.length) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-sm text-muted-foreground min-w-[80px] text-right">
                      {count} ({((count / observations.length) * 100).toFixed(1)}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportPage;
