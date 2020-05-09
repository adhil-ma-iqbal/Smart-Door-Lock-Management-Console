import React, { Component } from 'react';
import Webcam from 'react-webcam';
import { loadModels, getFullFaceDescription, createMatcher, getImage} from '../api/face';
import axios from 'axios';
import fs from 'fs';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { createMuiTheme } from "@material-ui/core/styles";
import LinearProgress from '@material-ui/core/LinearProgress';
import LinearDeterminate from './Progress';
import EnhancedTable from './OccupantTable';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

var base64ToImage = require('base64-to-image');
// Import face profile
const JSON_PROFILE = require('../descriptors/bnk48.json');
const os = require('os');
const WIDTH = 420;
const CONSOLE_WIDTH = 840;
const HEIGHT = 420;
const inputSize = 160;
const numImages = 20;

const useStyles = makeStyles(theme => ({
  avatar: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.secondary.main,
  },
}));

function SmartLockIcon (){
  const classes = useStyles();
  return (
    <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
    </Avatar>
  )
}

export default class VideoInput extends Component {
  constructor(props) {
    super(props);
    this.webcam = React.createRef();
    this.blob = null;
    this.state = {
      fullDesc: null,
      detections: null,
      descriptors: null,
      faceMatcher: null,
      match: null,
      facingMode: null,
      image: null,
      imageArray: [],
      occupantArray: [],
      numScreenShots: 0,
      numUploaded: 0,
      occupantName:'',
      firstLoad:true,
      captureOn:false,
      captureCompleted:false,
      uploadOn:false,
      uploadCompleted:false,
      deviceID: this.props.location.state.deviceID
    };
    
    this.handleOnChange = this.handleOnChange.bind(this);
    this.getOccupants();
  }

  handleOnChange = (e) => {
    this.setState({occupantName: e.target.value});
  };

  componentDidMount = async () => {
    await loadModels();
    //this.startCapture();   
 };

  b64toBlob = (b64Data, contentType, sliceSize) => {
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
//https://cors-anywhere.herokuapp.com
//https://ec2-23-20-177-238.compute-1.amazonaws.com:6235

  getOccupants = () => {
    const userData = {
      deviceID: this.state.deviceID
    }
    console.log(userData);
    axios({
      url: 'https://asia-east2-smartlock-51f33.cloudfunctions.net/api/getOccupants',
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
        this.setState({occupantArray: res.data.occupants});
        console.log(res.data.occupants)
      })
      .catch((err) => (console.log(err)));
  };

  uploadImage = async(formData) => {
    axios({
        url: 'https://cors-anywhere.herokuapp.com/https://asia-east2-smartlock-51f33.cloudfunctions.net/api/addUserPhoto',
        method: 'POST',
        headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Access-Control-Allow-Methods, Access-Control-Allow-Origin, Origin, Accept, Content-Type',
        'Accept': 'application/x-www-form-urlencoded',
        'Content-Type':'application/x-www-form-urlencoded'
        },
        data:formData
        })
        .then(res => (console.log(res)))
        .catch((err) => (console.log(err)));
    }

  startUpload = () => {
    this.setState({uploadOn: true});
    this.setState({captureCompleted: false});
    this.setState({uploadCompleted: false});
    this.interval = setInterval(() => {
      const { numUploaded, detections, image } = this.state;
      if(numUploaded < numImages)
      {
        var block =  this.state.imageArray[numUploaded].split(";");
        var contentType = block[0].split(":")[1];// In this case "image/gif"
        var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
        var blob = this.b64toBlob(realData, contentType);    // Convert it to a blob to upload
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('deviceID', this.state.deviceID);
        formData.append('name', this.state.occupantName);
        this.uploadImage(formData);
        let n = numUploaded + 1;
        this.setState({numUploaded: n});
      }
      else
      {
        clearInterval(this.interval);
        this.setState({ imageArray: [] });
        //this.setState({ occupantArray: this.state.occupantArray.concat(this.state.occupantName) });
        this.setState({uploadOn: false});
        this.setState({uploadCompleted: true});
        this.setState({firstLoad: true});
        this.setState({numScreenShots: 0});
        this.setState({numUploaded: 0});
      }
  }, 6000);
};

  startCapture = () => {
    this.setState({captureOn: true});
    this.setState({firstLoad: false});
    this.setState({uploadOn: false});
    this.setState({uploadCompleted: false});
    this.interval = setInterval(() => {
      const { numScreenShots, detections, image } = this.state;
      if(numScreenShots < numImages)
      {
        let drawBox = null;
        if (!!detections) {
            drawBox = detections.map((detection, i) => {
              let _H = detection.box.height;
              let _W = detection.box.width;
              let _X = detection.box._x + 10;
              let _Y = detection.box._y + 10;
              if(_H > 250 && _H <300 && _W > 250 && _H < 300)
              {
                    let n = numScreenShots + 1;
                    this.setState({ imageArray: this.state.imageArray.concat(image) });
                    this.setState({ numScreenShots: n });
                    console.log("Detected");
              }
            }
            )
           
        } 
        this.capture();
      }
      else
      {
        clearInterval(this.interval);
        this.setState({captureOn: false});
        this.setState({captureCompleted: true});
        // Sending to the cloud

        
      }
    }, 300);

  };

  sleep = (milliseconds) => {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < milliseconds);
  };

  uploadToCloud = async() => {
    this.setState({uploadOn: true});
    this.setState({captureCompleted: false});
    console.log("uploading......")
    const { numScreenShots, detections, image } = this.state;
    for (let i = 0; i < numScreenShots; i++) 
    {   
        var block =  this.state.imageArray[i].split(";");
        var contentType = block[0].split(":")[1];// In this case "image/gif"
        var realData = block[1].split(",")[1];// In this case "R0lGODlhPQBEAPeoAJosM...."
        var blob = this.b64toBlob(realData, contentType);    // Convert it to a blob to upload
        const formData = new FormData();
        formData.append('image', blob);
        formData.append('deviceID', this.state.deviceID);
        formData.append('name', this.state.occupantName);
        this.uploadImage(formData);
        this.setState({numUploaded: i});
        this.sleep(2000);
    }
    this.setState({uploadOn: false});
  };

  

  componentWillUnmount() {
     
    clearInterval(this.interval);
  };

  capture = async () => {
    const { numScreenShots } = this.state;
    let n = numScreenShots;
    if (!!this.webcam.current) {
      const imageSrc = this.webcam.current.getScreenshot();
      this.setState({ image: imageSrc })
      await getFullFaceDescription(
        imageSrc,
        inputSize
      ).then((fullDesc) => {
        if (!!fullDesc) {
          this.setState({
            detections: fullDesc.map(fd => fd.detection),
          });
        }
      });
    }
  };

  render() {
    const { detections, image, numScreenShots } = this.state;
    let videoConstraints = {
        width: WIDTH,
        height: HEIGHT,
        facingMode: 'user'
      };

    let camera = 'Front';
    let drawBox = null;
    const drawFaceBox = () => {
    if (!!detections) {
      drawBox = detections.map((detection, i) => {
        let _H = detection.box.height;
        let _W = detection.box.width;
        let _X = detection.box._x + 10;
        let _Y = detection.box._y + 10;
        if(_H > 200 && _H <250 && _W > 200 && _H < 250)
        {
            return (
            <div key={i}>
                <div
                style={{
                    position: 'absolute',
                    border: 'solid',
                    borderColor: 'blue',
                    height: 200,
                    width: 200,
                    transform: `translate(${_X}px,${_Y}px)`
                }}
                />
            
            </div>
            );
        }
      });
    }
  };

    const getAppStatus = () => {

      if(this.state.firstLoad)
      {
        return <div className="status"><p>Enter the name of the user, then click "Capture"</p></div>;
      }
      else if(this.state.captureOn)
      {
        return  <LinearDeterminate num={this.state.numScreenShots} total={numImages} type="capture"/>;
      }
      else if(this.state.uploadOn)
      {
        return  <LinearDeterminate num={this.state.numUploaded}    total={numImages} type="upload"/>;
      }
      else if(this.state.captureCompleted)
      {
        this.startUpload();
        return <p>Images for occupant: {this.state.occupantName} have been successfully captured. Please click "Upload" to send images to cloud</p>
      }
      else if(this.state.uploadCompleted)
      {
        this.getOccupants();
      }
  
    };

    return (
      <div
        className="Camera"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <SmartLockIcon/>
        <h1>Smart Door Lock Management Console</h1>
         <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: CONSOLE_WIDTH,
          alignItems: 'left'
        }}
      >
        <h3>Device: {this.state.deviceID}</h3>
      </div>

        <div style={{width: CONSOLE_WIDTH}}>
          {getAppStatus()}
        </div>
        
        <div
          style={{
            width: CONSOLE_WIDTH,
            height: HEIGHT
          }}
        >
          <div style={{ position: 'relative', width: CONSOLE_WIDTH, textAlign : 'center'}}>
            {!!videoConstraints ? (
              <Grid container spacing={3}>
              <Grid item xs={6}>
              <div style={{ position: 'absolute', textAlign : 'center'}} margin="20">
                
                <Webcam
                  audio={false}
                  width={WIDTH}
                  height={HEIGHT}
                  ref={this.webcam}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                />
                {drawFaceBox}
                <div>
                    <TextField
                    id="filled-full-width"
                    label="Name"
                    placeholder=" "
                    helperText="Enter the name of a home occupant"
                    fullWidth
                    margin="normal"
                    InputLabelProps={{
                        shrink: true,
                    }}
                    variant="filled"
                    onChange={(event) => this.handleOnChange(event)}
                    value={this.state.occupantName  }
                    />
                    <Grid container spacing={3}>
                    <Grid item xs={12}>
                    <Button variant="contained"  color="secondary" fullWidth="true" onClick={this.startCapture}>
                    Capture
                    </Button>
                    </Grid>
                    </Grid>
                </div>
                
                </div>
                {!!drawBox ? drawBox : null}
                </Grid>
                <Grid item xs={6}>
                  <div style={{height: 480, marginBottom: 45}}>
                  <Paper>
                  <EnhancedTable occupants={this.state.occupantArray} deviceID={this.state.deviceID}/>
                  </Paper>
                  </div>
                </Grid>
                </Grid>
            ) : null}
          </div>
        </div>
        
      </div>
      
    );
  }
}