import { getAllMunicipios, type Municipio } from '@br-validators/core/ibge';

export function getMunicipiosForUf(uf: string): readonly Municipio[] {
  return getAllMunicipios({ uf });
}

export function filterMunicipiosByName(municipios: readonly Municipio[], query: string): readonly Municipio[] {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return municipios;
  }
  return municipios.filter((municipio) => municipio.nome.toLowerCase().includes(needle));
}
