
import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useClasses } from "@/contexts/ClassContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";

const formSchema = z.object({
  nome: z.string().min(1, { message: "Nome da turma é obrigatório" }),
  serie: z.string().min(1, { message: "Série é obrigatória" }),
  periodo: z.string().min(1, { message: "Período é obrigatório" }),
  turno: z.string().min(1, { message: "Turno é obrigatório" }),
  anoLetivo: z.string().min(1, { message: "Ano letivo é obrigatório" }),
});

type FormData = z.infer<typeof formSchema>;

const ClassForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const { addClass, updateClass, getClass, loading } = useClasses();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const canManageClasses = user?.role === 'admin' || user?.role === 'coordinator';
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      serie: "",
      periodo: "Manhã",
      turno: "Matutino",
      anoLetivo: new Date().getFullYear().toString(),
    },
  });

  useEffect(() => {
    if (!canManageClasses) {
      navigate("/classes");
      return;
    }
    
    if (isEditing && id) {
      const classData = getClass(id);
      if (classData) {
        form.reset({
          nome: classData.nome,
          serie: classData.serie,
          periodo: classData.periodo,
          turno: classData.turno,
          anoLetivo: classData.anoLetivo,
        });
      } else {
        navigate("/classes");
        toast({
          variant: "destructive",
          title: "Turma não encontrada",
          description: "A turma que você está tentando editar não existe.",
        });
      }
    }
  }, [id, isEditing, getClass, navigate, form, toast, canManageClasses]);

  const onSubmit = async (data: FormData) => {
    if (!canManageClasses) return;
    
    try {
      if (isEditing && id) {
        await updateClass(id, data);
        toast({
          title: "Turma atualizada",
          description: "A turma foi atualizada com sucesso.",
        });
      } else {
        // Fix here: Ensure all required fields are explicitly passed
        const newClass = {
          nome: data.nome,
          serie: data.serie,
          periodo: data.periodo,
          turno: data.turno,
          anoLetivo: data.anoLetivo,
          professoresIds: [] // Initialize as empty array
        };
        
        const newClassId = await addClass(newClass);
        toast({
          title: "Turma criada",
          description: "A nova turma foi criada com sucesso.",
        });
        navigate(`/classes/${newClassId}`);
        return;
      }
      
      navigate("/classes");
    } catch (error) {
      console.error("Erro ao salvar turma:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível salvar a turma. Tente novamente.",
      });
    }
  };

  if (!canManageClasses) {
    return null;
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
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditing ? "Editar Turma" : "Nova Turma"}
          </h1>
          <p className="text-gray-600">
            {isEditing
              ? "Atualize as informações da turma"
              : "Preencha os dados para criar uma nova turma"}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Turma</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 9ºA" 
                        {...field} 
                        disabled={loading} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="serie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Série</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 9º Ano" 
                        {...field} 
                        disabled={loading} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="periodo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Período</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Manhã" 
                        {...field} 
                        disabled={loading} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="turno"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Turno</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Matutino" 
                        {...field} 
                        disabled={loading} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="anoLetivo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano Letivo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: 2023" 
                        {...field} 
                        disabled={loading} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/classes")}
                className="mr-2"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? "Atualizar Turma" : "Criar Turma"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ClassForm;
