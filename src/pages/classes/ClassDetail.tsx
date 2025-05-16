
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useClasses } from "@/contexts/ClassContext";
import { useStudents } from "@/contexts/StudentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Edit, Plus, Trash2, User, UserPlus, UserMinus } from "lucide-react";

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    getClass, 
    getStudentsFromClass, 
    addStudentToClass, 
    removeStudentFromClass,
    addTeacherToClass,
    removeTeacherFromClass,
    updateClass,
    loading 
  } = useClasses();
  const { students } = useStudents();
  
  const [currentClass, setCurrentClass] = useState<any>(null);
  const [classStudents, setClassStudents] = useState<any[]>([]);
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isAddTeacherDialogOpen, setIsAddTeacherDialogOpen] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [teacherName, setTeacherName] = useState("");
  
  const canManageClass = user?.role === 'admin' || user?.role === 'coordinator';
  
  // Fetch class data
  useEffect(() => {
    if (id) {
      const classData = getClass(id);
      if (classData) {
        setCurrentClass(classData);
        const studentsInClass = getStudentsFromClass(id);
        setClassStudents(studentsInClass);
        
        // Filter out students already in the class
        const studentIds = studentsInClass.map(s => s.id);
        setAvailableStudents(students.filter(s => !studentIds.includes(s.id)));
      } else {
        toast({
          variant: "destructive",
          title: "Turma não encontrada",
          description: "A turma solicitada não foi encontrada.",
        });
        navigate("/classes");
      }
    }
  }, [id, getClass, getStudentsFromClass, students, toast, navigate]);

  // Handle adding a student to the class
  const handleAddStudent = async () => {
    if (!id || !selectedStudentId) return;
    
    try {
      await addStudentToClass(id, selectedStudentId);
      
      // Update local state
      const studentToAdd = students.find(s => s.id === selectedStudentId);
      if (studentToAdd) {
        setClassStudents(prev => [...prev, studentToAdd]);
        setAvailableStudents(prev => prev.filter(s => s.id !== selectedStudentId));
      }
      
      setSelectedStudentId(null);
      setIsAddStudentDialogOpen(false);
      
      toast({
        title: "Aluno adicionado",
        description: "Aluno adicionado à turma com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao adicionar aluno:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o aluno à turma.",
      });
    }
  };

  // Handle removing a student from the class
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!id) return;
    
    if (window.confirm(`Remover ${studentName} desta turma?`)) {
      try {
        await removeStudentFromClass(id, studentId);
        
        // Update local state
        const removedStudent = classStudents.find(s => s.id === studentId);
        setClassStudents(prev => prev.filter(s => s.id !== studentId));
        
        if (removedStudent) {
          setAvailableStudents(prev => [...prev, removedStudent]);
        }
        
        toast({
          title: "Aluno removido",
          description: `${studentName} foi removido da turma.`,
        });
      } catch (error) {
        console.error("Erro ao remover aluno:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível remover o aluno da turma.",
        });
      }
    }
  };

  // Handle adding a teacher to the class
  const handleAddTeacher = async () => {
    if (!id || !teacherId || !teacherName) return;
    
    try {
      await addTeacherToClass(id, teacherId);
      
      // If it's the first teacher, set as responsible teacher
      if (currentClass && currentClass.professoresIds.length === 0) {
        await updateClass(id, {
          professorResponsavelId: teacherId
        });
      }
      
      // Update local state
      setCurrentClass(prev => ({
        ...prev,
        professoresIds: [...prev.professoresIds, teacherId]
      }));
      
      setTeacherId("");
      setTeacherName("");
      setIsAddTeacherDialogOpen(false);
      
      toast({
        title: "Professor adicionado",
        description: "Professor adicionado à turma com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao adicionar professor:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o professor à turma.",
      });
    }
  };

  // Handle removing a teacher from the class
  const handleRemoveTeacher = async (teacherId: string) => {
    if (!id) return;
    
    if (window.confirm("Remover este professor da turma?")) {
      try {
        await removeTeacherFromClass(id, teacherId);
        
        // Update local state
        setCurrentClass(prev => ({
          ...prev,
          professoresIds: prev.professoresIds.filter((id: string) => id !== teacherId),
          professorResponsavelId: prev.professorResponsavelId === teacherId ? undefined : prev.professorResponsavelId
        }));
        
        toast({
          title: "Professor removido",
          description: "Professor removido da turma com sucesso.",
        });
      } catch (error) {
        console.error("Erro ao remover professor:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível remover o professor da turma.",
        });
      }
    }
  };

  // Handle setting a teacher as responsible
  const handleSetResponsible = async (teacherId: string) => {
    if (!id) return;
    
    try {
      await updateClass(id, { professorResponsavelId: teacherId });
      
      // Update local state
      setCurrentClass(prev => ({
        ...prev,
        professorResponsavelId: teacherId
      }));
      
      toast({
        title: "Professor responsável definido",
        description: "Professor definido como responsável pela turma.",
      });
    } catch (error) {
      console.error("Erro ao definir professor responsável:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível definir o professor responsável.",
      });
    }
  };

  // Filter available students based on search term
  const filteredStudents = availableStudents.filter(student =>
    student.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!currentClass) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-app-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/classes")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-800">
            Turma: {currentClass.nome}
          </h1>
          <p className="text-gray-600">
            {currentClass.serie} - {currentClass.periodo} - Ano Letivo: {currentClass.anoLetivo}
          </p>
        </div>
        {canManageClass && (
          <Button onClick={() => navigate(`/classes/edit/${id}`)}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Turma
          </Button>
        )}
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          <TabsTrigger value="students">Alunos</TabsTrigger>
          <TabsTrigger value="teachers">Professores</TabsTrigger>
        </TabsList>
        
        {/* Students Tab */}
        <TabsContent value="students">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Alunos da Turma</CardTitle>
                  <CardDescription>
                    Gerencie os alunos desta turma
                  </CardDescription>
                </div>
                {canManageClass && (
                  <Dialog open={isAddStudentDialogOpen} onOpenChange={setIsAddStudentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Aluno
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Aluno à Turma</DialogTitle>
                        <DialogDescription>
                          Selecione um aluno para adicionar à turma {currentClass.nome}.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Input
                        placeholder="Buscar aluno por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mb-4"
                      />
                      
                      <div className="max-h-60 overflow-y-auto">
                        {filteredStudents.length === 0 ? (
                          <p className="text-center text-gray-500 py-4">
                            Nenhum aluno disponível para adicionar à turma.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {filteredStudents.map(student => (
                              <div
                                key={student.id}
                                className={`p-3 rounded-md cursor-pointer flex items-center ${
                                  selectedStudentId === student.id
                                    ? "bg-app-blue-100 border border-app-blue-300"
                                    : "hover:bg-gray-100 border border-gray-200"
                                }`}
                                onClick={() => setSelectedStudentId(student.id)}
                              >
                                <div className="mr-3">
                                  <User className="h-6 w-6 text-gray-500" />
                                </div>
                                <div>
                                  <p className="font-medium">{student.nome}</p>
                                  <p className="text-sm text-gray-500">Código: {student.codigo}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddStudentDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleAddStudent} 
                          disabled={!selectedStudentId || loading}
                        >
                          Adicionar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {classStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Esta turma ainda não possui alunos.</p>
                  {canManageClass && (
                    <Button 
                      className="mt-4" 
                      onClick={() => setIsAddStudentDialogOpen(true)}
                      variant="outline"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Aluno
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Telefone</TableHead>
                      {canManageClass && (
                        <TableHead className="text-right">Ações</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.nome}</TableCell>
                        <TableCell>{student.codigo}</TableCell>
                        <TableCell>{student.responsavel}</TableCell>
                        <TableCell>{student.telefone}</TableCell>
                        {canManageClass && (
                          <TableCell className="text-right">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveStudent(student.id, student.nome)}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remover
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Teachers Tab */}
        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Professores da Turma</CardTitle>
                  <CardDescription>
                    Gerencie os professores desta turma
                  </CardDescription>
                </div>
                {canManageClass && (
                  <Dialog open={isAddTeacherDialogOpen} onOpenChange={setIsAddTeacherDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Adicionar Professor
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Professor à Turma</DialogTitle>
                        <DialogDescription>
                          Adicione um novo professor à turma {currentClass.nome}.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <label htmlFor="teacherId" className="text-sm font-medium">
                            ID do Professor
                          </label>
                          <Input
                            id="teacherId"
                            placeholder="Digite o ID do professor"
                            value={teacherId}
                            onChange={(e) => setTeacherId(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="teacherName" className="text-sm font-medium">
                            Nome do Professor
                          </label>
                          <Input
                            id="teacherName"
                            placeholder="Digite o nome do professor"
                            value={teacherName}
                            onChange={(e) => setTeacherName(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddTeacherDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleAddTeacher} 
                          disabled={!teacherId || !teacherName || loading}
                        >
                          Adicionar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {currentClass.professoresIds.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Esta turma ainda não possui professores.</p>
                  {canManageClass && (
                    <Button 
                      className="mt-4" 
                      onClick={() => setIsAddTeacherDialogOpen(true)}
                      variant="outline"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Professor
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Status</TableHead>
                      {canManageClass && (
                        <TableHead className="text-right">Ações</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentClass.professoresIds.map((teacherId: string) => (
                      <TableRow key={teacherId}>
                        <TableCell className="font-medium">{teacherId}</TableCell>
                        <TableCell>
                          {currentClass.professorResponsavelId === teacherId ? (
                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded">
                              Responsável
                            </span>
                          ) : (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded">
                              Auxiliar
                            </span>
                          )}
                        </TableCell>
                        {canManageClass && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {currentClass.professorResponsavelId !== teacherId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleSetResponsible(teacherId)}
                                >
                                  Definir como Responsável
                                </Button>
                              )}
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveTeacher(teacherId)}
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remover
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDetail;
