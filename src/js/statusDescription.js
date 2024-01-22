export function shortDescription(key) {
  switch (key) {
    case 'compte créé':
      return 'Votre compte est créé';
    case 'à renseigner':
      return 'Nous aimerions en savoir plus';
    case 'à interviewer':
      return 'Le moment est venu de s’entretenir';
    case 'à finaliser':
      return 'Il reste à compléter votre dossier';
    case 'validé':
      return 'Votre candidature est validée';
    case 'déclinée':
      return `Malheureusement, votre candidature est déclinée`;
    default:
      return 'Votre compte est créé';
  }
}

export function longDescription(key) {
  switch (key) {
    case 'Compte créé':
      return 'Le candidat s’est enregistré sur l’application grâce aux données : mail, nom, prénom, date de naissance, texte de motivation';
    case 'A renseigner':
      return 'Après vérifications de base (s’agit-il d’une candidature farfelue, incohérente ou indésirable, le texte de motivation est-il très insuffisant, etc.), l’administrateur change le statut « Compte créé » en statut « A renseigner ». Ainsi, le candidat accède à la possibilité de renseigner toutes les informations complémentaires (disponibilités, documents) dont celles requises pour organiser un entretien.';
    case 'à interviewer':
      return `L’administrateur passe le dossier du statut « A renseigner » au statut « A interviewer » dès qu’il juge les informations renseignées suffisante pour lancer un processus d’entretien(s).
        Pendant tout ce processus, que les entretiens soient planifiés ou pas, qu’ils soient réalisés ou pas, qu’il y ait un ou plusieurs entretiens, le candidat reste dans ce statut.`;
    case 'A finaliser':
      return 'Une fois l(es) entretien(s) terminé(s) avec la décision de l’association et du candidat bénévole de s’engager, l’administrateur passe le dossier au statut « A finaliser » : pour finaliser son recrutement, le candidat doit procéder à la signature de la convention d’engagement réciproque et, le cas échéant, compléter ou modifier les informations manquantes.';
    case 'Validé':
      return `L’administrateur passe le dossier de « A finaliser » en « Validé » lorsque tous les documents sont chargés et complétés le cas échéant : pièce d’identité, extrait de casier judiciaire, CV et/ou diplômes, convention signée.
        Une candidature peut être validée sans le bénévole soit actif (il est alors soit en attente de l’allocation d’un élève, soit inactif pour d’autres raisons).`;
    case 'déclinée':
      return `Malheureusement, votre candidature est déclinée.`;
    default:
      break;
  }
}

export function shortDescriptionForSupervisor(key) {
  switch (key) {
    case 'Compte créé':
      return 'Votre compte sur notre plateforme de candidature est bien créé.';
    case 'A renseigner':
      return 'Nous aimerions en savoir plus sur vos disponibilités et souhaits : merci de renseigner toutes ces informations afin que nous puissions vous proposer un entretien. Les documents à télécharger peuvent l’être dès à présent ou dans une étape ultérieure.';
    case 'A interviewer':
      return `Le moment est venu de s’entretenir. Pendant cette étape, nous vous contactons pour vous proposer un ou plusieurs rendez-vous. Vous pouvez d’ores et déjà télécharger les documents requis (le cv peut être utile avant la phase d’entretien) ou le faire ultérieurement.`;
    case 'A finaliser':
      return 'Pour valider votre candidature, il manque une toute dernière étape : le téléchargement de l’ensemble de vos documents et le passage du test Voltaire.';
    case 'Validé':
      return `Et voilà, votre candidature en tant que bénévole de l’association Séphora Berrebi est validée ! Nous nous réjouissons de votre engagement à nos côtés. Nous cherchons parmi les demandes en attente le ou les enfants dont les besoins correspondent à vos souhaits et à votre profil.`;
    case 'Déclinée':
      return `Malheureusement, votre candidature est déclinée.`;
    default:
      break;
  }
}

export function setStatusStep(key) {
  switch (key) {
    case 'Compte créé':
      return '1/5';
    case 'A renseigner':
      return '2/5';
    case 'A interviewer':
      return '3/5';
    case 'A finaliser':
      return '4/5';
    case 'Validé':
      return '5/5';
    default:
      return '1/5';
  }
}

export function nextStepStatus(key) {
  switch (key) {
    case 'Compte créé':
      return 'Etape suivante : A renseigner (2/5)';
    case 'à renseigner':
      return 'Etape suivante : A interviewer (3/5)';
    case 'A interviewer':
      return 'Etape suivante : A finaliser (4/5)';
    case 'A finaliser':
      return 'Etape suivante : A valider (5/5)';
    case 'Validé':
      return 'Etape suivante : Activer';
    default:
      return 'Etape suivante : A renseigner';
  }
}
