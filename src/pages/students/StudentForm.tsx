
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStudents } from "@/contexts/StudentContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CPFInput } from "@/components/ui/cpf-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { isValidCPF, checkCPFDuplicate } from "@/utils/cpfValidator";

interface StudentFormData {
  codigo: string;
  nome: string;
  turma: string;
  periodo: string;
  cpf: string;
  dataNascimento: string;
  endereco: string;
  responsavel: string;
  cpfResponsavel: string;
  telefone: string;
  registroEscola: string;
}

const StudentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addStudent, updateStudent, getStudent, students } = useStudents();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultFormData: StudentFormData = {
    codigo: "",
    nome: "",
    turma: "",
    periodo: "Manhã",
    cpf: "",
    dataNascimento: "",
    endereco: "",
    responsavel: "",
    cpfResponsavel: "",
    telefone: "",
    registroEscola: "",
  };
  
  const [formData, setFormData] = useState<StudentFormData>(defaultFormData);
  const isEditing = !!id;
  const [activeTab, setActiveTab] = useState("dados-pessoais");

  // Load student data if editing
  useEffect(() => {
    if (isEditing) {
      const studentData = getStudent(id);
      if (studentData) {
        setFormData({
          codigo: studentData.codigo,
          nome: studentData.nome,
          turma: studentData.turma,
          periodo: studentData.periodo,
          cpf: studentData.cpf,
          dataNascimento: studentData.dataNascimento,
          endereco: studentData.endereco,
          responsavel: studentData.responsavel,
          cpfResponsavel: studentData.cpfResponsavel,
          telefone: studentData.telefone,
          registroEscola: studentData.registroEscola,
        });
      } else {
        toast({
          title: "Erro",
          description: "Aluno não encontrado",
          variant: "destructive",
        });
        navigate("/students");
      }
    }
  }, [id, isEditing, getStudent, navigate, toast]);

  // Check permissions
  useEffect(() => {
    if (user?.role !== "coordinator" && user?.role !== "admin") {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para esta área",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle CPF changes
  const handleCPFChange = (field: 'cpf' | 'cpfResponsavel') => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    // Check required fields
    if (!formData.nome || !formData.codigo || !formData.turma || !formData.responsavel) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return false;
    }

    // Validate CPFs if provided
    if (formData.cpf && !isValidCPF(formData.cpf)) {
      toast({
        title: "CPF inválido",
        description: "O CPF do aluno não é válido",
        variant: "destructive",
      });
      return false;
    }

    if (formData.cpfResponsavel && !isValidCPF(formData.cpfResponsavel)) {
      toast({
        title: "CPF inválido",
        description: "O CPF do responsável não é válido",
        variant: "destructive",
      });
      return false;
    }

    // Check for duplicates
    const cpfDuplicate = checkCPFDuplicate(formData.cpf, students, isEditing ? id : undefined);
    if (cpfDuplicate) {
      toast({
        title: "CPF duplicado",
        description: cpfDuplicate,
        variant: "destructive",
      });
      return false;
    }

    const cpfResponsavelDuplicate = checkCPFDuplicate(formData.cpfResponsavel, students, isEditing ? id : undefined);
    if (cpfResponsavelDuplicate) {
      toast({
        title: "CPF duplicado",
        description: cpfResponsavelDuplicate,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (isEditing) {
        await updateStudent(id, formData);
        toast({
          title: "Sucesso",
          description: "Dados do aluno atualizados com sucesso",
        });
      } else {
        await addStudent(formData);
        toast({
          title: "Sucesso",
          description: "Aluno cadastrado com sucesso",
        });
      }
      
      navigate("/students");
    } catch (error) {
      console.error("Error saving student:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar os dados do aluno",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {isEditing ? "Editar Aluno" : "Novo Aluno"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isEditing 
            ? "Atualize as informações do aluno" 
            : "Preencha o formulário para cadastrar um novo aluno"}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="dados-pessoais">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="dados-escolares">Dados Escolares</TabsTrigger>
              <TabsTrigger value="responsavel">Responsável</TabsTrigger>
            </TabsList>

            {/* Seção: Dados Pessoais */}
            <TabsContent value="dados-pessoais" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome */}
                <div className="space-y-2">
                  <label htmlFor="nome" className="block font-medium">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Nome completo do aluno"
                    required
                  />
                </div>
                
                {/* Data de Nascimento */}
                <div className="space-y-2">
                  <label htmlFor="dataNascimento" className="block font-medium">
                    Data de Nascimento
                  </label>
                  <Input
                    id="dataNascimento"
                    name="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                {/* CPF com validação */}
                <CPFInput
                  id="cpf"
                  name="cpf"
                  label="CPF do Aluno"
                  value={formData.cpf}
                  onChange={handleCPFChange('cpf')}
                  students={students}
                  currentStudentId={isEditing ? id : undefined}
                />
                
                {/* Endereço detalhado */}
                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="endereco" className="block font-medium">
                    Endereço Detalhado
                  </label>
                  <Input
                    id="endereco"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    placeholder="Endereço completo com CEP, rua, número, bairro, cidade e estado"
                    required
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Seção: Dados Escolares */}
            <TabsContent value="dados-escolares" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Código do aluno */}
                <div className="space-y-2">
                  <label htmlFor="codigo" className="block font-medium">
                    Código do Aluno <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="codigo"
                    name="codigo"
                    value={formData.codigo}
                    onChange={handleChange}
                    placeholder="Ex: 2023001"
                    required
                  />
                </div>
                
                {/* Registro da escola */}
                <div className="space-y-2">
                  <label htmlFor="registroEscola" className="block font-medium">
                    Registro na Escola
                  </label>
                  <Input
                    id="registroEscola"
                    name="registroEscola"
                    value={formData.registroEscola}
                    onChange={handleChange}
                    placeholder="Ex: RE20230001"
                    required
                  />
                </div>
                
                {/* Turma */}
                <div className="space-y-2">
                  <label htmlFor="turma" className="block font-medium">
                    Turma <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="turma"
                    name="turma"
                    value={formData.turma}
                    onChange={handleChange}
                    placeholder="Ex: 9ºA"
                    required
                  />
                </div>
                
                {/* Período */}
                <div className="space-y-2">
                  <label htmlFor="periodo" className="block font-medium">
                    Período
                  </label>
                  <Select
                    value={formData.periodo}
                    onValueChange={(value) => handleSelectChange("periodo", value)}
                  >
                    <SelectTrigger id="periodo">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manhã">Manhã</SelectItem>
                      <SelectItem value="Tarde">Tarde</SelectItem>
                      <SelectItem value="Noite">Noite</SelectItem>
                      <SelectItem value="Integral">Integral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            {/* Seção: Responsável */}
            <TabsContent value="responsavel" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Responsável */}
                <div className="space-y-2">
                  <label htmlFor="responsavel" className="block font-medium">
                    Nome do Responsável <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="responsavel"
                    name="responsavel"
                    value={formData.responsavel}
                    onChange={handleChange}
                    placeholder="Nome completo do responsável"
                    required
                  />
                </div>
                
                {/* CPF do Responsável com validação */}
                <CPFInput
                  id="cpfResponsavel"
                  name="cpfResponsavel"
                  label="CPF do Responsável"
                  value={formData.cpfResponsavel}
                  onChange={handleCPFChange('cpfResponsavel')}
                  students={students}
                  currentStudentId={isEditing ? id : undefined}
                  required
                />
                
                {/* Telefone */}
                <div className="space-y-2">
                  <label htmlFor="telefone" className="block font-medium">
                    Telefone
                  </label>
                  <Input
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="Ex: (00) 00000-0000"
                    required
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </span>
              ) : isEditing ? "Atualizar" : "Cadastrar"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default StudentForm;
