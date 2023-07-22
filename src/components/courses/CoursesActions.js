import { Box, IconButton, Tooltip } from '@mui/material';
import { Delete, Edit } from '@mui/icons-material';
import { useValue } from './CourseContext';
// import { deleteRoom } from '../../../actions/room';

const CoursesActions = ({ params }) => {
  const { dispatch } = useValue();
  return (
    <Box>
      <Tooltip title="Editer ce cours">
        <IconButton
          onClick={() =>
            dispatch({ type: 'UPDATE_COURSE', payload: params.row })
          }>
          <Edit />
        </IconButton>
      </Tooltip>
      <Tooltip title="Effacer ce cours">
        <IconButton
          onClick={() =>
            dispatch({ type: 'DELETE_COURSE', payload: params.row.id })
          }>
          <Delete />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default CoursesActions;
