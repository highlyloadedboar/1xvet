import type { PetSpecies } from "./api";

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  DOG: "Собака",
  CAT: "Кошка",
  BIRD: "Птица",
  RODENT: "Грызун",
  REPTILE: "Рептилия",
  OTHER: "Другое",
};

export const SPECIES_EMOJI: Record<PetSpecies, string> = {
  DOG: "\uD83D\uDC36",
  CAT: "\uD83D\uDC31",
  BIRD: "\uD83D\uDC26",
  RODENT: "\uD83D\uDC39",
  REPTILE: "\uD83E\uDD8E",
  OTHER: "\uD83D\uDC3E",
};
