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

// import SkipNextIcon from '@mui/icons-material/SkipNext';
// import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';

const steps = [
  {
    label: 'Mon profil',
    label_realised: 'Mon profil est créé',
    label_waiting: "Mon compte est créé, j'ai saisi les informations demandées",
    description: `Votre compte est créé, nous aimerions en savoir plus sur vous : merci de nous communiquer quelques informations préliminaires sur votre profil (sauf, bien sûr, si vous l'avez déjà fait !).`,
    description_waiting:
      'Merci ! Nous vous envoyons un mail dès que nous en avons pris connaissance.',
  },

  {
    label: 'Mes souhaits (matières, niveaux) et disponibilités',
    label_realised: 'Mes souhaits et disponibilités sont renseignés',
    label_waiting: "J'ai renseigné mes souhaits et disponibilités",
    description: `Nous aimerions connaître vos souhaits et disponibilités (sauf, bien sûr, si vous l'avez déjà fait !). Une fois que vous les aurez saisis, nous vous appellerons afin de nous présenter lors d'un premier contact téléphonique.`,
    description_waiting:
      'Merci ! Nous vous envoyons un mail dès que nous en avons pris connaissance et vous appelons afin de nous présenter.',
  },

  {
    label: 'Mes documents à télécharger',
    label_realised: 'Mes documents sont téléchargés',
    label_waiting: "J'ai téléchargé mes documents",
    description: `Nous vous serions reconnaissants de bien vouloir télécharger vos pièce d'identité, extrait de casier judiciaire, CV ou diplômes ou attestations (sauf, bien sûr, si vous l'avez déjà fait !).
.`,
    description_waiting:
      "Merci ! Nous vous envoyons un mail dès réception de vos documents, avant de vous contacter pour convenir ensemble des modalités d'entretien.",
  },

  {
    label: 'Le moment est venu de nous entretenir',
    label_realised: 'Mes entretiens ont été réalisés',
    label_waiting:
      'Nous allons vous contacter prochainement pour vous proposer un ou plusieurs rendez-vous.',
    description: `Aussi allons-nous prendre contact par téléphone ou par mail pour vous proposer un ou plusieurs rendez-vous.`,
  },
  {
    label: "Il ne reste plus qu'à signer la convention",
    label_realised: 'Ma convention est signée',
    label_waiting: '',
    description: `
    Vous pouvez maintenant télécharger le modèle et signer la convention d'engagement réciproque (sauf, bien sûr, si vous l'avez déjà fait !). C'est aussi le moment de compléter d'éventuelles informations manquantes.
  `,
    description_waiting:
      'Super ! Nous déposons dès que possible la convention signée par nos soins.',
  },
  {
    label: 'Ma candidature est validée',
    label_waiting: 'Votre candidature a été validée',
    description_waiting: `Bienvenue à l'association Séphora Berrebi ! Nous cherchons parmi les demandes de tutorat en attente celles qui correspondent à vos souhaits.`,
    description: `Bienvenue à l'association Séphora Berrebi ! Nous cherchons parmi les demandes de tutorat en attente celles qui correspondent à vos souhaits.`,
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
  const { userStatusStep, handleChange, finished } = props;

  // console.log(userStatusStep);

  const userIndex = Number(userStatusStep.split('/')[0]);
  const [activeStep, setActiveStep] = React.useState(userIndex);
  const statusSteps = [...steps.slice(0, userIndex)];

  // console.log(userIndex);

  useEffect(() => {
    const getProps = () => {
      setActiveStep(userIndex - 1);
    };
    getProps();
  }, [handleChange]);

  // const handleNext = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep + 1);
  // };

  // const handleBack = () => {
  //   setActiveStep((prevActiveStep) => prevActiveStep - 1);
  // };

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
                {activeStep > index && activeStep !== 6
                  ? step.label_realised
                  : finished
                  ? step.label_waiting
                  : step.label}
              </StepLabel>
              <StepContent TransitionProps={{ unmountOnExit: false }}>
                <Typography color="secondary.dark" fontSize={13} ml={1}>
                  {finished ? step.description_waiting : step.description}
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
                          disabled={finished}
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
                    {/* {index > 0 && (
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
                    </Button> */}
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
