import { validateBoleto } from '@br-validators/core/boleto';
import type { BoletoSituacao, BoletoValidationResult, ValidateBoletoOptions } from '@br-validators/core';
import type { z } from 'zod';
import { createBrStringSchema } from './create-schema.js';

export type BoletoSchemaOutput =
  | {
      value: string;
      inputKind: 'linha-digitavel' | 'codigo-barras';
      situacao: BoletoSituacao;
    }
  | {
      value: string;
      inputKind: 'arrecadacao-linha' | 'arrecadacao-codigo-barras';
      format: 'arrecadacao';
      segment: string;
      valueType: '6' | '7' | '8' | '9';
    };

type BoletoSuccess = Extract<BoletoValidationResult, { ok: true }>;

function mapBoletoSuccess(success: BoletoSuccess): BoletoSchemaOutput {
  if (success.format === 'arrecadacao') {
    return {
      value: success.value,
      inputKind: success.inputKind,
      format: 'arrecadacao',
      segment: success.segment,
      valueType: success.valueType,
    };
  }
  return {
    value: success.value,
    inputKind: success.inputKind,
    situacao: success.situacao,
  };
}

export function createBoletoSchema(
  options?: ValidateBoletoOptions,
): z.ZodType<BoletoSchemaOutput, z.ZodTypeDef, string> {
  return createBrStringSchema<BoletoSuccess, BoletoSchemaOutput>(
    (input) => validateBoleto(input, options),
    mapBoletoSuccess,
  );
}

export const boletoSchema = createBoletoSchema();
