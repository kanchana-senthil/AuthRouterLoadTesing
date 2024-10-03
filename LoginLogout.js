import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
    maxRedirects: 0,
    stages:
        [
            { duration: "30s", target: 1000 }, // fast ramp-up to a high point
            { duration: "10s", target: 600 }, // Maintain users for specified time
            { duration: "10s", target: 0 } // quick ramp-down to 0 users
        ]
};

export default function () {
    let url = 'https://auth-demo-one.kpmgtaxconnect.co.uk/';
    let mainurl = 'https://auth-demo-one.kpmgtaxconnect.co.uk/';
    let response;
    let maxRedirects = 20;

    // Handle Login page redirects
    for (let i = 0; i <= maxRedirects; i++) {
        response = http.get(url, { redirects: 0 });
        if (response.status >= 300 && response.status < 400) {
            url = response.headers['Location'];
            if (url === '/') {
                url = mainurl;
            }
        } else {
            break;
        }
    }

    check(response, {
        'Logout button exists': (r) => r.body.includes('<a class="nav-link text-dark" href="/Home/Logout">Logout</a>'),
        'status is 200': (r) => r.status === 200,
/*        'status is 400': (r) => r.status === 400,
        'status is 414': (r) => r.status === 414,
        'status is 500': (r) => r.status === 500,
        'status is 0': (r) => r.status === 0,*/
        'final url matched': (r) => r.request.url === mainurl,
        "content is present": (r) => r.body.includes("Home Page - KPMG.AuthRouter.TestMvc"),
    });

    const cookies = response.request.cookies;

    if (cookies['.AspNetCore.Cookies']) {
   //     console.log(`Session cookie value: ${cookies['.AspNetCore.Cookies'][0].value}`);
    }

    const doc = response.html();
    let link = doc.find('a').filter((i, el) => el.text().includes("/Home/Logout"));
    
    let logoutRes;
    let logoutMainURL = "https://auth-demo-one.kpmgtaxconnect.co.uk/Home/Logout";
    let logoutURL = "https://auth-demo-one.kpmgtaxconnect.co.uk/Home/Logout";
    if (link.url.length > 0) {

        // Handle Logout page redirects
        for (let i = 0; i <= maxRedirects; i++) {
            logoutRes = http.get(logoutURL);
            if (logoutRes.status >= 300 && logoutRes.status < 400) {
                logoutURL = logoutRes.headers['Location'];
                if (logoutURL=== '/Home/Logout') {
                    logoutURL = logoutMainURL;
                }
            } else {
                break;
            }
        }
      //  console.log(logoutRes.status);
        check(logoutRes, {
            'Logout page loads correctly': (r) => r.status === 200,
            'status is 400': (r) => r.status === 400,
            'status is 414': (r) => r.status === 414,
            'status is 500': (r) => r.status === 500,
            'status is 0': (r) => r.status === 0
        });
        
    } else {
        console.log('Link with the specified HREF not found');
    }

    sleep(1);
}