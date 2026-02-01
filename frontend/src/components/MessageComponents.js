import { Text } from "@chakra-ui/react";
import { DownloadIcon } from '@chakra-ui/icons';
import { downloadMedia } from "../utils/commonUtils";
const iconPDF = 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/27_Pdf_File_Type_Adobe_logo_logos-512.png';
const pusicPNG = 'http://upload.wikimedia.org/wikipedia/commons/e/e0/Music_player_logo.png';

export const IMAGE = ({ message }) => {
    return (
        <div style={{ position: 'relative' }}>
            <img style={{ width: 300, height: '100%', objectFit: 'cover' }} src={message} alt={"PDF"} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, cursor: "pointer" }}>
                <DownloadIcon
                    onClick={(e) => downloadMedia(e, message)}
                    style={{ fontSize: "30px", color: "black", cursor: "pointer" }}
                />
            </div>

        </div>
    )
}

export const PDF = ({ message }) => {
    return (
        <div style={{ display: 'flex', position: 'relative', width: "300px", justifyContent: "center", alignItems: "center" }}>
            <img src={iconPDF} alt="pdf-icon" style={{ width: 80 }} />
            <Text style={{ fontSize: 14, wordWrap: "black" }} >{message.split("/").pop()}</Text>

            <DownloadIcon
                onClick={(e) => downloadMedia(e, message)}
                style={{ fontSize: "50px", color: "black", cursor: "pointer" }}
            />
        </div>
    )
}

export const VIDEO = ({ message }) => {
    return (
        <video controls style={{ width: 300, height: '100%', objectFit: 'cover' }}>
            <source src={message} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
};


export const AUDIO = ({ message }) => {
    return (
        <div style={{ display: 'flex', position: 'relative', width: "300px", justifyContent: "center", alignItems: "center" }}>
            <img src={pusicPNG} alt="pdf-icon" style={{ width: 50 }} />
            <Text style={{ fontSize: 14, wordWrap: "wrap" }} >{message.split("/").pop()}</Text>
            <DownloadIcon
                onClick={(e) => downloadMedia(e, message)}
                style={{ fontSize: "30px", color: "black", cursor: "pointer" }}
            />
        </div>
    )
}