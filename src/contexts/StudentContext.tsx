
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

// Define context type
interface StudentContextType {
  students: Student[];
  observations: Observation[];
  loading: boolean;
  addStudent: (student: Omit<Student, "id" | "dataCadastro">) => Promise<void>;
  updateStudent: (id: string, studentData: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudent: (id: string) => Student | undefined;
  addObservation: (observation: Omit<Observation, "id">) => Promise<void>;
  updateObservation: (id: string, data: Partial<Observation>) => Promise<void>;
  deleteObservation: (id: string) => Promise<void>;
  getObservationsForStudent: (studentId: string) => Observation[];
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

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(sampleStudents);
  const [observations, setObservations] = useState<Observation[]>(sampleObservations);
  const [loading, setLoading] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const storedStudents = localStorage.getItem("students");
    const storedObservations = localStorage.getItem("observations");
    
    if (storedStudents) {
      setStudents(JSON.parse(storedStudents));
    } else {
      // Initialize with sample data
      localStorage.setItem("students", JSON.stringify(sampleStudents));
    }
    
    if (storedObservations) {
      setObservations(JSON.parse(storedObservations));
    } else {
      // Initialize with sample data
      localStorage.setItem("observations", JSON.stringify(sampleObservations));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("observations", JSON.stringify(observations));
  }, [observations]);

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

  return (
    <StudentContext.Provider
      value={{
        students,
        observations,
        loading,
        addStudent,
        updateStudent,
        deleteStudent,
        getStudent,
        addObservation,
        updateObservation,
        deleteObservation,
        getObservationsForStudent
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
