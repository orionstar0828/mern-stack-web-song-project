// Libraries
import { useState, useRef, useEffect } from "react";
import Reactplayer from "react-player";
import { Row, Col } from "react-bootstrap";

// Components
import { VideoControls } from "./VideoControls";

// Styles
import styles from "../styles/VideoPlayer.module.scss";
import screenfull from "screenfull";
import { formatTime } from "../assets/Helper.js";

export const VideoPlayer = (props) => {
  // Reference of Video Player
  const videoRef = useRef(null);
  // Reference of Video Player Wrapper
  const videoWrapperRef = useRef(null);

  // State if controls are visible or not
  const [controlsVisibility, setControlsVisibility] = useState(false);

  // State for all controls of video player
  const [videoControls, setVideoControls] = useState({
    playing: props.playingState === 'play'? true : false,
    muted: false,
    volume: props.volume / 100,
    speed: 1,
    played: 0,
    seeking: false,
    isFullScreen: false
  });

  // Function to handle onHover on video player
  const handleOnHover = () => {
    if (!controlsVisibility) {
      setControlsVisibility(true);
      setTimeout(() => setControlsVisibility(false), 3000);
    }
  };

  // Function to handle OnProgress of Video
  const handleOnProgress = state => {
    if (!videoControls.seeking) {
      setVideoControls({ ...videoControls, played: state.played });
    }
  };
  const handleDoubleClick = ()=>{
    screenfull.toggle(videoWrapperRef.current);
      setVideoControls(current => ({
        ...current,
        isFullScreen: !current.isFullScreen
      }));
  };

  useEffect(()=>{
    if(videoControls.playing)
      props.callbackChangeVideoState('play')
    else
      props.callbackChangeVideoState('pause')
  }, [videoControls.playing])

  useEffect(()=>{
    if(videoControls.playing)
      props.onVolumeChange(videoControls.volume * 100)
    else
      props.onVolumeChange(videoControls.volume * 100)
  }, [videoControls.volume])

  useEffect(()=>{
    if(props.playingState === 'play') {
      setVideoControls(current => ({
        ...current,
        playing: true
      }))
    } else {
      setVideoControls(current => ({
        ...current,
        playing: false
      }))
    }
  }, [props.playingState])

  useEffect(()=>{
    setVideoControls(current => ({
      ...current,
      volume: props.volume / 100,
      muted: props.volume === 0 ? true : false
    }))
  }, [props.volume])

  const showPlayingTime = ()=>{
    if(videoRef.current != null){
      var current_time = formatTime(videoRef.current.getCurrentTime());
      var total_time = formatTime(videoRef.current.getDuration());
      props.playingTime(`${current_time}/${total_time}`);
    }
  }
  showPlayingTime();

  return (
    <section
      className={`${styles["VideoPlayerWrapper"]} bg-dark`}
      onMouseMove={() => handleOnHover()}
      ref={videoWrapperRef}
      onDoubleClick = {()=>{handleDoubleClick()}}
    >
      <Row className={`w-100`} style={{position: 'absolute', color: 'white', marginLeft: 5, marginTop: 4}}>
        <Col className="fw-bold" style={{fontSize: 20}} name="controls-overlay">
          Singer: {props.title}
        </Col>
      </Row>
      <Reactplayer
        ref={videoRef}
        url={props.url}
        width="100%"
        height="100%"
        playing={props.playingState === "play" ? true : false}
        muted={videoControls.muted}
        volume={videoControls.volume}
        playbackRate={videoControls.speed}
        onProgress={state => handleOnProgress(state)}
        onEnded={() => {setVideoControls({ ...videoControls, playing: false }); props.onVideoEnded();}}
      />
      {controlsVisibility && (
        <VideoControls
          controls={videoControls}
          setControls={setVideoControls}
          videoRef={videoRef}
          videoWrapperRef={videoWrapperRef}
          title={props.title}
        />
      )}
    </section>
  );
};
