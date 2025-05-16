
import React, { createContext, useState, useContext, useEffect } from "react";
import { useStudents, Student } from "./StudentContext";
import { User, UserRole } from "./AuthContext";

export interface Class {
  id: string;
  nome: string;
  serie: string;
  periodo: string; // Manhã, Tarde, Noite
  turno: string;
  anoLetivo: string;
  professorResponsavelId?: string;
  professoresIds: string[];
}

export interface ClassStudent {
  classId: string;
  studentId: string;
}

// Define context type
interface ClassContextType {
  classes: Class[];
  classStudents: ClassStudent[];
  loading: boolean;
  addClass: (classData: Omit<Class, "id">) => Promise<string>;
  updateClass: (id: string, classData: Partial<Class>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  getClass: (id: string) => Class | undefined;
  getClassesByTeacherId: (teacherId: string) => Class[];
  addStudentToClass: (classId: string, studentId: string) => Promise<void>;
  removeStudentFromClass: (classId: string, studentId: string) => Promise<void>;
  getStudentsFromClass: (classId: string) => Student[];
  getClassesForStudent: (studentId: string) => Class[];
  addTeacherToClass: (classId: string, teacherId: string) => Promise<void>;
  removeTeacherFromClass: (classId: string, teacherId: string) => Promise<void>;
}

// Create context
const ClassContext = createContext<ClassContextType | undefined>(undefined);

// Sample data for development
const sampleClasses: Class[] = [
  {
    id: "1",
    nome: "9ºA",
    serie: "9º Ano",
    periodo: "Manhã",
    turno: "Matutino",
    anoLetivo: "2023",
    professoresIds: ["2"],
    professorResponsavelId: "2"
  },
  {
    id: "2",
    nome: "8ºB",
    serie: "8º Ano",
    periodo: "Tarde",
    turno: "Vespertino",
    anoLetivo: "2023",
    professoresIds: ["2"],
    professorResponsavelId: "2"
  }
];

const sampleClassStudents: ClassStudent[] = [
  { classId: "1", studentId: "1" },
  { classId: "1", studentId: "3" },
  { classId: "2", studentId: "2" }
];

export const ClassProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>(sampleClasses);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>(sampleClassStudents);
  const [loading, setLoading] = useState(false);
  const { students } = useStudents();

  // Load data from localStorage on mount
  useEffect(() => {
    const storedClasses = localStorage.getItem("classes");
    const storedClassStudents = localStorage.getItem("classStudents");
    
    if (storedClasses) {
      setClasses(JSON.parse(storedClasses));
    } else {
      // Initialize with sample data
      localStorage.setItem("classes", JSON.stringify(sampleClasses));
    }
    
    if (storedClassStudents) {
      setClassStudents(JSON.parse(storedClassStudents));
    } else {
      // Initialize with sample data
      localStorage.setItem("classStudents", JSON.stringify(sampleClassStudents));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("classes", JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem("classStudents", JSON.stringify(classStudents));
  }, [classStudents]);

  // Class CRUD operations
  const addClass = async (classData: Omit<Class, "id">): Promise<string> => {
    setLoading(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newClassId = `${Date.now()}`;
      const newClass: Class = {
        ...classData,
        id: newClassId
      };
      
      setClasses(prev => [...prev, newClass]);
      return newClassId;
    } catch (error) {
      console.error("Error adding class:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateClass = async (id: string, classData: Partial<Class>) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setClasses(prev => 
        prev.map(cls => 
          cls.id === id 
            ? { ...cls, ...classData }
            : cls
        )
      );
      return;
    } catch (error) {
      console.error("Error updating class:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Delete class
      setClasses(prev => prev.filter(cls => cls.id !== id));
      
      // Delete all class-student associations for this class
      setClassStudents(prev => prev.filter(cs => cs.classId !== id));
      
      return;
    } catch (error) {
      console.error("Error deleting class:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getClass = (id: string) => {
    return classes.find(cls => cls.id === id);
  };

  const getClassesByTeacherId = (teacherId: string) => {
    return classes.filter(cls => 
      cls.professoresIds.includes(teacherId) || 
      cls.professorResponsavelId === teacherId
    );
  };

  // Class-Student operations
  const addStudentToClass = async (classId: string, studentId: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check if the association already exists
      const exists = classStudents.some(
        cs => cs.classId === classId && cs.studentId === studentId
      );
      
      if (!exists) {
        setClassStudents(prev => [...prev, { classId, studentId }]);
      }
      
      return;
    } catch (error) {
      console.error("Error adding student to class:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeStudentFromClass = async (classId: string, studentId: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClassStudents(prev => 
        prev.filter(cs => 
          !(cs.classId === classId && cs.studentId === studentId)
        )
      );
      
      return;
    } catch (error) {
      console.error("Error removing student from class:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getStudentsFromClass = (classId: string) => {
    const classStudentIds = classStudents
      .filter(cs => cs.classId === classId)
      .map(cs => cs.studentId);
    
    return students.filter(student => classStudentIds.includes(student.id));
  };

  const getClassesForStudent = (studentId: string) => {
    const studentClassIds = classStudents
      .filter(cs => cs.studentId === studentId)
      .map(cs => cs.classId);
    
    return classes.filter(cls => studentClassIds.includes(cls.id));
  };

  // Teacher-Class operations
  const addTeacherToClass = async (classId: string, teacherId: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClasses(prev => 
        prev.map(cls => {
          if (cls.id === classId) {
            // Add teacher if not already in the list
            const updatedTeacherIds = cls.professoresIds.includes(teacherId)
              ? cls.professoresIds
              : [...cls.professoresIds, teacherId];
            
            return { ...cls, professoresIds: updatedTeacherIds };
          }
          return cls;
        })
      );
      
      return;
    } catch (error) {
      console.error("Error adding teacher to class:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeTeacherFromClass = async (classId: string, teacherId: string) => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setClasses(prev => 
        prev.map(cls => {
          if (cls.id === classId) {
            // Remove teacher from the list
            const updatedTeachers = cls.professoresIds.filter(id => id !== teacherId);
            
            // If removed teacher was the responsible teacher, clear that field
            const updatedResponsible = cls.professorResponsavelId === teacherId
              ? undefined
              : cls.professorResponsavelId;
            
            return { 
              ...cls, 
              professoresIds: updatedTeachers,
              professorResponsavelId: updatedResponsible
            };
          }
          return cls;
        })
      );
      
      return;
    } catch (error) {
      console.error("Error removing teacher from class:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = React.useMemo(() => ({
    classes,
    classStudents,
    loading,
    addClass,
    updateClass,
    deleteClass,
    getClass,
    getClassesByTeacherId,
    addStudentToClass,
    removeStudentFromClass,
    getStudentsFromClass,
    getClassesForStudent,
    addTeacherToClass,
    removeTeacherFromClass
  }), [classes, classStudents, loading, students]);

  return (
    <ClassContext.Provider value={contextValue}>
      {children}
    </ClassContext.Provider>
  );
};

// Custom hook to use the class context
export const useClasses = () => {
  const context = useContext(ClassContext);
  
  if (context === undefined) {
    throw new Error("useClasses must be used within a ClassProvider");
  }
  
  return context;
};
