import { useEffect } from "react";

const Island = () => {
    const callAPI = async () => {
        const data = await fetch('https://api-football-v1.p.rapidapi.com/v2/odds/league/865927/bookmaker/5?page=2')
        console.log(data.body)
    };

    useEffect(() => {
        callAPI();
    },[]);

    return (
        <div>
            This is an island
        </div>
    )
};

export default Island;