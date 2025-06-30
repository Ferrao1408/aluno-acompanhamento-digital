
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudents } from '@/contexts/StudentContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { useToast } from '@/hooks/use-toast';
import { processFile, StudentImportData, ImportResult } from '@/utils/fileProcessor';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Download, Upload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const StudentBulkImport: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addStudent } = useStudents();
  const { toast } = useToast();
  
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Check permissions
  React.useEffect(() => {
    if (user?.role !== "coordinator" && user?.role !== "admin") {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para esta área",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    
    try {
      const result = await processFile(file);
      setImportResult(result);
      
      if (result.errors.length > 0) {
        toast({
          title: "Arquivo processado com avisos",
          description: `${result.errors.length} erro(s) encontrado(s). Verifique a tabela abaixo.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Arquivo processado com sucesso",
          description: `${result.data.length} registro(s) prontos para importação.`,
        });
      }
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Erro ao processar arquivo",
        description: "Ocorreu um erro ao processar o arquivo. Verifique o formato.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!importResult || importResult.data.length === 0) return;
    
    setIsImporting(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const studentData of importResult.data) {
        try {
          // Converter para o formato esperado pelo sistema
          const student = {
            codigo: studentData.codigo || '',
            nome: studentData.nome || '',
            turma: studentData.turma || '',
            periodo: studentData.periodo || 'Manhã',
            cpf: studentData.cpf || '',
            dataNascimento: studentData.dataNascimento || '',
            endereco: studentData.endereco || '',
            responsavel: studentData.responsavel || '',
            cpfResponsavel: studentData.cpfResponsavel || '',
            telefone: studentData.telefone || '',
            registroEscola: studentData.registroEscola || '',
          };
          
          await addStudent(student);
          successCount++;
        } catch (error) {
          console.error('Error importing student:', error);
          errorCount++;
        }
      }
      
      toast({
        title: "Importação concluída",
        description: `${successCount} aluno(s) importado(s) com sucesso. ${errorCount > 0 ? `${errorCount} erro(s).` : ''}`,
      });
      
      if (successCount > 0) {
        navigate('/students');
      }
    } catch (error) {
      console.error('Error during bulk import:', error);
      toast({
        title: "Erro na importação",
        description: "Ocorreu um erro durante a importação em lote.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      ['codigo', 'nome', 'turma', 'periodo', 'cpf', 'dataNascimento', 'endereco', 'responsavel', 'cpfResponsavel', 'telefone', 'registroEscola'],
      ['2024001', 'João Silva', '9ºA', 'Manhã', '12345678901', '2008-05-15', 'Rua das Flores, 123', 'Maria Silva', '98765432100', '(11) 99999-9999', 'RE2024001']
    ];
    
    const csvContent = template.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_alunos.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Importação em Lote de Alunos</h1>
        <p className="text-muted-foreground mt-1">
          Importe múltiplos alunos de uma vez usando arquivos Excel ou CSV
        </p>
      </div>

      <div className="space-y-6">
        {/* Template Download */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Template de Importação</h3>
              <p className="text-muted-foreground">
                Baixe o template para ver o formato correto dos dados
              </p>
            </div>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Baixar Template
            </Button>
          </div>
        </Card>

        {/* File Upload */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upload do Arquivo</h3>
          <FileUpload 
            onFileSelect={handleFileSelect}
            className="mb-4"
          />
          
          {isProcessing && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2">Processando arquivo...</span>
            </div>
          )}
        </Card>

        {/* Results */}
        {importResult && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Resultado do Processamento</h3>
              <div className="flex space-x-2">
                <Badge variant={importResult.errors.length > 0 ? "destructive" : "default"}>
                  {importResult.data.length} registros
                </Badge>
                {importResult.errors.length > 0 && (
                  <Badge variant="destructive">
                    {importResult.errors.length} erros
                  </Badge>
                )}
              </div>
            </div>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Erros encontrados:</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                    {importResult.errors.length > 10 && (
                      <li>... e mais {importResult.errors.length - 10} erro(s)</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Data Preview */}
            {importResult.data.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Prévia dos Dados (primeiros 10 registros)</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Turma</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Responsável</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importResult.data.slice(0, 10).map((student, index) => (
                        <TableRow key={index}>
                          <TableCell>{student.codigo}</TableCell>
                          <TableCell>{student.nome}</TableCell>
                          <TableCell>{student.turma}</TableCell>
                          <TableCell>{student.periodo || 'Manhã'}</TableCell>
                          <TableCell>{student.responsavel}</TableCell>
                          <TableCell>
                            {student.nome && student.codigo && student.turma && student.responsavel ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Válido
                              </Badge>
                            ) : (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Incompleto
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {importResult.data.length > 10 && (
                  <p className="text-sm text-muted-foreground">
                    ... e mais {importResult.data.length - 10} registro(s)
                  </p>
                )}
              </div>
            )}

            {/* Import Button */}
            {importResult.data.length > 0 && importResult.errors.length === 0 && (
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={handleImport}
                  disabled={isImporting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isImporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar {importResult.data.length} Aluno(s)
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentBulkImport;
