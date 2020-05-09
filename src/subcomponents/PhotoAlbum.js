import React from 'react'
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import 'react-html5-camera-photo/build/css/index.css';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { green } from '@material-ui/core/colors';
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import Webcam from "react-webcam";
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';  
import axios from 'axios';

axios.defaults.baseURL = 'https://asia-east2-smartlock-51f33.cloudfunctions.net/api';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
    textAlign: 'center',
  },
  root2: {
    flexGrow: 1,
    whiteSpace: 'nowrap',
    height: 500
  },
  paper1: {
    padding: theme.spacing(2),
    textAlign: 'center',
    height: 500,
    color: theme.palette.text.secondary,
  },
  webcam1: {
    padding: theme.spacing(2.5),
  },
  paper2: {
    padding: theme.spacing(2),
    textAlign: 'center',
    height: 400,
    color: theme.palette.text.secondary,
  },
  paper3: {
    padding: theme.spacing(1),
    textAlign: 'center',
    height: 200,
    color: theme.palette.text.secondary,
  },
  paper4: {
    padding: theme.spacing(1),
    textAlign: 'center',
    height: 500,
    color: theme.palette.text.secondary,
  },
}));

export default function PhotoAlbum(props) {
    const { value, index} = props;
    const classes = useStyles();
    const theme = createMuiTheme({
        typography: {
          useNextVariants: true
        }
       });
    TabPanel.propTypes = {
        children: PropTypes.node,
        index: PropTypes.any.isRequired,
        value: PropTypes.any.isRequired,
      };
    const webcamRef = React.useRef(null);

    const uploadImage = (formData) => {
      axios
        .post('/addUserPhoto', formData)
        .then(() => {
          console.log('success!')
        })
        .catch((err) => console.log(err));
    };

    function b64toBlob(b64Data, contentType, sliceSize=512) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;

      var byteCharacters = atob(b64Data);
      var byteArrays = [];

      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          var slice = byteCharacters.slice(offset, offset + sliceSize);

          var byteNumbers = new Array(slice.length);
          for (var i = 0; i < slice.length; i++) {
              byteNumbers[i] = slice.charCodeAt(i);
          }

          var byteArray = new Uint8Array(byteNumbers);

          byteArrays.push(byteArray);
      }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
    }
 
    const capture = React.useCallback(
        () => {
          const imageSrc = webcamRef.current.getScreenshot();
          var block = imageSrc.split(";");
          var contentType = block[0].split(":")[1];// In this case "image/gif"
          var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
          // Convert it to a blob to upload
          var blob = b64toBlob(realData, contentType);
          console.log(imageSrc);
          const formData = new FormData();
          formData.append('image', blob);
          formData.append('deviceID', 'myDevice123');
          formData.append('name', 'Adhil Iqbal');
          uploadImage(formData);
        },
        [webcamRef]
    );
    function FormRow() {
      return (
        <React.Fragment>
          <Grid item xs={4}>
            <Paper className={classes.paper3}>item</Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper3}>item</Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper className={classes.paper3}>item</Paper>  
          </Grid>
        </React.Fragment>
      );
    }

    function TabPanel(props) {
        const { children, value, name, index, ...other } = props;
      
        return (
          <Typography
            component="div"
            role="tabpanel"
            hidden={value !== index}
            id={`action-tabpanel-${index}`}
            aria-labelledby={`action-tab-${index}`}
            {...other}
          >
            {value === index && <Box p={3}>{children}</Box>}
          </Typography>
        );
      }
    const videoConstraints = {
        width: 900,
        height: 720,
        facingMode: "user"
      };

    return (
        <div>
            <TabPanel value={value} index={index} dir={theme.direction}>
            <Grid container spacing={1}>
            <div className={classes.root}>
            <Grid container spacing={3}>
              <Grid item xs={8}>
              <div className={classes.root2}>
              <Box component="div" my={2} overflow="auto" bgcolor="background.paper" height="90%">
                <Grid container spacing={1}>
                  <Grid container item xs={12} spacing={3}>
                    <FormRow />
                  </Grid>
                  <Grid container item xs={12} spacing={3}>
                    <FormRow />
                  </Grid>
                  <Grid container item xs={12} spacing={3}>
                    <FormRow />
                  </Grid>
                  <Grid container item xs={12} spacing={3}>
                    <FormRow />
                  </Grid>
                  <Grid container item xs={12} spacing={3}>
                    <FormRow />
                  </Grid>
                  <Grid container item xs={12} spacing={3}>
                    <FormRow />
                  </Grid>
                  <Grid container item xs={12} spacing={3}>
                    <FormRow />
                  </Grid>
                  <Grid container item xs={12} spacing={3}>
                    <FormRow />
                  </Grid>
                  <Grid container item xs={12} spacing={3}>
                    <FormRow />
                  </Grid>
                  <Grid container item xs={12} spacing={3}>
                    <FormRow />
                  </Grid>
                </Grid>
              </Box>
              </div>
              </Grid>
              <Grid item xs={4}>
                <div className = {classes.webcam1} >
                <Webcam
                  audio={false}
                  height={100 + '%'}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={100 + '%'}
                  videoConstraints={videoConstraints}
                />
                <Button variant="contained" color="secondary" onClick={capture}>
                Capture
                </Button>
                </div>
              </Grid>
            </Grid>
            </div>
            </Grid>
            </TabPanel>
        </div>
    )
}

