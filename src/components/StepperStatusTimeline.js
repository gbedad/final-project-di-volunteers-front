import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import BorderBoxWithLabels from './borderedBox';

import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

const steps = [
  {
    label: 'Votre compte est créé, nous aimerions en savoir plus sur vous',
    description: `Seules quelques informations basiques sont demandées, ainsi qu'un
    texte de motivation que nous lirons attentivement.`,
  },

  {
    label: 'Nous aimerions en savoir plus sur vos disponibilités',
    description: `Qui vous êtes (MON PROFIL), dans quelles matières vous souhaitez
      accompagner un élève et à quel niveau (MES DISPONIBILITÉS).`,
  },
  {
    label: 'Vous pouvez maintenant télécharger vos documents',
    description: `
    Téléchargez vos pièces d'identité, extrait de casier judiciaire,
    CV et/ou diplômes et/ou attestations.

  Complétez le cas échéant avec un test (niveau collège).`,
  },

  {
    label: 'Le moment est venu de nous entretenir',
    description: `Nous prenons contact pour vous proposer un ou plusieurs rendez-vous.`,
  },
  {
    label: 'Il reste à compléter votre dossier',
    description: `
    Vous pouvez maintenant télécharger le modèle sur le lien indiqué.
    Signez la convention d'engagement réciproque et déposez-la sur la plateforme.
  `,
  },
  {
    label: 'Votre candidature est validée',
    description: `Bienvenue ! Nous cherchons parmi les demandes en attente, celles qui
    correspondent à vos souhaits.`,
  },
];

export default function StepperStatusTimeline(props) {
  const { userStatusStep, handleChange } = props;

  console.log(userStatusStep);

  const userIndex = Number(userStatusStep.split('/')[0]);
  const [activeStep, setActiveStep] = React.useState(userIndex);
  const statusSteps = [...steps.slice(0, userIndex)];

  console.log(userIndex);

  useEffect(() => {
    const getProps = () => {
      setActiveStep(userIndex - 1);
    };
    getProps();
  }, [handleChange]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const stepStyle = {
    // boxShadow: 2,
    // backgroundColor: 'rgba(200,255,255,0.1)',
    padding: 2,
    '& .Mui-active': {
      '&.MuiStepIcon-root': {
        color: 'secondary.main',
        fontSize: '2rem',
      },
      '& .MuiStepConnector-line': {
        borderColor: 'secondary.main',
      },
    },
    '& .Mui-completed': {
      '&.MuiStepIcon-root': {
        color: 'primary.main',
        fontSize: '2rem',
      },
      '& .MuiStepConnector-line': {
        borderColor: 'primary.main',
      },
    },
  };

  return (
    <BorderBoxWithLabels
      label="Etapes jusqu'à la validation de ma candidature"
      sx={{ display: 'flex' }}>
      <Box sx={{ maxWidth: 500 }}>
        <Stepper activeStep={activeStep} orientation="vertical" sx={stepStyle}>
          {statusSteps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel
                optional={
                  index === 4 ? (
                    <Typography variant="caption">Dernière étape</Typography>
                  ) : null
                }>
                {step.label}
              </StepLabel>
              <StepContent TransitionProps={{ unmountOnExit: false }}>
                <Typography>{step.description}</Typography>
                <Box sx={{ mb: 2 }}>
                  <div>
                    {(index < 3 ||
                      (index >= 4 && index !== steps.length - 1)) && (
                      <Button
                        variant="contained"
                        onClick={(event) => {
                          index === 4
                            ? handleChange(event, index)
                            : handleChange(event, index + 1);
                        }}
                        sx={{ mt: 1, mr: 1 }}>
                        {/* {index === steps.length - 1 ? 'Terminer' : "J'y vais"} */}
                        J'y vais
                      </Button>
                    )}
                    {index > 0 && (
                      <Button
                        disabled={index === -1}
                        onClick={handleBack}
                        sx={{ mt: 1, mr: 1 }}>
                        <SkipPreviousIcon /> {index}
                      </Button>
                    )}
                    <Button
                      disabled={index === -1}
                      onClick={index < userIndex - 1 && handleNext}
                      sx={{ mt: 1, mr: 1 }}>
                      {index < userIndex - 1 && (
                        <>
                          <SkipNextIcon /> {index + 2}
                        </>
                      )}
                    </Button>
                  </div>
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
        {activeStep === steps.length && (
          <Paper square elevation={0} sx={{ p: 3 }}>
            <Typography>Toutes les étapes ont été effectuées</Typography>
            <Button onClick={handleReset} sx={{ mt: 1, mr: 1 }}>
              Revenir
            </Button>
          </Paper>
        )}
      </Box>
    </BorderBoxWithLabels>
  );
}
