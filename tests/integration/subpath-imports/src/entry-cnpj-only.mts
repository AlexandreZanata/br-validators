import { validateCnpj } from '@br-validators/core/cnpj';

if (!validateCnpj('12ABC34501DE35').ok) {
  throw new Error('validateCnpj smoke failed');
}
