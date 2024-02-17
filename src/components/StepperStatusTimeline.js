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
import { styled } from '@mui/material/styles';
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip';

import SkipNextIcon from '@mui/icons-material/SkipNext';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

const steps = [
  {
    label: 'Votre compte est créé, nous aimerions en savoir plus sur vous',
    label_realised: 'Mon compte est créé',
    description: `Merci de nous  communiquer quelques information de base.`,
  },

  {
    label: 'Nous aimerions connaitre vos souhaits et disponibilités',
    label_realised: 'Mes souhaits et disponibilités sont renseignés',
    description: `Une fois vos souhaits et diponibiltés renseignés, nous vous appellerons pour nous présenter lors d'un premier contact téléphonique.`,
  },
  {
    label: 'Documents à télécharger',
    label_realised: 'Mes documents sont téléchargés',
    description: `
    Téléchargez vos pièce d'identité, extrait de casier judiciaire,
    CV ou diplômes ou attestations.
.`,
  },

  {
    label: 'Le moment est venu de nous entretenir',
    label_realised: 'Mes entretiens ont été réalisés',
    description: `Nous allons prendre contact pour vous proposer un ou plusieurs rendez-vous.`,
  },
  {
    label: "Il ne reste plus qu'à signer la convention",
    label_realised: 'Ma convention est signée',
    description: `
    Vous pouvez maintenant télécharger le modèle et signer la convention d'engagement réciproque. C'est aussi le moment de compléter d'éventuelles informations manquantes.
  `,
  },
  {
    label: 'Ma candidature est validée',
    description: `Bienvenue ! Nous cherchons parmi les demandes en attente, celles qui
    correspondent à vos souhaits.`,
  },
];

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#c8f5e9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #7b1fa2',
  },
}));

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
    '& .Mui-disabled': {
      '&.MuiStepIcon-root': {
        fontSize: '2rem',
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
                // sx={{ color: activeStep > index ? 'secondary.dark' : 'black' }}
                optional={
                  index === 4 ? (
                    <Typography variant="caption">Dernière étape</Typography>
                  ) : null
                }>
                {activeStep > index ? step.label_realised : step.label}
              </StepLabel>
              <StepContent TransitionProps={{ unmountOnExit: false }}>
                <Typography color="secondary.dark" fontSize={13} ml={1}>
                  {step.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <div>
                    {(index < 3 ||
                      (index >= 4 && index !== steps.length - 1)) && (
                      <HtmlTooltip
                        title={
                          <React.Fragment>
                            <Typography color="secondary.dark" fontSize={13}>
                              Vous n'avez pas encore renseigné les informations
                              demandées à cette étape ? Vous souhaitez les
                              modifier ? Alors allez-y !
                            </Typography>
                          </React.Fragment>
                        }>
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
                      </HtmlTooltip>
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
