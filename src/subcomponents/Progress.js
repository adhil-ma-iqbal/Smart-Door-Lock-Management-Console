import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
}));

export default function LinearDeterminate(props) {
  const { num, total, type} = props;
  const classes = useStyles();

  const completed = ((num/total) * 100) | 0;

  return (
    <div className={classes.root}>
      {
        (type == "capture") ? 
        (<p>Image Capture On!, Please Move your face arround till you see the progress bar moving.  Number of images captured: {num} ({completed}%)</p>) :
        (<p>Images Are being uploaded to Cloud!, Number of images uploaded: {num} ({completed}%)</p>)
      }
      <LinearProgress variant="determinate" value={completed} color="secondary" />
    </div>
  );
}