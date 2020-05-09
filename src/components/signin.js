import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
//import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import {Link, Redirect} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import axios from 'axios';
import { NavigationExpandLess } from 'material-ui/svg-icons';
import { useHistory } from 'react-router-dom'


const useStyles = makeStyles(theme => ({
  paper: {
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



export default function SignIn() {
  const classes = useStyles();
  const history = useHistory();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [deviceId, setdeviceId] = React.useState('');
  const [gotoApp, setgotoApp] = React.useState(false);
  const [gotoSignup, setgotoSignup] = React.useState(false);
  const [loginFailed, setLoginFailed] = React.useState(false);

  const handleOnEmailTextChange = event => {
    
    setEmail(event.target.value);
    console.log(email);

  };

  const handleOnPasswordTextChange = event => {
    
    setPassword(event.target.value);
    console.log(password);

  };

  const handleClick = event => {
    event.preventDefault();
    const userData = {
      email: email,
      password: password
    }
    console.log(userData);
    axios({
      url: 'https://asia-east2-smartlock-51f33.cloudfunctions.net/api/login',
      method: 'POST',
      //headers: {
      //'Access-Control-Allow-Origin': '*',
      //'Access-Control-Allow-Methods': 'POST',
      //'Access-Control-Allow-Headers': 'Access-Control-Allow-Methods, Access-Control-Allow-Origin, Origin, Accept, Content-Type',
      //'Accept': 'application/x-www-form-urlencoded',
      //'Content-Type':'application/x-www-form-urlencoded'
      //},
      data:userData
      })
      .then(res => {

        console.log(res.data.deviceID)
        setdeviceId(res.data.deviceID);
        setgotoApp(true);
        setLoginFailed(false);
      })
      .catch((err) => {
        setLoginFailed(true);
        console.log(err)
      });
  };

  return (
    gotoApp || gotoSignup ? (
      gotoApp ? (<Redirect to={{
        pathname: '/app',
        state: { deviceID: `${deviceId}` }
    }} />):(
      <Redirect to={{
        pathname: '/signup',
        state: { deviceID: `${deviceId}` }
    }} />
    )
    ) : (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form className={classes.form} noValidate>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={handleOnEmailTextChange}
            autoFocus
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            onChange={handleOnPasswordTextChange}
            autoComplete="current-password"
          />
          <Link
            component="button"
            variant="body2"
            onClick={() => {
              console.info("Going to Signup page!");
              setgotoSignup(true);
            }}
          >
            Don't have an account? register your device here
          </Link>
          <Button
            //type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleClick}
          >
            Sign In
          </Button>
          <Grid container>
          </Grid>
        </form>
        {loginFailed ? (<p> Login Failed </p>) : (<p> </p>)}
      </div>
    </Container>
    )
  );
}