
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Student } from '@/contexts/StudentContext';

export interface StudentImportData {
  codigo?: string;
  nome?: string;
  turma?: string;
  periodo?: string;
  cpf?: string;
  dataNascimento?: string;
  endereco?: string;
  responsavel?: string;
  cpfResponsavel?: string;
  telefone?: string;
  registroEscola?: string;
}

export interface ImportResult {
  data: StudentImportData[];
  errors: string[];
  totalRows: number;
}

// Mapeamento de colunas possíveis
const COLUMN_MAPPING: Record<string, keyof StudentImportData> = {
  'codigo': 'codigo',
  'código': 'codigo',
  'code': 'codigo',
  'nome': 'nome',
  'name': 'nome',
  'turma': 'turma',
  'class': 'turma',
  'periodo': 'periodo',
  'período': 'periodo',
  'period': 'periodo',
  'cpf': 'cpf',
  'data_nascimento': 'dataNascimento',
  'data nascimento': 'dataNascimento',
  'birth_date': 'dataNascimento',
  'endereco': 'endereco',
  'endereço': 'endereco',
  'address': 'endereco',
  'responsavel': 'responsavel',
  'responsável': 'responsavel',
  'guardian': 'responsavel',
  'cpf_responsavel': 'cpfResponsavel',
  'cpf responsavel': 'cpfResponsavel',
  'cpf responsável': 'cpfResponsavel',
  'guardian_cpf': 'cpfResponsavel',
  'telefone': 'telefone',
  'phone': 'telefone',
  'registro_escola': 'registroEscola',
  'registro escola': 'registroEscola',
  'school_record': 'registroEscola'
};

export const processFile = async (file: File): Promise<ImportResult> => {
  const errors: string[] = [];
  let data: StudentImportData[] = [];

  try {
    if (file.name.endsWith('.csv')) {
      data = await processCSV(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      data = await processExcel(file);
    } else {
      errors.push('Formato de arquivo não suportado');
      return { data: [], errors, totalRows: 0 };
    }

    // Validar e limpar dados
    const validatedData = data.map((row, index) => {
      const validatedRow: StudentImportData = {};
      
      // Validações básicas
      if (!row.nome || row.nome.trim() === '') {
        errors.push(`Linha ${index + 2}: Nome é obrigatório`);
      } else {
        validatedRow.nome = row.nome.trim();
      }

      if (!row.codigo || row.codigo.trim() === '') {
        errors.push(`Linha ${index + 2}: Código é obrigatório`);
      } else {
        validatedRow.codigo = row.codigo.trim();
      }

      if (!row.turma || row.turma.trim() === '') {
        errors.push(`Linha ${index + 2}: Turma é obrigatória`);
      } else {
        validatedRow.turma = row.turma.trim();
      }

      if (!row.responsavel || row.responsavel.trim() === '') {
        errors.push(`Linha ${index + 2}: Responsável é obrigatório`);
      } else {
        validatedRow.responsavel = row.responsavel.trim();
      }

      // Campos opcionais
      if (row.periodo) validatedRow.periodo = row.periodo.trim();
      if (row.cpf) validatedRow.cpf = row.cpf.replace(/\D/g, '');
      if (row.dataNascimento) validatedRow.dataNascimento = row.dataNascimento;
      if (row.endereco) validatedRow.endereco = row.endereco.trim();
      if (row.cpfResponsavel) validatedRow.cpfResponsavel = row.cpfResponsavel.replace(/\D/g, '');
      if (row.telefone) validatedRow.telefone = row.telefone.trim();
      if (row.registroEscola) validatedRow.registroEscola = row.registroEscola.trim();

      return validatedRow;
    });

    return {
      data: validatedData,
      errors,
      totalRows: data.length
    };
  } catch (error) {
    console.error('Error processing file:', error);
    errors.push('Erro ao processar arquivo: ' + (error as Error).message);
    return { data: [], errors, totalRows: 0 };
  }
};

const processCSV = (file: File): Promise<StudentImportData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data.map((row: any) => mapRowData(row));
        resolve(data);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

const processExcel = async (file: File): Promise<StudentImportData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length === 0) {
          resolve([]);
          return;
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];
        
        const mappedData = rows.map(row => {
          const rowObj: any = {};
          headers.forEach((header, index) => {
            rowObj[header] = row[index];
          });
          return mapRowData(rowObj);
        });

        resolve(mappedData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
};

const mapRowData = (row: any): StudentImportData => {
  const mappedRow: StudentImportData = {};
  
  Object.keys(row).forEach(key => {
    const normalizedKey = key.toLowerCase().trim();
    const mappedKey = COLUMN_MAPPING[normalizedKey];
    
    if (mappedKey && row[key] !== null && row[key] !== undefined) {
      mappedRow[mappedKey] = String(row[key]).trim();
    }
  });

  return mappedRow;
};
