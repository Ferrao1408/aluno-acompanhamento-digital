import React, { createContext, useState, useContext, useEffect } from "react";

// Define types for student data
export interface Student {
  id: string;
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
  dataCadastro: string;
}

export type ObservationType = "geral" | "comportamento" | "academico" | "atendimento" | "saude";
export type VisibilityType = "coordenacao" | "professores" | "todos";

export interface Observation {
  id: string;
  alunoId: string;
  data: string;
  texto: string;
  tipo: ObservationType;
  visibilidade: VisibilityType;
  autor: string;
}

// New types for pedagogical tracking
export type GoalStatus = "nao_iniciado" | "em_andamento" | "concluido" | "suspenso";
export type MilestoneType = "avaliacao" | "atividade" | "comportamento" | "academico";

export interface Goal {
  id: string;
  planoId: string;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataPrevisao: string;
  dataConclusao?: string;
  status: GoalStatus;
  prioridade: "baixa" | "media" | "alta";
  responsavel: string;
  observacoes?: string;
}

export interface Milestone {
  id: string;
  planoId: string;
  titulo: string;
  descricao: string;
  data: string;
  tipo: MilestoneType;
  autor: string;
  anexos?: string[];
}

export interface PedagogicalPlan {
  id: string;
  alunoId: string;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim?: string;
  ativo: boolean;
  criador: string;
  dataCriacao: string;
  ultimaAtualizacao: string;
  objetivoGeral: string;
  observacoes?: string;
}

// Define context type
interface StudentContextType {
  students: Student[];
  observations: Observation[];
  pedagogicalPlans: PedagogicalPlan[];
  goals: Goal[];
  milestones: Milestone[];
  loading: boolean;
  addStudent: (student: Omit<Student, "id" | "dataCadastro">) => Promise<void>;
  updateStudent: (id: string, studentData: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudent: (id: string) => Student | undefined;
  addObservation: (observation: Omit<Observation, "id">) => Promise<void>;
  updateObservation: (id: string, data: Partial<Observation>) => Promise<void>;
  deleteObservation: (id: string) => Promise<void>;
  getObservationsForStudent: (studentId: string) => Observation[];
  // Pedagogical plan methods
  addPedagogicalPlan: (plan: Omit<PedagogicalPlan, "id" | "dataCriacao" | "ultimaAtualizacao">) => Promise<void>;
  updatePedagogicalPlan: (id: string, data: Partial<PedagogicalPlan>) => Promise<void>;
  deletePedagogicalPlan: (id: string) => Promise<void>;
  getPedagogicalPlansForStudent: (studentId: string) => PedagogicalPlan[];
  getActivePlanForStudent: (studentId: string) => PedagogicalPlan | undefined;
  // Goal methods
  addGoal: (goal: Omit<Goal, "id">) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  getGoalsForPlan: (planId: string) => Goal[];
  // Milestone methods
  addMilestone: (milestone: Omit<Milestone, "id">) => Promise<void>;
  updateMilestone: (id: string, data: Partial<Milestone>) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  getMilestonesForPlan: (planId: string) => Milestone[];
}

// Create context
const StudentContext = createContext<StudentContextType | undefined>(undefined);

// Sample data for development
const sampleStudents: Student[] = [
  {
    id: "1",
    codigo: "2023001",
    nome: "Ana Silva",
    turma: "9ºA",
    periodo: "Manhã",
    cpf: "123.456.789-01",
    dataNascimento: "2008-05-15",
    endereco: "Rua das Flores, 123, Centro",
    responsavel: "Maria Silva",
    cpfResponsavel: "987.654.321-01",
    telefone: "(11) 98765-4321",
    registroEscola: "RE20230001",
    dataCadastro: "2023-01-15T10:30:00Z"
  },
  {
    id: "2",
    codigo: "2023002",
    nome: "Pedro Santos",
    turma: "8ºB",
    periodo: "Tarde",
    cpf: "234.567.890-12",
    dataNascimento: "2009-08-22",
    endereco: "Av. Principal, 456, Vila Nova",
    responsavel: "João Santos",
    cpfResponsavel: "876.543.210-98",
    telefone: "(11) 91234-5678",
    registroEscola: "RE20230002",
    dataCadastro: "2023-01-16T09:15:00Z"
  },
  {
    id: "3",
    codigo: "2023003",
    nome: "Juliana Oliveira",
    turma: "9ºA",
    periodo: "Manhã",
    cpf: "345.678.901-23",
    dataNascimento: "2008-03-10",
    endereco: "Rua Secundária, 789, Jardim",
    responsavel: "Carlos Oliveira",
    cpfResponsavel: "765.432.109-87",
    telefone: "(11) 92345-6789",
    registroEscola: "RE20230003",
    dataCadastro: "2023-01-16T14:45:00Z"
  }
];

const sampleObservations: Observation[] = [
  {
    id: "obs1",
    alunoId: "1",
    data: "2023-03-15T10:30:00Z",
    texto: "Aluna participativa e dedicada em sala de aula.",
    tipo: "academico",
    visibilidade: "todos",
    autor: "Professor Silva"
  },
  {
    id: "obs2",
    alunoId: "1",
    data: "2023-04-10T09:15:00Z",
    texto: "Conversa com responsável sobre rendimento escolar.",
    tipo: "atendimento",
    visibilidade: "coordenacao",
    autor: "Coordenador Escolar"
  },
  {
    id: "obs3",
    alunoId: "2",
    data: "2023-03-20T11:00:00Z",
    texto: "Aluno precisa de acompanhamento em matemática.",
    tipo: "academico",
    visibilidade: "professores",
    autor: "Professor Costa"
  }
];

// Sample pedagogical data
const samplePedagogicalPlans: PedagogicalPlan[] = [
  {
    id: "plan1",
    alunoId: "2",
    titulo: "Plano de Reforço em Matemática",
    descricao: "Plano específico para melhorar o desempenho em matemática",
    dataInicio: "2024-01-15T00:00:00Z",
    ativo: true,
    criador: "Professor Costa",
    dataCriacao: "2024-01-10T10:00:00Z",
    ultimaAtualizacao: "2024-01-15T10:00:00Z",
    objetivoGeral: "Melhorar o aproveitamento em operações básicas e resolução de problemas"
  }
];

const sampleGoals: Goal[] = [
  {
    id: "goal1",
    planoId: "plan1",
    titulo: "Dominar tabuada até 10",
    descricao: "Aluno deve conseguir responder a tabuada de 1 a 10 sem hesitação",
    dataInicio: "2024-01-15T00:00:00Z",
    dataPrevisao: "2024-02-15T00:00:00Z",
    status: "em_andamento",
    prioridade: "alta",
    responsavel: "Professor Costa"
  },
  {
    id: "goal2",
    planoId: "plan1",
    titulo: "Resolver problemas básicos",
    descricao: "Conseguir resolver problemas de adição e subtração com duas operações",
    dataInicio: "2024-02-01T00:00:00Z",
    dataPrevisao: "2024-03-01T00:00:00Z",
    status: "nao_iniciado",
    prioridade: "media",
    responsavel: "Professor Costa"
  }
];

const sampleMilestones: Milestone[] = [
  {
    id: "milestone1",
    planoId: "plan1",
    titulo: "Avaliação inicial de matemática",
    descricao: "Teste diagnóstico para identificar deficiências",
    data: "2024-01-15T14:00:00Z",
    tipo: "avaliacao",
    autor: "Professor Costa"
  },
  {
    id: "milestone2",
    planoId: "plan1",
    titulo: "Primeira semana de exercícios",
    descricao: "Conclusão da primeira semana de atividades de reforço",
    data: "2024-01-22T16:00:00Z",
    tipo: "atividade",
    autor: "Professor Costa"
  }
];

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(sampleStudents);
  const [observations, setObservations] = useState<Observation[]>(sampleObservations);
  const [pedagogicalPlans, setPedagogicalPlans] = useState<PedagogicalPlan[]>(samplePedagogicalPlans);
  const [goals, setGoals] = useState<Goal[]>(sampleGoals);
  const [milestones, setMilestones] = useState<Milestone[]>(sampleMilestones);
  const [loading, setLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedStudents = localStorage.getItem("students");
    const storedObservations = localStorage.getItem("observations");
    const storedPlans = localStorage.getItem("pedagogicalPlans");
    const storedGoals = localStorage.getItem("goals");
    const storedMilestones = localStorage.getItem("milestones");
    
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    } else {
      localStorage.setItem("students", JSON.stringify(sampleStudents));
    }
    
    if (storedObservations) {
      setObservations(JSON.parse(storedObservations));
    } else {
      localStorage.setItem("observations", JSON.stringify(sampleObservations));
    }

    if (storedPlans) {
      setPedagogicalPlans(JSON.parse(storedPlans));
    } else {
      localStorage.setItem("pedagogicalPlans", JSON.stringify(samplePedagogicalPlans));
    }

    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    } else {
      localStorage.setItem("goals", JSON.stringify(sampleGoals));
    }

    if (storedMilestones) {
      setMilestones(JSON.parse(storedMilestones));
    } else {
      localStorage.setItem("milestones", JSON.stringify(sampleMilestones));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("observations", JSON.stringify(observations));
  }, [observations]);

  useEffect(() => {
    localStorage.setItem("pedagogicalPlans", JSON.stringify(pedagogicalPlans));
  }, [pedagogicalPlans]);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem("milestones", JSON.stringify(milestones));
  }, [milestones]);

  // Student CRUD operations
  const addStudent = async (studentData: Omit<Student, "id" | "dataCadastro">) => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newStudent: Student = {
        ...studentData,
        id: `${Date.now()}`,
        dataCadastro: new Date().toISOString()
      };
      
      setStudents(prev => [...prev, newStudent]);
      return;
    } catch (error) {
      console.error("Error adding student:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateStudent = async (id: string, studentData: Partial<Student>) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setStudents(prev => 
        prev.map(student => 
          student.id === id 
            ? { ...student, ...studentData }
            : student
        )
      );
      return;
    } catch (error) {
      console.error("Error updating student:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (id: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Delete student
      setStudents(prev => prev.filter(student => student.id !== id));
      
      // Delete all observations for this student
      setObservations(prev => prev.filter(obs => obs.alunoId !== id));
      
      // Delete all pedagogical plans for this student
      const studentPlans = pedagogicalPlans.filter(plan => plan.alunoId === id);
      setPedagogicalPlans(prev => prev.filter(plan => plan.alunoId !== id));
      
      // Delete all goals and milestones for these plans
      const planIds = studentPlans.map(plan => plan.id);
      setGoals(prev => prev.filter(goal => !planIds.includes(goal.planoId)));
      setMilestones(prev => prev.filter(milestone => !planIds.includes(milestone.planoId)));
      
      return;
    } catch (error) {
      console.error("Error deleting student:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getStudent = (id: string) => {
    return students.find(student => student.id === id);
  };

  // Observation CRUD operations
  const addObservation = async (observationData: Omit<Observation, "id">) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newObservation: Observation = {
        ...observationData,
        id: `obs${Date.now()}`
      };
      
      setObservations(prev => [...prev, newObservation]);
      return;
    } catch (error) {
      console.error("Error adding observation:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateObservation = async (id: string, data: Partial<Observation>) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setObservations(prev =>
        prev.map(obs =>
          obs.id === id
            ? { ...obs, ...data }
            : obs
        )
      );
      
      return;
    } catch (error) {
      console.error("Error updating observation:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteObservation = async (id: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setObservations(prev => prev.filter(obs => obs.id !== id));
      return;
    } catch (error) {
      console.error("Error deleting observation:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getObservationsForStudent = (studentId: string) => {
    return observations.filter(obs => obs.alunoId === studentId);
  };

  // Pedagogical Plan CRUD operations
  const addPedagogicalPlan = async (planData: Omit<PedagogicalPlan, "id" | "dataCriacao" | "ultimaAtualizacao">) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPlan: PedagogicalPlan = {
        ...planData,
        id: `plan${Date.now()}`,
        dataCriacao: new Date().toISOString(),
        ultimaAtualizacao: new Date().toISOString()
      };
      
      setPedagogicalPlans(prev => [...prev, newPlan]);
      return;
    } catch (error) {
      console.error("Error adding pedagogical plan:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updatePedagogicalPlan = async (id: string, data: Partial<PedagogicalPlan>) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPedagogicalPlans(prev =>
        prev.map(plan =>
          plan.id === id
            ? { ...plan, ...data, ultimaAtualizacao: new Date().toISOString() }
            : plan
        )
      );
      
      return;
    } catch (error) {
      console.error("Error updating pedagogical plan:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deletePedagogicalPlan = async (id: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPedagogicalPlans(prev => prev.filter(plan => plan.id !== id));
      setGoals(prev => prev.filter(goal => goal.planoId !== id));
      setMilestones(prev => prev.filter(milestone => milestone.planoId !== id));
      
      return;
    } catch (error) {
      console.error("Error deleting pedagogical plan:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getPedagogicalPlansForStudent = (studentId: string) => {
    return pedagogicalPlans.filter(plan => plan.alunoId === studentId);
  };

  const getActivePlanForStudent = (studentId: string) => {
    return pedagogicalPlans.find(plan => plan.alunoId === studentId && plan.ativo);
  };

  // Goal CRUD operations
  const addGoal = async (goalData: Omit<Goal, "id">) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newGoal: Goal = {
        ...goalData,
        id: `goal${Date.now()}`
      };
      
      setGoals(prev => [...prev, newGoal]);
      return;
    } catch (error) {
      console.error("Error adding goal:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGoal = async (id: string, data: Partial<Goal>) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGoals(prev =>
        prev.map(goal =>
          goal.id === id
            ? { ...goal, ...data }
            : goal
        )
      );
      
      return;
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGoals(prev => prev.filter(goal => goal.id !== id));
      return;
    } catch (error) {
      console.error("Error deleting goal:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getGoalsForPlan = (planId: string) => {
    return goals.filter(goal => goal.planoId === planId);
  };

  // Milestone CRUD operations
  const addMilestone = async (milestoneData: Omit<Milestone, "id">) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newMilestone: Milestone = {
        ...milestoneData,
        id: `milestone${Date.now()}`
      };
      
      setMilestones(prev => [...prev, newMilestone]);
      return;
    } catch (error) {
      console.error("Error adding milestone:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMilestone = async (id: string, data: Partial<Milestone>) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMilestones(prev =>
        prev.map(milestone =>
          milestone.id === id
            ? { ...milestone, ...data }
            : milestone
        )
      );
      
      return;
    } catch (error) {
      console.error("Error updating milestone:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMilestone = async (id: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setMilestones(prev => prev.filter(milestone => milestone.id !== id));
      return;
    } catch (error) {
      console.error("Error deleting milestone:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getMilestonesForPlan = (planId: string) => {
    return milestones.filter(milestone => milestone.planoId === planId);
  };

  return (
    <StudentContext.Provider
      value={{
        students,
        observations,
        pedagogicalPlans,
        goals,
        milestones,
        loading,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudent,
        addObservation,
        updateObservation,
        deleteObservation,
        getObservationsForStudent,
        addPedagogicalPlan,
        updatePedagogicalPlan,
        deletePedagogicalPlan,
        getPedagogicalPlansForStudent,
        getActivePlanForStudent,
        addGoal,
        updateGoal,
        deleteGoal,
        getGoalsForPlan,
        addMilestone,
        updateMilestone,
        deleteMilestone,
        getMilestonesForPlan
      }}
    >
      {children}
    </StudentContext.Provider>
  );
};

// Custom hook to use the student context
export const useStudents = () => {
  const context = useContext(StudentContext);
  
  if (context === undefined) {
    throw new Error("useStudents must be used within a StudentProvider");
  }
  
  return context;
};
