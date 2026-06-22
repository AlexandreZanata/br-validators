import { IE_SP_GOLDEN, type UfCode } from '@br-validators/core';

export const IE_SAMPLES: Record<UfCode, string> = {
  AC: '0113253877910',
  AL: '248682954',
  AM: '917050150',
  AP: '039045820',
  BA: '63984300',
  CE: '836182316',
  DF: '0730000100109',
  ES: '463921810',
  GO: '112237118',
  MA: '123517680',
  MG: '2490944173923',
  MS: '282570926',
  MT: '00130000019',
  PA: '153662476',
  PB: '312029063',
  PE: '064970639',
  PI: '465180426',
  PR: '0031595584',
  RJ: '06540481',
  RN: '204502292',
  RO: '39206839474860',
  RR: '247681047',
  RS: '3288345503',
  SC: '632480718',
  SE: '826594042',
  SP: IE_SP_GOLDEN,
  TO: '27035910938',
};

export function generateIe(uf: UfCode) {
  return IE_SAMPLES[uf];
}
