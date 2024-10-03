import http from "k6/http";
import { check } from "k6";

export const options = {

    stages: [
        { duration: '1ms', target: 0 }, // Start with O users and no load here
        { duration: '30s', target: 1000 }, // fast ramp-up to a high point
        { duration: '10s', target: 400 }, // Maintain users for specified time 
        { duration: '15s', target: 0 }  // quick ramp-down to 0 users
    ]
};

export default function () {
    var url =
        "https://auth-dev.kpmgtaxconnect.co.uk/.well-known/openid-configuration/jwks";

    var headerParam = {
        headers: {
            "Content-Type": "application/json",
        },
    };

    const response = http.get(url, headerParam);

    check(response, {
        "Response status reciving a 200 response ": (r) => r.status === 200,
    });

    let body = JSON.parse(response.body);
}