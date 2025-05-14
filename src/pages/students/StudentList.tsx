
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useStudents } from "@/contexts/StudentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const StudentList: React.FC = () => {
  const { students } = useStudents();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  
  // Get unique classes for filtering
  const classes = Array.from(new Set(students.map(student => student.turma)));
  
  // Filter students based on search term and class filter
  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === "" || 
      student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesClass = classFilter === "" || student.turma === classFilter;
    
    return matchesSearch && matchesClass;
  });

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Alunos</h1>
          <p className="text-muted-foreground mt-1">
            {filteredStudents.length} alunos cadastrados no sistema
          </p>
        </div>

        {user?.role === "coordinator" && (
          <div className="mt-4 md:mt-0">
            <Link to="/students/new">
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
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                Novo Aluno
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Busca Ativa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por nome, código ou CPF"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas as turmas</SelectItem>
                  {classes.map((className) => (
                    <SelectItem key={className} value={className}>{className}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="rounded-tl-md">Código</th>
              <th>Nome</th>
              <th>Turma</th>
              <th>Responsável</th>
              <th>Telefone</th>
              <th className="rounded-tr-md">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td>{student.codigo}</td>
                  <td>{student.nome}</td>
                  <td>{student.turma}</td>
                  <td>{student.responsavel}</td>
                  <td>{student.telefone}</td>
                  <td>
                    <div className="flex space-x-2">
                      <Link to={`/students/${student.id}`}>
                        <Button variant="outline" size="sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </Button>
                      </Link>
                      
                      {user?.role === "coordinator" && (
                        <Link to={`/students/edit/${student.id}`}>
                          <Button variant="outline" size="sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
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
                          </Button>
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-muted-foreground">
                  Nenhum aluno encontrado com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredStudents.length > 10 && (
        <div className="mt-4 flex justify-center">
          <Button variant="outline">Carregar mais</Button>
        </div>
      )}
    </div>
  );
};

export default StudentList;
