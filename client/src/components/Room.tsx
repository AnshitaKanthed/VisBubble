import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"
import { Socket, io } from "socket.io-client";

const URL = "http://localhost:3000"

export const Room = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    // const [searchParams] = useSearchParams();
    const name = searchParams.get("name");
    const [socket, setSocket] = useState<null | Socket>(null);
    const [lobby, setLobby] = useState(true);


    useEffect(() => {
        // logic to join room
        const socket = io(URL)
        socket.on("send-offer", ({roomId}) => {
            alert("send offer, please.")
            setLobby(false)
            socket.emit("offer", {
                sdp: "",
                roomId
            })
        })
        socket.on("offer", ({roomId, offer}) => {
            alert("send answer, please.")
            setLobby(false)
            socket.emit("answer", {
                roomId,
                sdp: ""
            })
        })
        socket.on("answer", ({roomId, answer}) => {
            setLobby(false)
            alert("connection done.")
        })
        socket.on("lobby", () => {
            setLobby(true)
        })
        setSocket(socket)
    }, [name])

    if (lobby) {
        return (
            <div>
                <h1>Waiting to connect you to someone...</h1>
            </div>
        )
    }

    return (
        <div>
            <h1>Hi, {name}</h1>
            <video width={400}></video>
            <video width={400}></video>
        </div>
    )
}