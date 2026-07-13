require("dotenv").config();

const mqtt = require("mqtt");
const { Pool } = require("pg");


// Supabase接続

const db = new Pool({

    host: process.env.SUPABASE_HOST,

    database: process.env.SUPABASE_DATABASE,

    user: process.env.SUPABASE_USER,

    password: process.env.SUPABASE_PASSWORD,

    port: process.env.SUPABASE_PORT,

    ssl: {
        rejectUnauthorized:false
    }

});


// MQTT接続

const client = mqtt.connect(
    process.env.MQTT_URL
);



client.on("connect",()=>{

    console.log("MQTT connected");


    client.subscribe(
        "chat/+/msg"
    );


});



client.on(
"message",
async(topic,message)=>{


    try{

        const data =
        JSON.parse(
            message.toString()
        );


        const room =
        topic.split("/")[1];


        console.log(
            "受信:",
            data
        );


        await db.query(

        `
        INSERT INTO messages
        (
            id,
            room,
            name,
            message,
            time
        )

        VALUES
        ($1,$2,$3,$4,$5)

        ON CONFLICT DO NOTHING
        `,

        [
            data.msgId,
            room,
            data.name,
            data.msg,
            data.time
        ]

        );


        console.log(
            "Supabase保存完了"
        );


    }catch(error){

        console.error(error);

    }


});