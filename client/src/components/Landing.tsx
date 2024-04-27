import { useEffect, useRef, useState } from "react";
import { Room } from "./Room";

export const Landing = () => {
  const [name, setName] = useState("");
  const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack | null>(null);
  const [localVideoTrack, setlocalVideoTrack] = useState<MediaStreamTrack | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [joined, setJoined] = useState(false);

  const getCam = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    const audioTrack = stream.getAudioTracks()[0];
    const videoTrack = stream.getVideoTracks()[0];
    setLocalAudioTrack(audioTrack);
    setlocalVideoTrack(videoTrack);
    if (!videoRef.current) {
      return;
    }
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    videoRef.current.play();
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCam();
    }
  }, [videoRef]);

  if (!joined) {
    return (
      <div className="container d-flex justify-content-center align-items-center vh-100">
        <div className="row">
          <div className="col-md-8 mb-4">
            <video
              autoPlay
              ref={videoRef}
              className="w-100 rounded"
              style={{ maxHeight: "500px" }}
            ></video>
          </div>
          <div className="col-md-4">
            <h1 className="text-center mb-4">Welcome to VisBubble</h1>
            <div className="mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Enter your name"
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>
            <button
              className="btn btn-primary btn-block"
              onClick={() => {
                setJoined(true);
              }}
            >
              Join Video Call
            </button>
            <div className="mt-3">
              <p className="text-muted">
                Start your video calls with VisBubble. Simply enter your name and click "Join Video Call" to get started.
              </p>
              <p className="text-muted">
                For the best experience, please allow access to your camera and microphone when prompted.
              </p>
            </div>
            <hr />
            <div className="text-center">
              <p className="text-muted mb-1">
                &copy; {new Date().getFullYear()} VisBubble. All rights reserved.
              </p>
              <p className="text-muted mb-0">
                MIT License - See the <a href="https://github.com/adistrim/VisBubble?tab=MIT-1-ov-file" target="_blank">LICENSE</a> file for details.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />;
};