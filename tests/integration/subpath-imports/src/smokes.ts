/**
 * Per-subpath smoke tests — native Node resolution via workspace @br-validators/core.
 */

type SmokeContext = {
  exportKey: string;
  moduleId: string;
};

type SmokeHandler = (moduleNs: Record<string, unknown>, ctx: SmokeContext) => void;

const CNPJ_GOLDEN_ALPHANUMERIC = '12ABC34501DE35';
const CPF_GOLDEN = '39053344705';
const NCM_GOLDEN = '01012100';

function assertTruthy(value: unknown, message: string): void {
  if (value === undefined || value === null || value === false) {
    throw new Error(message);
  }
}

const dedicatedSmokes: Record<string, SmokeHandler> = {
  '.': (moduleNs) => {
    const compare = moduleNs.compare as (
      a: string,
      b: string,
      type: string,
    ) => { equal: boolean };
    assertTruthy(compare(CPF_GOLDEN, '390.533.447-05', 'cpf').equal, 'root compare(cpf)');
  },
  './cnpj': (moduleNs) => {
    const validateCnpj = moduleNs.validateCnpj as (value: string) => { ok: boolean };
    assertTruthy(validateCnpj(CNPJ_GOLDEN_ALPHANUMERIC).ok, 'validateCnpj golden');
  },
  './ncm': (moduleNs) => {
    const getNcmPorCodigo = moduleNs.getNcmPorCodigo as (code: string) => { codigo: string } | undefined;
    assertTruthy(getNcmPorCodigo(NCM_GOLDEN)?.codigo === NCM_GOLDEN, 'getNcmPorCodigo golden');
  },
  './cst': (moduleNs) => {
    const getCstIcmsPorCodigo = moduleNs.getCstIcmsPorCodigo as (code: string) => { codigo: string } | undefined;
    assertTruthy(getCstIcmsPorCodigo('00')?.codigo === '00', 'getCstIcmsPorCodigo 00');
  },
  './compare': (moduleNs) => {
    const compare = moduleNs.compare as (
      a: string,
      b: string,
      type: string,
    ) => { equal: boolean };
    assertTruthy(compare(CPF_GOLDEN, CPF_GOLDEN, 'cpf').equal, 'compare subpath');
  },
  './cpf': (moduleNs) => {
    const validateCpf = moduleNs.validateCpf as (value: string) => { ok: boolean };
    assertTruthy(validateCpf(CPF_GOLDEN).ok, 'validateCpf golden');
  },
  './ptax': (moduleNs) => {
    const getPtaxUltimoDiaUtil = moduleNs.getPtaxUltimoDiaUtil as (
      moeda: string,
    ) => { cotacaoCompra: number } | undefined;
    const result = getPtaxUltimoDiaUtil('USD');
    assertTruthy(result !== undefined && result.cotacaoCompra > 0, 'getPtaxUltimoDiaUtil USD');
  },
  './batch': (moduleNs) => {
    const batch = moduleNs.batch as (
      values: readonly string[],
      type: string,
    ) => { summary: { total: number } };
    const result = batch([CPF_GOLDEN], 'cpf');
    assertTruthy(result.summary.total === 1, 'batch cpf');
  },
};

function defaultSmoke(moduleNs: Record<string, unknown>, ctx: SmokeContext): void {
  const names = Object.keys(moduleNs).filter((key) => key !== 'default');
  if (names.length === 0) {
    throw new Error(`No exports on ${ctx.moduleId}`);
  }
}

export async function runSubpathSmoke(exportKey: string): Promise<void> {
  const moduleId =
    exportKey === '.' ? '@br-validators/core' : `@br-validators/core${exportKey.slice(1)}`;
  const moduleNs = (await import(moduleId)) as Record<string, unknown>;
  const handler = dedicatedSmokes[exportKey] ?? defaultSmoke;
  handler(moduleNs, { exportKey, moduleId });
}
