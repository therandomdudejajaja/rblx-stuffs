// ==UserScript==
// @name         BYPASS.LAT V4 | Bypass for Work.ink, AdMaven, LootLabs & Shitvertise
// @namespace    BYPASS.LAT
// @version      4.8
// @description  Bypass AdLinks and various executors.
// @run-at       document-body
// @license      MIT
// @homepageURL  https://BYPASS.LAT/bio/woozie
// @supportURL   https://BYPASS.LAT/ds
// @icon         https://BYPASS.LAT/DLR.jpg
// @match        *://linkvertise.com/*/*
// @match        *://cety.app/*
// @match        *://cuty.io/*
// @match        *://cety.app/*
// @match        *://ouo.press/*
// @match        *://ouo.io/*
// @match        *://bstlar.com/*
// @match        *://mboost.me/*
// @match        *://work.ink/*/*
// @match        *://workink.net/*/*
// @match        *://r.work.ink/*/*
// @match        *://keyrblx.com/getkey/*
// @match        *://paster.so/*
// @match        *://gateway.platoboost.com/a/8?id=*
// @exclude      https://github.com/*
// @match        *://bypass.lat/userscript
// @match        *://rip.linkvertise.lol/*/*
// @exclude      *://tria.ge/*
// @connect      https://BYPASS.LAT/api/status
// @connect      https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css
// @connect      https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @resource     NOTYF_CSS https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.css
// @require      https://cdn.jsdelivr.net/npm/notyf@3/notyf.min.js
// @author       iWoozy_real
// @downloadURL  https://BYPASS.LAT/bypass/api/userscript/dlr_userscript.user.js
// @updateURL    https://BYPASS.LAT/bypass/api/userscript/dlr_userscript.user.js
// ==/UserScript==
(function() {
    'use strict';
    const CONFIG = {
        sleepTime: 25, // Seconds
        apiEndpoint: 'https://bypass.lat/',
        maxRetries: 100,
        lvDotLOL: true, // redirect linkvertise.com to linkvertise.lol
        indetectableVersion: false, // Avoid Detections
    };

    // Utility Functions
    const Utils = {
        wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

        createNotyf: () => {
            GM_addStyle(GM_getResourceText("NOTYF_CSS"));
            return new Notyf({
                duration: 5000,
                position: {
                    x: 'right',
                    y: 'top'
                }
            });
        },

        notify: (notyf, type, text) => {
            if (Utils.indetectableVersion) {
                console.log(`[${type}]: ${text}`)
                return;
            }
            try {
                notyf[type](text);
            } catch (error) {
                console.log(text);
                console.error('Notification error:', error);
            }
        },

        checkLink: (url) => {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },
    };
    const notyf = Utils.createNotyf();
    const notify = (type, text) => Utils.notify(notyf, type, text);
    class PlatoboostBypass {
        constructor() {
            this.apiBaseUrl = 'https://api-gateway.platoboost.com/v1';
            console.log('%cPlatoboostBypass initialized', 'color: green; font-weight: bold;')
        }
        static init() {
            console.log('%cInitializing PlatoboostBypass...', 'color: blue;');
            if (!document.title.includes('Just a moment...')) {
                console.log('%cStarting delta bypass...', 'color: blue;');
                new PlatoboostBypass().delta()
            } else {
                console.log('%cPage is in wait state, skipping delta...', 'color: orange;')
            }
        }
        makeRequest(url, method = 'GET', data = null) {
            console.log(`%cMaking ${ method } request to: ${ url }`, 'color: yellow;');
            return new Promise((resolve, reject) => {
                GM.xmlHttpRequest({
                    method: method,
                    url: url,
                    headers: {
                        'User-Agent': navigator.userAgent,
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    data: data ? JSON.stringify(data) : null,
                    onload: (response) => {
                        console.log(`%cReceived response: ${response.status }`, 'color: purple;');
                        if (response.status >= 200 && response.status < 300) {
                            const parsedResponse = JSON.parse(response.responseText);
                            console.log('%cResponse data:', 'color: teal;', parsedResponse);
                            resolve(parsedResponse)
                        } else {
                            location.href = location.href + "&security=1";
                            reject(new Error(`HTTP error! status: ${response.status }`))
                        }
                    },
                    onerror: (error) => {
                        console.error(`%cRequest failed: ${ error }`, 'color: red;');
                        reject(error)
                    }
                })
            })
        }
        async releaseChallenge(keySystemId, id, data) {
            const url = `${this.apiBaseUrl }/challenge/release/${ keySystemId }/${ id }`;
            console.log(`%cReleasing challenge with ID: ${ id }`, 'color: green;');
            return this.makeRequest(url, 'POST', data)
        }
        async loadCaptcha(type, siteKey) {
            console.log(`%cLoading captcha of type: ${ type }`, 'color: blue;');
            return new Promise((resolve, reject) => {
                this.createBubbleAnimation();
                const container = document.querySelector('#hcaptcha-container');
                const script = document.createElement('script');
                script.src = type === 'hCaptcha' ? 'https://js.hcaptcha.com/1/api.js' : 'https://challenges.cloudflare.com/turnstile/v0/api.js';
                script.async = true;
                script.onload = () => {
                    console.log(`%cCaptcha script loaded successfully`, 'color: green;');
                    if (type === 'hCaptcha') {
                        hcaptcha.render(container, {
                            sitekey: siteKey,
                            callback: resolve
                        })
                    } else {
                        turnstile.render(container, {
                            sitekey: siteKey,
                            callback: resolve
                        })
                    }
                };
                script.onerror = () => {
                    console.error(`%cFailed to load captcha script`, 'color: red;');
                    reject(new Error('Captcha script load error'))
                };
                document.head.appendChild(script)
            })
        }
        createBubbleAnimation() {
            if (document.title) {
                document.body.innerHTML = "";
                document.body.style.margin = "0";
                document.body.style.padding = "0";
                document.body.style.backgroundColor = "#1a1a1a";
                document.body.style.overflow = "hidden";
                document.body.style.fontFamily = "Arial, sans-serif";
                const container = document.createElement('div');
                container.style.position = "absolute";
                container.style.top = "50%";
                container.style.left = "50%";
                container.style.transform = "translate(-50%, -50%)";
                container.style.textAlign = "center";
                const text = document.createElement('div');
                text.textContent = "Please solve the captcha";
                text.style.color = "#ffffff";
                text.style.fontSize = "2rem";
                text.style.letterSpacing = "0.3rem";
                text.style.marginBottom = "20px";
                text.style.animation = "fadeIn 2s ease-in-out infinite alternate";
                const fadeInKeyframes = `@keyframes fadeIn {0% { opacity: 0.2; }100% { opacity: 1; }}`;
                const style = document.createElement('style');
                style.textContent = fadeInKeyframes;
                document.head.appendChild(style);
                container.appendChild(text);
                const captchaDiv = document.createElement('div');
                captchaDiv.id = 'hcaptcha-container';
                captchaDiv.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                captchaDiv.style.padding = "20px";
                captchaDiv.style.borderRadius = "10px";
                container.appendChild(captchaDiv);
                for (let i = 0; i < 20; i += 1) {
                    const bubble = document.createElement('div');
                    bubble.style.position = "absolute";
                    bubble.style.borderRadius = "50%";
                    bubble.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    const size = Math.random() * 50 + 10;
                    bubble.style.width = `${ size }px`;
                    bubble.style.height = `${ size }px`;
                    bubble.style.left = `${Math.random()*100}%`;
                    bubble.style.top = `${Math.random()*100}%`;
                    bubble.style.animation = `float ${Math.random()*4+4}s ease-in-out infinite`;
                    const floatKeyframes = `@keyframes float {0%, 100% { transform: translateY(0); }50% { transform: translateY(-20px); }}`;
                    const bubbleStyle = document.createElement('style');
                    bubbleStyle.textContent = floatKeyframes;
                    document.head.appendChild(bubbleStyle);
                    document.body.appendChild(bubble)
                }
                document.body.appendChild(container)
            }
        }
        async getCaptchaResponse(type) {
            let response = "";
            console.log('%cWaiting for captcha response...', 'color: blue;');
            while (!response) {
                response = type === 'hCaptcha' ? hcaptcha.getResponse() : turnstile.getResponse();
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
            console.log(`%cCaptcha response obtained: ${ response }`, 'color: green;');
            return response
        }
        async main() {
            const tokenId = new URLSearchParams(location.search).get("id");
            console.log(`%cMain function called with token ID: ${ tokenId }`, 'color: blue;');
            const siteKey = 'eb4b3d35-553f-4df6-86a8-9e3884e6f743';
            await this.loadCaptcha('hCaptcha', siteKey);
            const token = await this.getCaptchaResponse('hCaptcha');
            if (token) {
                console.log(`%cReleasing challenge with captcha token: ${ token }`, 'color: green;');
                await this.releaseChallenge("8", tokenId, {
                    captcha: token,
                    type: "hCaptcha"
                });
                this.DSCLoader(`https://gateway.platoboost.com/a/8?id=${location.href.replace("https://gateway.platoboost.com/a/8?id=","")}`)
            }
        }
        async delta() {
            if (document.body.innerHTML.includes("Please return to the service for access")) {
                return
            }
            const id = new URLSearchParams(window.location.search).get("id");
            console.log(`%cDelta function called with ID: ${ id }`, 'color: blue;');
            const data = await this.makeRequest(`https://sv1-9929.woo-cdn.site/MDTdebug_nosource?url=https://gateway.platoboost.com/a/8?id=${ id }`);
            if (data.result.includes("security")) {
                console.log(`%cDetected security challenge, proceeding to main...`, 'color: green;');
                await this.main()
            } else {
                if (data.result.startsWith("KEY_") && !document.body.innerHTML.includes("Please return to the service")) {
                    location.href = location.href;
                    return
                }
                console.log(`%cNo security challenge detected.`, 'color: green;')
            }
        }
        DSCLoader(url) {
            console.log(`%cDelta function called with URL: ${ url }`, 'color: blue;');
            const deltaId = url.replace("https://gateway.platoboost.com/a/8?id=", "");
            const headers = {
                "origin": "https://gateway.platoboost.com",
                "referer": "https://gateway.platoboost.com/",
                "user-agent": navigator.userAgent
            };
            this.makeRequest(`https://api-gateway.platoboost.com/v1/authenticators/8/${ deltaId }`, 'GET', null).then(checkKeyResponse => {
                const key = checkKeyResponse.key;
                console.log(`Key from check: ${ key }`);
                if (key) {
                    return key
                }
                const payload = {
                    "captcha": "",
                    "type": ""
                };
                return this.makeRequest(`https://api-gateway.platoboost.com/v1/sessions/auth/8/${ deltaId }`, 'POST', payload).then(postResponse => {
                    const redirectLink = postResponse.redirect;
                    const redirectParam = new URL(redirectLink).searchParams.get('r');
                    const token = this.extractToken(redirectParam);
                    console.log(`Extracted token: ${ token }`);
                    return this.makeRequest(`https://api-gateway.platoboost.com/v1/sessions/auth/8/${ deltaId }/${ token }`, 'PUT').then(putResponse => {
                        if (putResponse.status === 200) {
                            return this.makeRequest(`https://api-gateway.platoboost.com/v1/authenticators/8/${ deltaId }`, 'GET')
                        } else {
                            throw new Error(`PUT request failed: ${putResponse.text }`)
                        }
                    })
                })
            }).then(finalResponse => {
                console.log(`Final response: ${finalResponse.key }`)
            }).catch(err => {
                console.error(`Error in delta: ${ err }`)
            })
        }
        extractToken(redirectParam) {
            const decodedParam = atob(redirectParam);
            const match = decodedParam.match(/&tk=(\w{4})/);
            return match ? match[1] : null
        }
    }
    const RedirectHandler = {
        checkForRedirect: () => {
            if (document.title.includes('Just a moment...') || document.title.includes('Just a second...')) {
                return true;
            }

            const urlParams = new URLSearchParams(location.search);
            const redirectTo = urlParams.get('x_dlr_redirect_to');
            if (redirectTo) {
                window.location.replace(decodeURIComponent(redirectTo));
                return true;
            }

            return false;
        },

        adSpoof: (link, referrer) => {
            const prefix = "?" //referrer.includes('?') ? '&' : '?';
            const linkElement = document.createElement('a');
            linkElement.href = `${referrer}/sp/api/BypassLatOnTop${prefix}x_dlr_redirect_to=${encodeURIComponent(link)}`; //`${referrer}${prefix}x_dlr_redirect_to=${encodeURIComponent(link)}`;
            linkElement.textContent = ';';
            document.body.appendChild(linkElement);
            linkElement.click();
        }
    };

    // Turnstile Handling
    const TurnstileHandler = {
        getTurnstileResponse: async() => {
            await Utils.wait(3)
            notify('success', 'Please solve the captcha');

            const intervalId = setInterval(() => {
                const response = turnstile.getResponse();
                notify('success', `Please solve Turnstile Captcha`);
            }, 5000);

            let response = null;

            try {
                while (!response) {
                    response = turnstile.getResponse();
                    await Utils.wait(1);
                }
            } finally {
                clearInterval(intervalId);
            }

            return response;
        }
    };
    // Bypass Functions
    const BypassHandler = {
        bypassVIP: async() => {
            if (location.href) {
                try {
                    const response = await fetch(`https://api.bypass.vip/bypass?url=${encodeURIComponent(location.href)}`);
                    const data = await response.json();
                    location.href = data.result;
                } catch (error) {
                    console.error('BypassVIP Error:', error);
                    notify('error', 'BypassVIP failed. Trying alternative method...');
                }
            }
        },

        clientSideBypess: async() => {
            if (location.href.toLowerCase().includes("work.ink/") || location.href.toLowerCase().includes("/s?") || location.href.toLowerCase().includes("linkvertise.com")) {
                console.log("Client-side started!")
            } else {
                return false
            }
            let info = `| Waiting ${CONFIG.sleepTime} seconds to avoid bypass detections |`;
            if (!Utils.indetectableVersion) {
                await StyleHandler.setStyle();
                const infoInterval = setInterval(() => {
                    document.body.innerHTML = `<div>${info}</div>`;
                }, 1000);
            }

            info = "Client-Side Bypassing, please wait...";
            const apiUrl = `${CONFIG.apiEndpoint}api/free/bypass`;
            const urlParam = encodeURIComponent(window.location.href);

            for (let retryCount = 0; retryCount < CONFIG.maxRetries; retryCount++) {
                try {
                    const response = await fetch(`${apiUrl}?url=${urlParam}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.result.startsWith("http")) {
                            info = `Client-side bypass success! Please wait while we redirect you... (result : ${data.result})`;
                            clearInterval(infoInterval);
                            await Utils.wait(2);
                            location.href = data.result;
                            return true;
                        }
                        if (data.result.includes("bypass fail")) {
                            info = `Bypass fail! Error bypassing your link: ${data.result}`;
                            clearInterval(infoInterval);
                            return false;
                        }
                        info = "Bypassed! Result copied to clipboard!";
                        GM_setClipboard(data.result);
                        clearInterval(infoInterval);
                        return true;
                    }
                    info = response.status === 500 ?
                        "The API is being rate-limited by Cloudflare. Please use our Discord bot to bypass this link." :
                        `Error while getting the API result, error code: ${response.status}. Retrying... (${retryCount + 1}/${CONFIG.maxRetries})`;
                } catch (error) {
                    console.error('Error while fetching data:', error);
                }
                await Utils.wait(1); // Wait before retrying
            }

            info = "Exceeded maximum retries. Unable to fetch data. Please use our Discord bot to bypass this link.";
            clearInterval(infoInterval);
            return false;
        },

        bypass: async() => {
            if (location.href.toLowerCase().includes("https://bypass.lat/userscript")) {
                turnstile.render(document.querySelector(".cf-turnstile"))
                const csr = await TurnstileHandler.getTurnstileResponse();
                notify("success", "Bypassing your link...");
                try {
                    const cs = await fetch(`https://BYPASS.LAT/api/bypass?url=${encodeURIComponent(new URLSearchParams(location.search).get("url"))}&apikey=DLR_PUBLIC&tk=${csr}`);
                    const sjson = await cs.json();
                    if (sjson.success) {
                        notify("success", "Bypass done! redirecting...");
                        RedirectHandler.adSpoof(sjson.result, new URL(new URLSearchParams(location.search).get("url")).origin)
                    } else {
                        notify("error", sjson.result);
                    }
                } catch (error) {
                    console.error('Bypass Error:', error);
                    notify("error", "An error occurred during bypass");
                }
            } else {
                if (location.href.startsWith("https://gateway.platoboost.com/a/8?id=")) {
                    PlatoboostBypass.init();
                    return;
                }
                if (window.location.href.includes("linkvertise.com") && CONFIG.lvDotLOL) {
                    window.location.href = window.location.href.replace("linkvertise.com", "rip.linkvertise.lol");
                    return;
                }
                if (window.location.href.includes("rip.linkvertise.lol/")) {
                    const match = document.documentElement.innerHTML.match(/const\s+destination\s*=\s*(.*?);/)[0].replace("const destination = ", "")
                    let result = decodeURIComponent(match.match(/`(.*?)`/)[1])
                    let isUrl = Utils.checkLink(result)
                    setTimeout(() => {
                        notify("success", "Bypass done!");
                        if (isUrl) {
                            notify("success", "Redirecting to " + result);
                            RedirectHandler.adSpoof(result, "https://linkvertise.com")
                        }
                    }, 2000)
                    return;
                }
                const clientSideSuccess = await BypassHandler.clientSideBypess();
                if (!clientSideSuccess) {
                    notify('error', "Client-side bypass failed! Redirecting to our bypass website...");
                    if (Utils.indetectableVersion) {
                        location.href = `https://bypass.lat/userscript?url=${encodeURIComponent(location.href)}`
                        return;
                    }
                    const linkElement = document.createElement('a');
                    linkElement.href = `https://bypass.lat/userscript?url=${encodeURIComponent(location.href)}`;
                    linkElement.textContent = 'Bypass result';
                    document.body.appendChild(linkElement);
                    linkElement.click();
                }
            }
        }
    };

    // Style Handler
    const StyleHandler = {
        setStyle: async() => {
            try {
                const style = document.createElement('style');
                style.textContent = `
                :root {
                    --background-color: #1a1a1a;
                    --text-color: #ffffff;
                    --border-radius: 10px;
                }

                body {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-size: cover;
                    background-position: center;
                    background-color: var(--background-color);
                    color: var(--text-color);
                    font-family: Arial, sans-serif;
                    font-size: 24px;
                    margin: 0;
                    overflow: hidden;
                    transition: all 0.3s ease;
                }

                .container {
                    background-color: rgba(255, 255, 255, 0.1);
                    padding: 20px;
                    border-radius: var(--border-radius);
                    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
                }

                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }

                .bubble {
                    position: absolute;
                    background-color: rgba(255, 255, 255, 0.1);
                    border-radius: 50%;
                    animation: float 4s ease-in-out infinite;
                }

                .raindrop {
                    position: absolute;
                    width: 2px;
                    height: 20px;
                    background-color: rgba(255, 255, 255, 0.5);
                    animation: fall linear infinite;
                }

                @keyframes fall {
                    to { transform: translateY(100vh); }
                }
            `;
                document.head.appendChild(style);

                // Crear burbujas
                for (let i = 0; i < 20; i++) {
                    const bubble = document.createElement('div');
                    bubble.className = 'bubble';
                    bubble.style.left = `${Math.random() * 100}vw`;
                    bubble.style.top = `${Math.random() * 100}vh`;
                    bubble.style.width = `${Math.random() * 50 + 10}px`;
                    bubble.style.height = bubble.style.width;
                    bubble.style.animationDuration = `${Math.random() * 2 + 2}s`;
                    document.body.appendChild(bubble);
                }

                // Crear efecto de lluvia
                for (let i = 0; i < 100; i++) {
                    const raindrop = document.createElement('div');
                    raindrop.className = 'raindrop';
                    raindrop.style.left = `${Math.random() * 100}vw`;
                    raindrop.style.animationDuration = `${Math.random() * 0.5 + 0.5}s`;
                    raindrop.style.animationDelay = `${Math.random() * 2}s`;
                    document.body.appendChild(raindrop);
                }

            } catch (error) {
                console.error('Style setting error:', error);
            }
        }
    };
    document.addEventListener('DOMContentLoaded', async() => {
        if (RedirectHandler.checkForRedirect()) return;

        notify('success', "Dynamic Link Resolver Userscript LOADED!");

        const r = new URL(window.location.href).searchParams.get("r");
        if (r && location.href.toLowerCase().includes("linkvertis")) {
            await BypassHandler.bypassVIP();
            return;
        } else if (r) {
            location.href = atob(new URL(window.location.href).searchParams.get("r"))
        }
        await BypassHandler.bypass();
    });

})();
