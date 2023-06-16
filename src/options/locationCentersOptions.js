export const centers = {
  gl: [48.834218481227296, 2.3869057718685927],
  mda: [48.848487854003906, 2.373246431350708],
  auberv: [48.91962432861328, 2.403681993484497],
};

export const getCenter = (loc) => {
  switch (loc) {
    case 'Aubervilliers':
      return [48.91962432861328, 2.403681993484497];
    case 'Paris 12ème Gabriel Lamé':
      return [48.834218481227296, 2.3869057718685927];
    case 'Paris 12ème Maison des Associations':
      return [48.8406306, 2.392475];

    default:
      break;
  }
};
