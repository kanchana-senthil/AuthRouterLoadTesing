import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    maxRedirects: 0,
    stages: [
        { duration: "10s", target: 2000 }, // fast ramp-up to a high point
        { duration: "10s", target: 5000 }, // Maintain users for specified time
        { duration: "5s", target: 0 }, // quick ramp-down to 0 users
    ],
};

export default function () {
    let url =
        "https://auth-dev.kpmgtaxconnect.co.uk/.well-known/openid-configuration";

    let res = http.get(url);

    check(res, {
        "status is 200": (r) => r.status === 200,
        // "content is present": (r) => r.body.includes("Auth Router Demo"),
    });

    sleep(1);
}
