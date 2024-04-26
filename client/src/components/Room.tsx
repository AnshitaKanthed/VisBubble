import { useEffect, useRef, useState } from "react";
import { Socket, io } from "socket.io-client";


const URL = "https://liberal-shantee-anshitakanthed.koyeb.app";


export const Room = ({
    name,
    localAudioTrack,
    localVideoTrack
}: {
    name: string,
    localAudioTrack: MediaStreamTrack | null,
    localVideoTrack: MediaStreamTrack | null,
}) => {
    const [lobby, setLobby] = useState(true);
    const [, setSocket] = useState<null | Socket>(null);
    const [, setSendingPc] = useState<null | RTCPeerConnection>(null);
    const [, setReceivingPc] = useState<null | RTCPeerConnection>(null);
    const [, setRemoteVideoTrack] = useState<MediaStreamTrack | null>(null);
    const [, setRemoteAudioTrack] = useState<MediaStreamTrack | null>(null);
    const [, setRemoteMediaStream] = useState<MediaStream | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const localVideoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const socket = io(URL);
        socket.on('send-offer', async ({ roomId }) => {
            console.log("sending offer");
            setLobby(false);
            const pc = new RTCPeerConnection();

            setSendingPc(pc);
            if (localVideoTrack) {
                console.error("added tack");
                console.log(localVideoTrack)
                pc.addTrack(localVideoTrack)
            }
            if (localAudioTrack) {
                console.error("added tack");
                console.log(localAudioTrack)
                pc.addTrack(localAudioTrack)
            }

            pc.onicecandidate = async (e) => {
                console.log("receiving ice candidate locally");
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "sender",
                        roomId
                    })
                }
            }

            pc.onnegotiationneeded = async () => {
                console.log("on negotiation neeeded, sending offer");
                const sdp = await pc.createOffer();
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                pc.setLocalDescription(sdp)
                socket.emit("offer", {
                    sdp,
                    roomId
                })
            }
        });

        socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
            console.log("received offer");
            setLobby(false);
            const pc = new RTCPeerConnection();
            pc.setRemoteDescription(remoteSdp)
            const sdp = await pc.createAnswer();
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            pc.setLocalDescription(sdp)
            const stream = new MediaStream();
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }

            setRemoteMediaStream(stream);
            setReceivingPc(pc);
            // window.pcr = pc;
            pc.ontrack = () => {
                alert("ontrack");
            }

            pc.onicecandidate = async (e) => {
                if (!e.candidate) {
                    return;
                }
                console.log("omn ice candidate on receiving seide");
                if (e.candidate) {
                    socket.emit("add-ice-candidate", {
                        candidate: e.candidate,
                        type: "receiver",
                        roomId
                    })
                }
            }

            socket.emit("answer", {
                roomId,
                sdp: sdp
            });
            setTimeout(() => {
                const track1 = pc.getTransceivers()[0].receiver.track
                const track2 = pc.getTransceivers()[1].receiver.track
                console.log(track1);
                if (track1.kind === "video") {
                    setRemoteAudioTrack(track2)
                    setRemoteVideoTrack(track1)
                } else {
                    setRemoteAudioTrack(track1)
                    setRemoteVideoTrack(track2)
                }
                //@ts-expect-error: It is what it is
                remoteVideoRef.current.srcObject.addTrack(track1)
                //@ts-expect-error: It is what it is
                remoteVideoRef.current.srcObject.addTrack(track2)
                //@ts-expect-error: It is what it is
                remoteVideoRef.current.play();
            }, 5000)
        });

        socket.on("answer", ({ sdp: remoteSdp }) => {
            setLobby(false);
            setSendingPc(pc => {
                pc?.setRemoteDescription(remoteSdp)
                return pc;
            });
            console.log("loop closed");
        })

        socket.on("lobby", () => {
            setLobby(true);
        })

        socket.on("add-ice-candidate", ({ candidate, type }) => {
            console.log("add ice candidate from remote");
            console.log({ candidate, type })
            if (type == "sender") {
                setReceivingPc(pc => {
                    if (!pc) {
                        console.error("receicng pc nout found")
                    } else {
                        console.error(pc.ontrack)
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            } else {
                setSendingPc(pc => {
                    if (!pc) {
                        console.error("sending pc nout found")
                    }
                    pc?.addIceCandidate(candidate)
                    return pc;
                });
            }
        })

        setSocket(socket)
    }, [localAudioTrack, localVideoTrack, name])

    useEffect(() => {
        if (localVideoRef.current) {
            if (localVideoTrack) {
                localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
                localVideoRef.current.play();
            }
        }
    }, [localVideoRef, localVideoTrack])

    return (
        <div className="container d-flex flex-column align-items-center mt-5">
            <h2 className="mb-4">Welcome, {name}</h2>
            <div className="row">
                <div className="col-12 col-md-6 order-md-1 order-2 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title">Your Video</h5>
                        </div>
                        <div className="card-body">
                            <video
                                autoPlay
                                width={400}
                                height={400}
                                ref={localVideoRef}
                                className="w-100"
                            />
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 order-md-2 order-1 mb-4">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="card-title">Remote Video</h5>
                        </div>
                        <div className="card-body">
                            {lobby ? (
                                <p className="text-muted">Waiting to connect you to someone...</p>
                            ) : (
                                <video
                                    autoPlay
                                    width={400}
                                    height={400}
                                    ref={remoteVideoRef}
                                    className="w-100"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
