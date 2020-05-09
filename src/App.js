import React from 'react';
import SignIn from './components/signin'
import SignUp from './components/signup'
import { makeStyles } from '@material-ui/core/styles';
import VideoInput from './subcomponents/VideoInput';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';


const useStyles = makeStyles(theme => ({
  photoAlbum: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

function App() {
  const classes = useStyles();
  return (
    <Router>
    <Switch>
    <Route exact path="/" component={SignIn} />
    <Route exact path="/login" component={SignIn} />
    <Route exact path="/signup" component={SignUp} />
    <Route exact path="/app" component={VideoInput} />
    </Switch>
    </Router>
  );
}

export default App;
