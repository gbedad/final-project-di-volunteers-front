import * as React from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const steps = [
  {
    label: 'Mon profil',
    description: `Avant de faire connaissance, nous vous remercions de nous communiquer quelques informations préliminaires sur votre profil. Il s’agit d’informations similaires à celles qui sont demandées sur la plateforme jeveuxaider.gouv.fr.`,
  },
  {
    label: 'Mes souhaits et disponibilités',
    description: `Avant de vous contacter par téléphone, il nous est utile d’en savoir plus sur vos disponibilités ainsi que sur vos souhaits. En particulier, dans quelle(s) matière(s) et à quel(s) niveau(x) aimeriez-vous accompagner un bénéficiaire en tant que tuteur ?
      L’échange téléphonique qui s’ensuit est l’occasion de vous présenter les modalités de fonctionnement de l’association s’agissant du tutorat.`,
  },
  {
    label: 'Mes documents',
    description: `En tant que tuteur, vous serez en contact avec des enfants et adolescents, autrement dit avec un public vulnérable. Aussi est-il essentiel pour l’association de disposer de votre pièce d'identité, de votre extrait de casier judiciaire (le b3 s’obtient aisément en ligne) ainsi que de votre CV ou, le cas échéant de vos diplômes ou attestations de travail. C’est un prérequis pour la validation de votre candidature. Comme toutes les autres informations recueillies, ces documents ne sortent pas de l’association.`,
  },
  {
    label: 'Mes entretiens',
    description: `Un ou plusieurs entretiens sont organisés pour mieux nous connaître. Entre autres sujets d’échange, il est important à nos yeux de partager avec vous nos convictions pédagogiques.`,
  },
  {
    label: 'Ma convention',
    description: `Une convention d'engagement réciproque est co-signée. Cela permet de fixer un cadre au bénévolat sur la base de principes qui relèvent du bon sens : ponctualité, fiabilité, laïcité, neutralité, bienveillance, etc.
    Pour information, de la même manière, l’association signe une convention d’engagement réciproque avec un représentant légal du bénéficiaire.`,
  },
  {
    label: 'Ma candidature est validée',
    description: `Il ne nous reste plus qu’à chercher parmi les demandes de tutorat en attente celles qui correspondent à vos souhaits et disponibilités. `,
  },
];

export default function VerticalLinearStepper() {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === 5 ? (
                  <Typography variant="caption">Dernière étape</Typography>
                ) : null
              }>
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography>{step.description}</Typography>
              <Box sx={{ mb: 2 }}>
                <div>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ mt: 1, mr: 1 }}>
                    {index === steps.length - 1 ? 'Fin' : 'Suivant'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}>
                    Retour
                  </Button>
                </div>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
      {activeStep === steps.length && (
        <Paper square elevation={0} sx={{ p: 3 }}>
          <Typography>Toutes les étapes ont été effectuées </Typography>
          <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
            Reset
          </Button>
        </Paper>
      )}
    </Box>
  );
}
