import { useEffect } from "react";
import { useSearchParams } from "react-router-dom"


export const Room = () => {
    // const [searchParams, setSearchParams] = useSearchParams();
    const [searchParams] = useSearchParams();
    const name = searchParams.get("name");

    useEffect(() => {
        // logic to join room
    }, [name])

    return (
        <div>
            <h1>Hi, {name}</h1>
        </div>
    )
}