// Sin cómputo: esta unidad es una herramienta de estructuración guiada, no
// una simulación con resultado verificable — coherente con la nota del
// documento de que aquí no hay una "respuesta correcta".

export type ConstraintOption = {
  id: string;
  label: string;
  description: string;
};

export type RelaxationConfig = {
  constraintOptions: ConstraintOption[];
};
