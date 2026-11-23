import {
    SiNetflix,
    SiSpotify,
    SiYoutube,
    SiApplemusic,
    SiAppletv,
    SiIcloud,
    SiNotion,
    SiDropbox,
    SiDuolingo,
    SiZoom,
    SiAudible,
    SiGoogledrive,
} from "@thinkhuman/react-native-simple-icons";

import PrimeVid from "../assets/subscriptions/PrimeVid.svg";

export const subscriptionCompanies = [
    { id: "netflix", name: "Netflix", Icon: SiNetflix },
    { id: "spotify", name: "Spotify", Icon: SiSpotify },
    { id: "youtube-premium", name: "YouTube Premium", Icon: SiYoutube },
    { id: "apple-music", name: "Apple Music", Icon: SiApplemusic },
    { id: "apple-tv", name: "Apple TV+", Icon: SiAppletv },
    { id: "icloud", name: "iCloud+", Icon: SiIcloud },
    { id: "notion", name: "Notion", Icon: SiNotion },
    { id: "dropbox", name: "Dropbox", Icon: SiDropbox },
    { id: "duolingo", name: "Duolingo", Icon: SiDuolingo },
    { id: "zoom", name: "Zoom", Icon: SiZoom },
    { id: "audible", name: "Audible", Icon: SiAudible },
    { id: "google-drive", name: "Google Drive", Icon: SiGoogledrive },
    {
        id: "prime-video",
        name: "Prime Video",
        image: PrimeVid,
    },

] as const;