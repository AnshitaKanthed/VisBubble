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
              Join
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <Room name={name} localAudioTrack={localAudioTrack} localVideoTrack={localVideoTrack} />;
};