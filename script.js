// ==========================================
// FISHCAST v1
// GPS + Open-Meteo
// ==========================================

const pikeScore=document.getElementById("pikeScore");
const perchScore=document.getElementById("perchScore");
const zanderScore=document.getElementById("zanderScore");
const carpScore=document.getElementById("carpScore");

const pikeBar=document.getElementById("pikeBar");
const perchBar=document.getElementById("perchBar");
const zanderBar=document.getElementById("zanderBar");
const carpBar=document.getElementById("carpBar");
const city = document.getElementById("city");
const temperature = document.getElementById("temperature");
const weather = document.getElementById("weather");

const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const humidity = document.getElementById("humidity");
const sunset = document.getElementById("sunset");

const scoreValue = document.getElementById("scoreValue");
const scoreStatus = document.getElementById("scoreStatus");
const recommendation = document.getElementById("recommendationText");

window.addEventListener("load", () => {

    if (!navigator.geolocation) {

        city.innerText = "GPS niedostępny";
        return;

    }

    navigator.geolocation.getCurrentPosition(

        success,

        error,

        {

            enableHighAccuracy: true,
            timeout: 10000

        }

    );

});

function error() {

    city.innerText = "Brak lokalizacji";

}

async function success(position) {

    console.log(position.coords.latitude);
console.log(position.coords.longitude);

    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    getCity(lat, lon);

    getWeather(lat, lon);

}

async function getCity(lat, lon) {

    try {

        const response = await fetch(

            `https://geocode.maps.co/reverse?lat=${lat}&lon=${lon}`

        );

        const data = await response.json();
        console.log(data);

        city.innerText =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "Twoja lokalizacja";

    } catch {

        city.innerText = "Twoja lokalizacja";

    }

}

async function getWeather(lat, lon) {

    const url =

`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}
&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,weather_code
&daily=sunset
&timezone=auto`
.replace(/\n/g,'');

    const response = await fetch(url);

    const data = await response.json();

    updateUI(data);

}
// ==========================================
// UPDATE UI
// ==========================================

function updateUI(data) {

    const current = data.current;

    const daily = data.daily;

    const temp = Math.round(current.temperature_2m);

    const windSpeed = Math.round(current.wind_speed_10m);

    const pressureValue = Math.round(current.pressure_msl);

    const humidityValue = Math.round(current.relative_humidity_2m);

    temperature.innerHTML = `${temp}°`;

    weather.innerHTML = weatherDescription(current.weather_code);

    wind.innerHTML = `${windSpeed} km/h`;

    pressure.innerHTML = `${pressureValue} hPa`;

    humidity.innerHTML = `${humidityValue}%`;

    sunset.innerHTML = formatTime(daily.sunset[0]);

    const score = calculateFishScore({

        temp,

        wind: windSpeed,

        pressure: pressureValue,

        weather: current.weather_code

    });

    animateScore(score);

const message = scoreMessage(score);

recommendation.innerHTML = message;

scoreStatus.innerHTML = message;

applyTheme(current.weather_code, score);

animateCards();

updateSpecies(score);

}

// ==========================================
// WEATHER TRANSLATION
// ==========================================

function weatherDescription(code){

    switch(code){

        case 0:
            return "Bezchmurnie";

        case 1:
        case 2:
            return "Lekko pochmurno";

        case 3:
            return "Pochmurno";

        case 45:
        case 48:
            return "Mgła";

        case 51:
        case 53:
        case 55:
            return "Mżawka";

        case 61:
        case 63:
        case 65:
            return "Deszcz";

        case 71:
        case 73:
        case 75:
            return "Śnieg";

        case 95:
            return "Burza";

        default:
            return "Zmienne warunki";

    }

}

// ==========================================
// TIME
// ==========================================

function formatTime(dateString){

    const date = new Date(dateString);

    return date.toLocaleTimeString(
        "pl-PL",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}
// ==========================================
// FISH SCORE
// ==========================================

function calculateFishScore(data){

    let score = 50;

    // Wiatr

    if(data.wind <= 5){

        score += 20;

    }else if(data.wind <=10){

        score += 15;

    }else if(data.wind <=18){

        score += 8;

    }else{

        score -= 15;

    }

    // Ciśnienie

    if(data.pressure >=1012 && data.pressure<=1022){

        score +=20;

    }else if(data.pressure>=1005){

        score +=10;

    }else{

        score -=10;

    }

    // Temperatura

    if(data.temp>=15 && data.temp<=24){

        score +=15;

    }else if(data.temp>=10 && data.temp<=28){

        score +=8;

    }

    // Zachmurzenie

    if(data.weather===1 || data.weather===2){

        score+=10;

    }

    if(data.weather===0){

        score+=5;

    }

    if(data.weather===3){

        score+=8;

    }

    if(data.weather>=61){

        score-=20;

    }

    return Math.max(0,Math.min(score,100));

}

// ==========================================
// SCORE ANIMATION
// ==========================================

function animateScore(score){

    let current=0;

    const timer=setInterval(()=>{

        current++;

        scoreValue.innerHTML=current;

        const circle=document.querySelector(".progressCircle");

        const circumference=440;

        const offset=circumference-(score/100)*circumference;

        circle.style.strokeDashoffset=offset;

        if(current>=score){

            clearInterval(timer);

        }

    },15);

}

// ==========================================
// DESCRIPTION
// ==========================================

function scoreMessage(score){

    if(score>=90){

        return "🟢 Świetne warunki. Szczupak i okoń powinny być aktywne.";

    }

    if(score>=75){

        return "🟢 Dobre warunki. Warto zabrać spinning.";

    }

    if(score>=60){

        return "🟡 Warunki przeciętne. Ryby mogą żerować krócej.";

    }

    if(score>=40){

        return "🟠 Trudniejsze warunki. Szukaj głębszej wody.";

    }

    return "🔴 Słabe warunki. Lepiej zaplanować inny termin.";

}
// ==========================================
// PREMIUM EFFECTS
// ==========================================

function applyTheme(weatherCode, score){

    const bg = document.getElementById("background");

    // Domyślny motyw

    let gradient = `
        radial-gradient(circle at 15% 20%,rgba(43,211,255,.18),transparent 30%),
        radial-gradient(circle at 85% 10%,rgba(0,255,170,.15),transparent 25%),
        linear-gradient(180deg,#08131f,#10263d)
    `;

    // Bezchmurnie

    if(weatherCode===0){

        gradient=`
        radial-gradient(circle at 20% 15%,rgba(255,210,70,.25),transparent 25%),
        radial-gradient(circle at 80% 10%,rgba(60,180,255,.25),transparent 25%),
        linear-gradient(180deg,#0a2848,#174c73)
        `;

    }

    // Lekkie chmury

    if(weatherCode===1 || weatherCode===2){

        gradient=`
        radial-gradient(circle at 20% 15%,rgba(255,255,255,.12),transparent 25%),
        radial-gradient(circle at 80% 15%,rgba(0,180,255,.18),transparent 25%),
        linear-gradient(180deg,#10263d,#193d5a)
        `;

    }

    // Deszcz

    if(weatherCode>=61){

        gradient=`
        radial-gradient(circle at 20% 15%,rgba(120,150,255,.15),transparent 25%),
        radial-gradient(circle at 80% 20%,rgba(0,100,255,.15),transparent 25%),
        linear-gradient(180deg,#05111f,#0b2238)
        `;

    }

    bg.style.background = gradient;

    const circle = document.querySelector(".progressCircle");

    if(score>=85){

        circle.style.stroke="#33f2a5";

    }else if(score>=65){

        circle.style.stroke="#f5c542";

    }else{

        circle.style.stroke="#ff5b6e";

    }

}

// ==========================================
// CARD ANIMATION
// ==========================================

function animateCards(){

    const cards=document.querySelectorAll(".card");

    cards.forEach((card,index)=>{

        card.style.opacity=0;
        card.style.transform="translateY(40px)";

        setTimeout(()=>{

            card.style.transition=".6s";

            card.style.opacity=1;

            card.style.transform="translateY(0px)";

        },200+(index*120));

    });

}