require("dotenv").config();

const fetchNaver = async() => {
    try{
        const response = await fetch("https://papago.apigw.ntruss.com/nmt/v1/translation", {
            method: "POST",
            headers: {
                "x-ncp-apigw-api-key-id": process.env.NAVER_CLIENT_ID,
                "x-ncp-apigw-api-key": process.env.NAVER_CLIENT_SECRET,
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            },
            body: new URLSearchParams({
                source: "ko",
                target: "en",
                text: "수고 했다!"
            })
        })

        if(!response.ok) {
            throw new Error(`HTTP error! status ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
    } catch(err) {
        console.error(err);
    }

};

fetchNaver();